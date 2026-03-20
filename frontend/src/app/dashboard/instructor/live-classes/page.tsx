"use client";

import {
   Plus,
   Video,
   Users,
   Calendar,
   Clock,
   MoreVertical,
   PlayCircle,
   Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import ScheduleSessionModal from "@/components/ScheduleSessionModal";

interface Session {
   id: string;
   title: string;
   courseName: string;
   startTime: string;
   duration: string;
   attendedCount: number;
   status: 'active' | 'completed' | 'upcoming';
}

export default function LiveClasses() {
   const [sessions, setSessions] = useState<Session[]>([]);
   const [loading, setLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);

   const fetchSessions = async () => {
      setLoading(true);
      try {
         const response = await api.get("/instructor/live-sessions");
         setSessions(response.data);
      } catch (error) {
         console.error("Failed to fetch live sessions:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchSessions();
   }, []);

   return (
      <div className="max-w-7xl mx-auto">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">Live Teaching</h1>
               <p className="text-gray-500 mt-2">Schedule and manage live interactive sessions for your students.</p>
            </div>
            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all text-center justify-center transform active:scale-95"
            >
               <Plus size={20} />
               Schedule Session
            </button>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* UPCOMING SESSIONS */}
            <div className="lg:col-span-2 space-y-6">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Sessions</h2>

               {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
                     <Loader2 size={40} className="text-emerald-500 animate-spin mb-4" />
                     <p className="text-gray-500 font-medium">Fetching sessions...</p>
                  </div>
               ) : sessions.length === 0 ? (
                  <div className="p-12 text-center bg-gray-50/50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
                     <Video size={48} className="text-gray-300 mx-auto mb-4" />
                     <p className="text-gray-500 font-medium">No live sessions scheduled yet.</p>
                     <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 text-emerald-600 font-bold hover:underline"
                     >
                        Schedule your first session
                     </button>
                  </div>
               ) : (
                  sessions.filter(s => s.status !== 'completed').map((session, i) => (
                     <div key={i} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6 group hover:border-emerald-500/30 transition-all">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex flex-col items-center justify-center shrink-0">
                           <Calendar size={20} />
                           <span className="text-[10px] font-bold mt-1 uppercase">Live</span>
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 dark:text-white">{session.title}</h3>
                              {session.status === 'active' && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                           </div>
                           <p className="text-xs text-gray-500 mb-4">{session.courseName}</p>
                           <div className="flex flex-wrap gap-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                 <Clock size={14} className="text-emerald-500" /> {new Date(session.startTime).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                 <Users size={14} className="text-blue-500" /> {session.attendedCount} Registered
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <button className="px-6 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-colors">
                              {session.status === 'active' ? 'Go Live' : 'Launch'}
                           </button>
                           <button className="p-2.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                              <MoreVertical size={20} />
                           </button>
                        </div>
                     </div>
                  ))
               )}

               <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem] text-gray-400 font-bold text-sm hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-50/10 transition-all group"
               >
                  <span className="flex items-center justify-center gap-2">
                     <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                     Schedule another session
                  </span>
               </button>
            </div>

            {/* RECENT RECORDINGS placeholder - remains similar but with some logic if needed */}
            <div className="space-y-6">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Past Recordings</h2>
               <div className="space-y-4">
                  {sessions.filter(s => s.status === 'completed').length === 0 ? (
                     <p className="text-xs text-gray-400 text-center py-10 bg-gray-50/30 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">No recordings available yet.</p>
                  ) : (
                     sessions.filter(s => s.status === 'completed').map((rec, i) => (
                        <div key={i} className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 group cursor-pointer">
                           <div className="relative w-20 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                              <PlayCircle size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                           </div>
                           <div>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{rec.title}</h4>
                              <p className="text-[10px] text-gray-500 mt-1">{new Date(rec.startTime).toLocaleDateString()} • {rec.duration}</p>
                           </div>
                        </div>
                     ))
                  )}
               </div>
               <button className="w-full py-3 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors">View All Recordings</button>
            </div>
         </div>

         <ScheduleSessionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchSessions}
         />
      </div>
   );
}
