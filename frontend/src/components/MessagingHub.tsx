"use client";

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Send, Search, UserCircle, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { socketService } from "@/lib/socket";

interface Conversation {
  id: string;
  title: string;
  avatar: string | null;
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export default function MessagingHub() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) setUserId(user.id);
    fetchConversations();
    
    // Connect to WebSocket explicitly
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('user:join');
      
      socket.on('new_message', (msg: Message) => {
        // If message belongs to active thread
        if (msg.conversationId === activeConvId) {
          setMessages(prev => [...prev, msg]);
          scrollToBottom();
          // Mark it as read
          api.patch(`/messages/conversations/${activeConvId}/read`).catch(() => {});
        } else {
          // Otherwise play sound or toast...
        }
        
        // Re-fetch conversations to bump the active one to the top
        fetchConversations();
      });
    }

    return () => {
      if (socket) socket.off('new_message');
    };
  }, [activeConvId]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  const loadConversation = async (id: string) => {
    setActiveConvId(id);
    try {
      const { data } = await api.get(`/messages/conversations/${id}`);
      setMessages(data);
      scrollToBottom();
      // Mark read
      await api.patch(`/messages/conversations/${id}/read`);
      // Update local unread count
      setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    try {
      const payload = { conversationId: activeConvId, content: newMessage };
      const { data } = await api.post('/messages', payload);
      setMessages(prev => [...prev, data]);
      setNewMessage("");
      scrollToBottom();
      fetchConversations(); // Update side nav timestamp
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const filteredConversations = conversations.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm h-[calc(100vh-140px)] max-h-[900px]">
      
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 border-r border-gray-100 dark:border-gray-800 flex flex-col min-w-[300px]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No conversations found.</div>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full text-left p-4 flex items-center gap-4 transition-colors border-b border-gray-50 dark:border-gray-800/50 ${activeConvId === conv.id ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold relative shrink-0">
                  {conv.avatar ? (
                    <img src={conv.avatar} alt={conv.title} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserCircle size={28} />
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-[#111] rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`font-bold truncate ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {conv.title}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {format(new Date(conv.lastMessage.createdAt), 'hh:mm a')}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className={`text-xs truncate ${conv.unreadCount > 0 && String(conv.lastMessage.senderId) !== String(userId) ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}>
                      {String(conv.lastMessage.senderId) === String(userId) ? "You: " : ""}{conv.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeConvId ? (
        <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-[#0a0a0a]">
          {/* Header */}
          <div className="h-20 px-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 bg-white dark:bg-[#111]">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold">
               {conversations.find(c => c.id === activeConvId)?.title?.[0] || <UserCircle />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {conversations.find(c => c.id === activeConvId)?.title}
              </h3>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => {
              const isMine = String(msg.senderId) === String(userId);
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] px-5 py-3 rounded-2xl ${
                    isMine 
                      ? 'bg-emerald-600 text-white rounded-br-sm' 
                      : 'bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-800'
                  }`}>
                    <p className="text-[15px]">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {format(new Date(msg.createdAt), 'MMM dd, hh:mm a')}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white dark:bg-[#111] border-t border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 dark:text-white transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                <Send size={20} className="ml-1" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={32} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select a Conversation</h3>
          <p className="text-gray-500 mt-2">Choose an active thread from the left or start a new one.</p>
        </div>
      )}
    </div>
  );
}
