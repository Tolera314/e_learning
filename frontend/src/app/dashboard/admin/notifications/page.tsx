"use client";

import { useState } from "react";
import { 
  Bell, 
  Send, 
  Users, 
  GraduationCap, 
  Shield, 
  Megaphone, 
  Loader2,
  Trash2,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function GlobalNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const handleBroadcast = async () => {
    if (!title || !message) return toast.error("Please fill all fields");
    
    setLoading(true);
    try {
      await api.post("/admin/notifications/broadcast", { title, message, type: 'SYSTEM' });
      toast.success("Broadcast sent successfully!");
      setTitle("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Megaphone className="text-emerald-600" size={32} />
            Global Announcements
          </h1>
          <p className="text-gray-500 mt-1">Broadcast important updates and alerts to the entire platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Composer */}
        <div className="bg-white dark:bg-[#111] p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Bell className="text-blue-500" />
              New Announcement
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Scheduled Maintenance" 
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Audience</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'ALL', label: 'Everyone', icon: <Users size={16} /> },
                    { id: 'STUDENT', label: 'Students', icon: <GraduationCap size={16} /> },
                    { id: 'INSTRUCTOR', label: 'Instructors', icon: <Shield size={16} /> }
                  ].map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => setTarget(t.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        target === t.id 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                          : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {t.icon}
                      <span className="text-[10px] font-bold uppercase">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detailed Content</label>
                <textarea 
                  rows={5}
                  placeholder="Type your announcement here..." 
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button 
                onClick={handleBroadcast}
                disabled={loading}
                className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                Send Broadcast Now
              </button>
            </div>
          </div>
        </div>

        {/* History / Recent Hub */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white px-2">Recent Notifications</h3>
          
          <div className="space-y-4">
            {[
              { title: "Service Restored", date: "2 Hours ago", audience: "All", status: "Sent" },
              { title: "New Feature: Certificates", date: "Yesterday", audience: "Students", status: "Sent" },
              { title: "Instructor Policy Update", date: "3 Days ago", audience: "Instructors", status: "Sent" }
            ].map((n, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{n.title}</h4>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{n.date} • {n.audience}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <h4 className="text-lg font-bold relative z-10">Real-time Reach</h4>
            <p className="text-emerald-100 text-sm mt-1 relative z-10">Your messages reach active users instantly via WebSockets.</p>
            <div className="mt-6 flex items-baseline gap-2 relative z-10">
              <span className="text-4xl font-black">94%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">Delivery Accuracy</span>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
