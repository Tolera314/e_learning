"use client";

import { 
  Plus, 
  Video, 
  Users, 
  Calendar, 
  Clock, 
  MoreVertical,
  PlayCircle
} from "lucide-react";

export default function LiveClasses() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Teaching</h1>
          <p className="text-gray-500 mt-2">Schedule and manage live interactive sessions for your students.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all text-center justify-center">
          <Plus size={20} />
          Schedule Session
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* UPCOMING SESSIONS */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Sessions</h2>
            
            {[
              { title: "Calculus Q&A: Derivatives", course: "Advanced Calculus", date: "Today, Oct 28", time: "4:00 PM", students: 124 },
              { title: "Mechanics Problem Solving", course: "Physics Fundamentals", date: "Tomorrow, Oct 29", time: "10:30 AM", students: 45 },
            ].map((session, i) => (
               <div key={i} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex flex-col items-center justify-center shrink-0">
                     <Calendar size={20} />
                     <span className="text-[10px] font-bold mt-1 uppercase">Live</span>
                  </div>
                  <div className="flex-1">
                     <h3 className="font-bold text-gray-900 dark:text-white">{session.title}</h3>
                     <p className="text-xs text-gray-500 mb-4">{session.course}</p>
                     <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                           <Clock size={14} className="text-emerald-500" /> {session.date} • {session.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                           <Users size={14} className="text-blue-500" /> {session.students} Registered
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button className="px-6 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-colors">
                        Launch
                     </button>
                     <button className="p-2.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <MoreVertical size={20} />
                     </button>
                  </div>
               </div>
            ))}

            <button className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 font-bold text-sm hover:border-emerald-500 hover:text-emerald-500 transition-all">
               + Schedule another session
            </button>
         </div>

         {/* RECENT RECORDINGS */}
         <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Past Recordings</h2>
            <div className="space-y-4">
               {[
                 { title: "Intro to Integration", date: "Oct 24", duration: "1h 12m" },
                 { title: "Newton's Laws Wrap-up", date: "Oct 21", duration: "58m" },
               ].map((rec, i) => (
                  <div key={i} className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 group cursor-pointer">
                     <div className="relative w-20 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                        <PlayCircle size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{rec.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-1">{rec.date} • {rec.duration}</p>
                     </div>
                  </div>
               ))}
            </div>
            <button className="w-full py-3 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors">View All Recordings</button>
         </div>
      </div>
    </div>
  );
}
