"use client";

import { useState, useEffect } from "react";
import {
   Users,
   Clock,
   Play,
   StopCircle,
   MicOff,
   Monitor,
   Video,
   ChevronRight,
   TrendingUp,
   AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { socketService } from "@/lib/socket";
import JitsiMeeting from "./JitsiMeeting";

interface LiveSession {
   id: string;
   title: string;
   course: { title: string };
   startTime: string;
   duration: number;
   enrolledCount: number;
   attendedCount: number;
   participationRate: number;
   status: 'upcoming' | 'active' | 'completed';
}

export default function LiveClassMonitor() {
   const [sessions, setSessions] = useState<LiveSession[]>([]);
   const [loading, setLoading] = useState(true);
   const [activeRoom, setActiveRoom] = useState<{ name: string; sessionTitle: string } | null>(null);

   useEffect(() => {
      const fetchSessions = async () => {
         try {
            const response = await api.get('/instructor/live-sessions');
            setSessions(response.data);
         } catch (err) {
            console.error('Failed to fetch live sessions:', err);
         } finally {
            setLoading(false);
         }
      };

      fetchSessions();

      const token = localStorage.getItem('token');
      if (token) {
         const socket = socketService.connect(token);
         socket.on('session:update', (updatedSession: LiveSession) => {
            setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
         });
         return () => {
            socket.off('session:update');
         };
      }
   }, []);

   if (loading) return <div className="h-96 bg-gray-50 dark:bg-gray-900/50 animate-pulse rounded-[3rem]" />;

   return (
      <div className="space-y-8">
         {/* HEADER STATS */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { label: "Active Sessions", value: sessions.filter(s => s.status === 'active').length.toString(), icon: Video, color: "text-emerald-500", bg: "bg-emerald-50" },
               { label: "Avg. Attendance", value: sessions.length ? `${Math.round(sessions.reduce((acc, s) => acc + s.participationRate, 0) / sessions.length)}%` : '0%', icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
               { label: "Participation", value: "High", icon: Users, color: "text-purple-500", bg: "bg-purple-50" }
            ].map((stat, i) => (
               <div key={i} className="p-6 bg-white dark:bg-[#111] rounded-[2rem] border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} dark:bg-opacity-10 flex items-center justify-center ${stat.color}`}>
                     <stat.icon size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</p>
                     <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
               </div>
            ))}
         </div>

         {/* SESSIONS LIST */}
         <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest pl-2">Session Monitoring</h3>
            {sessions.map(session => (
               <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-8 rounded-[2.5rem] border transition-all ${session.status === 'active' ? 'bg-white dark:bg-[#111] border-emerald-500/20 shadow-xl shadow-emerald-500/5' : 'bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800'}`}
               >
                  <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center">
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                           <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${session.status === 'active' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                              {session.status}
                           </span>
                           <span className="text-[10px] font-bold text-gray-400">{session.course.title}</span>
                        </div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white">{session.title}</h4>
                        <div className="flex items-center gap-6 mt-4 text-gray-500 text-xs font-bold">
                           <div className="flex items-center gap-2"><Clock size={16} /> {session.startTime} ({session.duration} mins)</div>
                           <div className="flex items-center gap-2"><Users size={16} /> {session.attendedCount} / {session.enrolledCount} Joined</div>
                        </div>
                     </div>
                     <div className="w-full xl:w-64">
                        <div className="flex justify-between items-end mb-2">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance</p>
                           <p className="text-lg font-black text-emerald-500">{session.participationRate}%</p>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${session.participationRate}%` }}
                              className="h-full bg-emerald-500"
                           />
                        </div>
                     </div>
                     <div className="flex gap-3 w-full xl:w-auto">
                        {session.status === 'active' ? (
                           <>
                              <button className="flex-1 xl:flex-none px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                                 <StopCircle size={18} /> End
                              </button>
                              <button className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl hover:bg-emerald-500 hover:text-white transition-all">
                                 <MicOff size={20} />
                              </button>
                              <button className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl hover:bg-emerald-500 hover:text-white transition-all">
                                 <Monitor size={20} />
                              </button>
                           </>
                        ) : (
                           <button
                              onClick={() => setActiveRoom({ name: `EDA-Session-${session.id}`, sessionTitle: session.title })}
                              className="w-full xl:w-auto px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-gray-500/20"
                           >
                              <Play size={18} /> Start Session
                           </button>
                        )}
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* JITSI MEETING OVERLAY */}
         <AnimatePresence>
            {activeRoom && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl p-4 md:p-10 flex flex-col"
               >
                  <div className="flex justify-between items-center mb-6">
                     <div>
                        <h2 className="text-white text-2xl font-black">{activeRoom.sessionTitle}</h2>
                        <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Live Instructor Control Panel</p>
                     </div>
                     <button
                        onClick={() => setActiveRoom(null)}
                        className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-xs hover:bg-red-600 transition-all"
                     >
                        Close Session
                     </button>
                  </div>
                  <div className="flex-1 bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                     <JitsiMeeting
                        roomName={activeRoom.name}
                        userName="Instructor" // In real app, use user.name
                        onClose={() => setActiveRoom(null)}
                     />
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* RECENT QUESTIONS / ACTIVITY OVERVIEW */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
               <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Recent Participation</h4>
               <div className="space-y-4">
                  {[
                     { user: "Abebe K.", action: "Just joined", time: "2 mins ago" },
                     { user: "Sarah M.", action: "Raised hand", time: "5 mins ago" },
                     { user: "John D.", action: "Posted a question", time: "12 mins ago" }
                  ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-800/50">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-[10px]">
                              {item.user[0]}
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-gray-900 dark:text-white">{item.user}</p>
                              <p className="text-[10px] text-gray-500 font-bold">{item.action}</p>
                           </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">{item.time}</span>
                     </div>
                  ))}
               </div>
            </div>
            <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Video size={120} />
               </div>
               <h4 className="text-sm font-black uppercase tracking-widest mb-2">Live Session Tips</h4>
               <p className="text-sm font-medium opacity-80 leading-relaxed mb-6">Engagement is 40% higher when you share your screen for practical demonstrations!</p>
               <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-black text-xs flex items-center gap-2">
                  View Teaching Guide <ChevronRight size={16} />
               </button>
            </div>
         </div>
      </div>
   );
}
