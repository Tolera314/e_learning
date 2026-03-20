'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageCircle, Heart, Trash2, Pin, ShieldAlert, ArrowRight, CornerDownRight, User, Megaphone, MessageSquare, X } from 'lucide-react';
import api from '@/lib/api';
import { socketService } from '@/lib/socket';

interface Author {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface Reaction {
  userId: string;
  type: string;
}

interface Reply {
  id: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  author: Author;
  parentId: string | null;
  reactions: Reaction[];
  children?: Reply[];
}

interface Thread {
  id: string;
  courseId: string;
  title: string;
  content: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  status: string;
  createdAt: string;
  author: Author;
  reactions: Reaction[];
  replies: Reply[];
}

interface DiscussionThreadViewProps {
  threadId: string;
  courseId: string;
  userRole: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  onBack: () => void;
}

export default function DiscussionThreadView({ threadId, courseId, userRole, onBack }: DiscussionThreadViewProps) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Store current local user id if available in a safe way without needing specific context
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to decode user ID from local JWT purely for UI styling (not auth check)
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      }
    } catch {}
  }, []);

  const fetchThread = useCallback(async () => {
    try {
      const res = await api.get(`/api/discussions/${threadId}`);
      setThread(res.data);
    } catch (err) {
      console.error("Failed to fetch thread:", err);
      setErrorMsg("Error loading thread details");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;
    
    // The parent component already joined `course_${courseId}`, but we listen here too.
    const handleNewReply = (newReply: any) => {
      // If the reply belongs to this thread, we re-fetch to resolve nested graph simply.
      // Realistically we could manually inject it, but re-fetching ensures perfect child ordering.
      if (newReply.threadId === threadId) {
        fetchThread();
      }
    };
    
    const handleModerated = (data: any) => {
      if (data.threadId === threadId) {
        if (data.action === 'DELETE') {
          onBack(); 
        } else {
          fetchThread();
        }
      }
    };

    socket.on('new_reply', handleNewReply);
    socket.on('thread_moderated', handleModerated);

    return () => {
      socket.off('new_reply', handleNewReply);
      socket.off('thread_moderated', handleModerated);
    };
  }, [courseId, threadId, fetchThread, onBack]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.post(`/api/discussions/${threadId}/replies`, {
        content: replyContent,
        parentId: replyingTo?.id || undefined
      });
      setReplyContent('');
      setReplyingTo(null);
      fetchThread(); // Wait for socket or manual refresh
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReaction = async (replyId?: string) => {
    try {
      await api.post(`/api/discussions/${threadId}/react`, {
        replyId,
        type: 'HEART'
      });
      fetchThread(); // Optimistic update would be better in prod, simplistic refresh for now
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  const handleModerateThread = async (action: string) => {
    try {
      await api.patch(`/api/instructor/discussions/${threadId}/moderate`, { action });
      if (action === 'DELETE') onBack();
      else fetchThread();
    } catch (err) {
      console.error("Moderation error:", err);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      await api.delete(`/api/instructor/replies/${replyId}`);
      fetchThread();
    } catch (err) {
      console.error("Failed to delete reply:", err);
    }
  };

  const ReplyComponent = ({ reply, depth = 0 }: { reply: Reply, depth?: number }) => {
    const isAuthor = currentUserId === reply.author.id;
    const isInstructor = reply.author.role === 'INSTRUCTOR' || reply.author.role === 'ADMIN';
    const hasLiked = reply.reactions?.some(r => r.userId === currentUserId);
    
    return (
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex gap-3 mb-4`}
      >
        {/* Indentation markers for deep nests */}
        {depth > 0 && Array.from({ length: depth }).map((_, i) => (
           <div key={i} className="w-4 sm:w-8 border-l-2 border-gray-100 dark:border-gray-800 ml-2" />
        ))}
        
        <div className="flex-1 min-w-0">
          <div className={`p-4 rounded-xl ${isAuthor ? 'bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {reply.author.avatar ? (
                    <img src={reply.author.avatar} alt="" className="w-full h-full object-cover" />
                  ) : <User size={12} className="text-gray-500" />}
                </div>
                <span className={`text-sm font-medium ${isInstructor ? 'text-secondary-600 dark:text-secondary-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {reply.author.name} {isAuthor && '(You)'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(reply.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && !reply.isDeleted && (
                <button 
                  onClick={() => handleDeleteReply(reply.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-gray-800 rounded-md p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-700" 
                  title="Delete Reply"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            
            <div className={`text-sm ${reply.isDeleted ? 'text-gray-400 italic' : 'text-gray-800 dark:text-gray-200'} whitespace-pre-wrap leading-relaxed`}>
              {reply.isDeleted ? '[This reply was removed by a moderator]' : reply.content}
            </div>
            
            {!reply.isDeleted && (
              <div className="mt-3 flex items-center gap-4 text-sm font-medium">
                <button 
                  onClick={() => handleToggleReaction(reply.id)}
                  className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <Heart size={14} className={hasLiked ? 'fill-current' : ''} />
                  <span>{reply.reactions?.length || 0}</span>
                </button>
                <button 
                  onClick={() => setReplyingTo({ id: reply.id, name: reply.author.name })}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <CornerDownRight size={14} />
                  Reply
                </button>
              </div>
            )}
          </div>
          
          {reply.children && reply.children.length > 0 && (
            <div className="mt-4">
              {reply.children.map(child => (
                <ReplyComponent key={child.id} reply={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  if (!thread) return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 items-center justify-center p-6">
      <ShieldAlert size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thread not found</h3>
      <button onClick={onBack} className="mt-4 text-primary-600 hover:underline">Go Back</button>
    </div>
  );

  const hasLikedThread = thread.reactions?.some(r => r.userId === currentUserId);
  const isInstructor = userRole === 'INSTRUCTOR' || userRole === 'ADMIN';

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Forums
        </button>
        
        {isInstructor && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleModerateThread(thread.isPinned ? 'UNPIN' : 'PIN')}
              className={`p-2 rounded-lg text-sm font-medium transition-colors border ${thread.isPinned ? 'bg-secondary-50 border-secondary-200 text-secondary-700 dark:bg-secondary-900/30 dark:border-secondary-700/50' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'}`}
              title={thread.isPinned ? "Unpin thread" : "Pin thread"}
            >
              <Pin size={16} className={thread.isPinned ? 'fill-current text-primary-600 dark:text-primary-400' : ''} />
            </button>
            <button 
              onClick={() => handleModerateThread('DELETE')}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete completely"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
        
        {/* Original Post */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {thread.isAnnouncement && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Megaphone size={12} /> Announcement
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {thread.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
               {thread.author.avatar ? <img src={thread.author.avatar} alt="" className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500" />}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {thread.author.name} {isInstructor && <span className="text-primary-600 dark:text-primary-400 font-normal ml-1 border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded text-xs">Instructor</span>}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Posted on {new Date(thread.createdAt).toLocaleDateString()} at {new Date(thread.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed max-w-none text-[15px] sm:text-base selection:bg-primary-100 dark:selection:bg-primary-900/50">
            {thread.content}
          </div>
          
          <div className="mt-8 flex items-center gap-4">
            <button 
              onClick={() => handleToggleReaction()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${hasLikedThread ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/50' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'}`}
            >
              <Heart size={16} className={hasLikedThread ? 'fill-current text-red-500' : ''} />
              {thread.reactions?.length || 0} Likes
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
              <MessageCircle size={16} />
              {thread.replies?.length || 0} Responses
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mb-6 pl-2 sm:pl-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 pl-2 border-l-4 border-primary-500">
            Discussion ({thread.replies?.length || 0})
          </h3>
          
          <div className="space-y-3">
            {thread.replies?.length > 0 ? (
              thread.replies.map(reply => (
                <ReplyComponent key={reply.id} reply={reply} depth={0} />
              ))
            ) : (
              <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center">
                <MessageSquare size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No replies yet. Be the first to join the conversation!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Input Sticky Footer */}
      <div className="fixed bottom-0 md:absolute md:bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-none z-20">
        <div className="max-w-5xl mx-auto">
          {errorMsg && (
             <div className="mb-2 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 py-1.5 px-3 rounded-lg w-fit border border-red-100 dark:border-red-900/30">
               {errorMsg}
             </div>
          )}
          
          <AnimatePresence>
            {replyingTo && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mb-2 px-1 overflow-hidden"
              >
                <div className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-300 font-medium bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800/50 px-3 py-1.5 rounded-full w-fit">
                  <CornerDownRight size={14} /> Replying to {replyingTo.name}
                  <button 
                  onClick={() => setReplyingTo(null)}
                  className="ml-1 text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 transition-colors p-0.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800"
                >
                  <X size={12} />
                </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleSubmitReply} className="flex gap-3 items-end">
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder={replyingTo ? `Write a reply to ${replyingTo.name}...` : "Write a response to the thread..."}
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all h-[52px] min-h-[52px] max-h-32 shadow-inner"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmitReply(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting || !replyContent.trim()}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl px-5 font-semibold transition-colors flex items-center gap-2 h-[52px] shadow-sm"
            >
              <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mt-1.5 pl-2 hidden sm:block">Press Ctrl+Enter to post</div>
        </div>
      </div>
    </div>
  );
}
