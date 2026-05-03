"use client";

import { useState } from "react";
import { 
  Video, 
  Search, 
  Users, 
  Radio, 
  Clock, 
  Monitor, 
  Eye, 
  Loader2,
  AlertCircle,
  XCircle,
  MoreVertical,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const MOCK_SESSIONS = [
  { id: "1", title: "Advanced Quantum Physics Live", instructor: "Ahmed Z.", status: "LIVE", viewers: 42, startTime: "Ongoing" },
  { id: "2", title: "Amharic Grammar Workshop", instructor: "Hirut T.", status: "UPCOMING", viewers: 0, startTime: "Starts in 15m" },
  { id: "3", title: "Python Data Structures", instructor: "Dawit S.", status: "LIVE", viewers: 128, startTime: "Ongoing" },
  { id: "4", title: "Business Strategy G12", instructor: "Sara M.", status: "UPCOMING", viewers: 0, startTime: "Starts in 2h" }
];

export default function LiveSessionMonitor() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [loading, setLoading] = useState(false);

  const endSession = (id: string) => {
    if (confirm("Are you sure you want to forcibly end this session?")) {
      setSessions(sessions.filter(s => s.id !== id));
      toast.success("Session terminated by admin.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Radio className="text-red-500 animate-pulse" size={32} />
            Live Network Monitor
          </h1>
          <p className="text-gray-500 mt-1">Real-time oversight of ongoing and upcoming academic broadcasts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 shadow-sm">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111]" />
              <div className="w-8 h-8 rounded-full bg-emerald-400 border-2 border-white dark:border-[#111]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Streams</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {sessions.map((session, idx) => (
            <motion.div 
              key={session.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-[#111] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 ${
                    session.status === 'LIVE' 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/20' 
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${session.status === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
                    {session.status}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{session.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">by {session.instructor}</p>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{session.viewers}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{session.startTime}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-2">
                <button className="flex-1 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                  <Eye size={16} /> Audit
                </button>
                {session.status === 'LIVE' && (
                  <button 
                    onClick={() => endSession(session.id)}
                    className="p-3 border-2 border-red-50 text-red-600 rounded-2xl hover:bg-red-50 transition-all"
                  >
                    <XCircle size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
