"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StickyNote,
  Bookmark,
  MessageSquare,
  Search,
  Plus,
  Trash2,
  Clock,
  ArrowRight
} from "lucide-react";

import api from "@/lib/api";
import { socketService } from "@/lib/socket";
import { useEffect, useRef } from "react";

interface Note {
  id: string;
  timestamp: string;
  content: string;
  lessonTitle: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function LearningTools() {
  const [activeTab, setActiveTab] = useState<"notes" | "bookmarks" | "ask">("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && activeTab === 'ask') {
      const socket = socketService.connect(token);

      socket.on('chat:message', (msg: Message) => {
        setMessages(prev => [...prev, msg]);
      });

      return () => {
        socket.off('chat:message');
      };
    }
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      const response = await api.post('/student/notes', { content: newNote });
      setNotes([response.data, ...notes]);
      setNewNote("");
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('chat:send', { text: inputMessage });
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: inputMessage, timestamp: new Date() }]);
      setInputMessage("");
    }
  };

  return (
    <div className="h-full bg-white dark:bg-[#111] border-l border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
      {/* TABS */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        {[
          { id: "notes", icon: StickyNote, label: "Notes" },
          { id: "bookmarks", icon: Bookmark, label: "Bookmarks" },
          { id: "ask", icon: MessageSquare, label: "AI Help" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all ${activeTab === tab.id
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
              : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <tab.icon size={20} className="mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Take a note at 05:12..."
                  className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium resize-none placeholder:text-gray-400"
                />
                <button
                  onClick={addNote}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {notes.map(note => (
                  <div key={note.id} className="p-4 bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-bold text-gray-500">{note.timestamp}</span>
                        <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px]">{note.lessonTitle}</span>
                      </div>
                      <button className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'bookmarks' && (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {[
                { time: "01:20", label: "Introduction" },
                { time: "05:45", label: "The Power Rule" },
                { time: "12:10", label: "Example Problems" }
              ].map((b, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 group transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center text-emerald-600 shadow-sm">
                      <Clock size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-600">{b.label}</p>
                      <p className="text-[10px] font-medium text-gray-400">{b.time}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                Bookmark Current Time
              </button>
            </motion.div>
          )}

          {activeTab === 'ask' && (
            <motion.div
              key="ask"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] p-4 flex flex-col overflow-y-auto space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                      <MessageSquare size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Need help?</h3>
                    <p className="text-xs text-gray-500 font-medium mb-6">Ask a question about the current lesson and get instant help from our AI.</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium ${msg.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="mt-4 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your question..."
                  className="w-full p-4 pr-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
                <button
                  onClick={sendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
