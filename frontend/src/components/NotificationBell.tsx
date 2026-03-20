"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { socketService } from '@/lib/socket';
import api from '@/lib/api';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Listen for new notifications via WebSocket
    const socket = socketService.getSocket();
    if (socket) {
      // Ensure we are in the private user room
      socket.emit('user:join');

      socket.on('new_notification', (newNotif: Notification) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Optional: play a subtle sound or show a toast here
      });
    }

    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      if (socket) socket.off('new_notification');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=10');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const getIconColor = (type: string) => {
    switch(type) {
      case 'COURSE': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'LIVE_CLASS': return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20';
      case 'ASSIGNMENT': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'QUIZ': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
      default: return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 flex flex-col max-h-[500px]"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <Bell className="text-gray-300" size={24} />
                  </div>
                  <p className="text-gray-500 text-sm">You have no notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${getIconColor(notif.type)}`}>
                          <Bell size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className={`text-sm font-semibold truncate pr-4 ${!notif.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap pt-0.5">
                              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{notif.message}</p>
                          
                          <div className="flex items-center gap-3">
                            {notif.linkUrl && (
                              <Link 
                                href={notif.linkUrl} 
                                onClick={() => markAsRead(notif.id)}
                                className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 hover:underline"
                              >
                                View Details <ExternalLink size={10} />
                              </Link>
                            )}
                            {!notif.isRead && (
                              <button 
                                onClick={() => markAsRead(notif.id)}
                                className="text-[11px] font-medium text-gray-400 flex items-center gap-1 hover:text-gray-700"
                              >
                                <Check size={10} /> Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-center bg-gray-50/50 dark:bg-gray-900/30">
              <Link href="/dashboard/settings/notifications" className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                Notification Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
