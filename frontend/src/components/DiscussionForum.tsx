'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Pin, Search, PlusCircle, Megaphone, Clock, User, X, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { socketService } from '@/lib/socket';
import DiscussionThreadView from './DiscussionThreadView';

interface Author {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  status: string;
  author: Author;
  _count: { replies: number; reactions: number };
  createdAt: string;
  updatedAt: string;
}

interface DiscussionForumProps {
  courseId: string;
  userRole: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export default function DiscussionForum({ courseId, userRole }: DiscussionForumProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ANNOUNCEMENTS' | 'PINNED'>('ALL');
  
  const [viewingThreadId, setViewingThreadId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPinnedArg, setIsPinnedArg] = useState(false);
  const [isAnnouncementArg, setIsAnnouncementArg] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const fetchThreads = useCallback(async () => {
    try {
      const res = await api.get(`/api/courses/${courseId}/discussions?search=${search}`);
      setThreads(res.data);
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, search]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('course:join', courseId);

    const handleNewThread = (thread: Thread) => {
      setThreads(prev => {
        const exists = prev.find(t => t.id === thread.id);
        if (exists) return prev;
        const newList = [thread, ...prev];
        return newList.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });
    };

    const handleNewReply = (reply: any) => {
      setThreads(prev => prev.map(t => {
        if (t.id === reply.threadId) {
          return { ...t, _count: { ...t._count, replies: t._count.replies + 1 }, updatedAt: new Date().toISOString() };
        }
        return t;
      }).sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }));
    };

    const handleModeration = ({ threadId, action }: any) => {
      if (action === 'DELETE') {
        setThreads(prev => prev.filter(t => t.id !== threadId));
        if (viewingThreadId === threadId) setViewingThreadId(null);
      } else {
        fetchThreads(); // Re-fetch on pin/lock
      }
    };

    socket.on('new_thread', handleNewThread);
    socket.on('new_reply', handleNewReply);
    socket.on('thread_moderated', handleModeration);

    return () => {
      socket.off('new_thread', handleNewThread);
      socket.off('new_reply', handleNewReply);
      socket.off('thread_moderated', handleModeration);
      socket.emit('course:leave', courseId);
    };
  }, [courseId, fetchThreads, viewingThreadId]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!newTitle.trim() || !newContent.trim()) {
      setSubmitError('Title and content are required.');
      return;
    }

    try {
      const res = await api.post(`/api/courses/${courseId}/discussions`, {
        title: newTitle,
        content: newContent,
        isPinned: isPinnedArg,
        isAnnouncement: isAnnouncementArg
      });
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
      setViewingThreadId(res.data.id);
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to create thread.');
    }
  };

  const filteredThreads = threads.filter(t => {
    if (filter === 'ANNOUNCEMENTS') return t.isAnnouncement;
    if (filter === 'PINNED') return t.isPinned;
    return true;
  });

  if (viewingThreadId) {
    return <DiscussionThreadView 
             threadId={viewingThreadId} 
             courseId={courseId}
             userRole={userRole} 
             onBack={() => setViewingThreadId(null)} 
           />;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-secondary-600 dark:text-secondary-400" />
            Course Discussions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ask questions, share insights, and discuss with peers.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <PlusCircle size={18} />
          <span>New Discussion</span>
        </button>
      </div>

      <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex bg-white dark:bg-gray-700 rounded-md p-1 shadow-sm w-full md:w-auto overflow-x-auto border border-gray-200 dark:border-gray-600">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          >
            All Threads
          </button>
          <button
            onClick={() => setFilter('PINNED')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 ${filter === 'PINNED' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          >
            <Pin size={14} /> Pinned
          </button>
          <button
            onClick={() => setFilter('ANNOUNCEMENTS')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 ${filter === 'ANNOUNCEMENTS' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          >
            <Megaphone size={14} /> Announcements
          </button>
        </div>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No discussions found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              There are no matching threads right now. Be the first to start a conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredThreads.map((thread) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setViewingThreadId(thread.id)}
                  className={`bg-white dark:bg-gray-800 border ${thread.isPinned || thread.isAnnouncement ? 'border-secondary-200 dark:border-secondary-900 shadow-md' : 'border-gray-200 dark:border-gray-700 shadow-sm'} rounded-xl p-4 sm:p-5 cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {thread.isAnnouncement && (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                            <Megaphone size={12} /> Announcement
                          </span>
                        )}
                        {thread.isPinned && (
                          <span className="inline-flex items-center gap-1 bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                            <Pin size={12} /> Pinned
                          </span>
                        )}
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {thread.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1 hidden sm:block">
                        {thread.content}
                      </p>
                      
                      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            {thread.author.avatar ? (
                               <img src={thread.author.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                               <User size={12} className="text-gray-500" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {thread.author.name}
                            {thread.author.role === 'INSTRUCTOR' && <span className="ml-1 text-primary-600 dark:text-primary-400">(Instructor)</span>}
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock size={12} />
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MessageCircle size={14} className="group-hover:text-primary-500 transition-colors" />
                            {thread._count.replies} Replies
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Start a Discussion</h3>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6">
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800/30">
                  {submitError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="What's on your mind?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Details</label>
                  <textarea
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="Provide details or context..."
                    required
                  />
                </div>

                {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
                  <div className="flex items-center gap-6 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isPinnedArg} 
                        onChange={e => setIsPinnedArg(e.target.checked)} 
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Pin Thread</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isAnnouncementArg} 
                        onChange={e => setIsAnnouncementArg(e.target.checked)} 
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Mark as Announcement</span>
                    </label>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-medium bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-colors"
                >
                  Post Discussion
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
