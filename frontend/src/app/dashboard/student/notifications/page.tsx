"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  MessageSquare,
  FileText,
  Video,
  Zap,
  Check,
  MoreVertical,
  Clock,
  Loader2,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  course:       <Zap size={22} />,
  deadline:     <FileText size={22} />,
  message:      <MessageSquare size={22} />,
  live:         <Video size={22} />,
  announcement: <Bell size={22} />,
};

const TYPE_COLOR: Record<string, string> = {
  course:       "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
  deadline:     "bg-red-50 text-red-600 dark:bg-red-900/20",
  message:      "bg-purple-50 text-purple-600 dark:bg-purple-900/20",
  live:         "bg-orange-50 text-orange-600 dark:bg-orange-900/20",
  announcement: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
};

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      const res = await api.get(`/notifications?page=${pageNum}&limit=15`);
      const data = res.data;
      setUnreadCount(data.unreadCount);
      setHasMore(data.notifications.length === 15);
      setNotifications((prev) =>
        append ? [...prev, ...data.notifications] : data.notifications
      );
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const markSingleRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
    setOpenMenu(null);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNotifications(next, true);
  };

  const typeKey = (type: string) => {
    const t = type?.toLowerCase();
    if (t?.includes("message")) return "message";
    if (t?.includes("live") || t?.includes("session")) return "live";
    if (t?.includes("deadline") || t?.includes("assignment")) return "deadline";
    if (t?.includes("course")) return "course";
    return "announcement";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={36} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">
            Notifications
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchNotifications(1)}
            className="p-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-emerald-600 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all disabled:opacity-60"
            >
              {markingAll ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Mark all read
            </button>
          )}
        </div>
      </header>

      {/* NOTIFICATIONS LIST */}
      {notifications.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
          <Inbox size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
          <p className="text-gray-400 font-bold text-sm">
            No notifications yet.
          </p>
          <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">
            You'll be notified about live classes, assignments, and messages here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111] rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <AnimatePresence initial={false}>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {notifications.map((notif) => {
                const key = typeKey(notif.type);
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-6 sm:p-8 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all flex gap-5 relative ${
                      !notif.isRead ? "bg-emerald-50/10 dark:bg-emerald-900/5" : ""
                    }`}
                    onClick={() => {
                      if (!notif.isRead) markSingleRead(notif.id);
                      if (notif.linkUrl) window.location.href = notif.linkUrl;
                    }}
                  >
                    {/* Unread accent */}
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />
                    )}

                    {/* Icon */}
                    <div
                      className={`w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        TYPE_COLOR[key] ?? TYPE_COLOR.announcement
                      }`}
                    >
                      {TYPE_ICON[key] ?? <Bell size={22} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-bold text-sm leading-snug ${
                            !notif.isRead
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {notif.title}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(notif.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed mt-1">
                        {notif.message}
                      </p>
                      {!notif.isRead && (
                        <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    {/* Context menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === notif.id ? null : notif.id);
                        }}
                        className="p-2 text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <MoreVertical size={18} />
                      </button>
                      <AnimatePresence>
                        {openMenu === notif.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-8 z-20 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden min-w-[160px]"
                          >
                            {!notif.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markSingleRead(notif.id);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <Check size={14} className="text-emerald-500" />
                                Mark as read
                              </button>
                            )}
                            {notif.linkUrl && (
                              <a
                                href={notif.linkUrl}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                View Details →
                              </a>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>
      )}

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-8"
          >
            Load more notifications
          </button>
        </div>
      )}
    </div>
  );
}
