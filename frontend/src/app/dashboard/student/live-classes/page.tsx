"use client";

import { 
  Plus, 
  Video, 
  Users, 
  Calendar, 
  Clock, 
  ChevronRight,
  PlayCircle,
  Search
} from "lucide-react";
import { motion } from "framer-motion";

const UPCOMING_LIVE = [
  { id: "1", title: "Calculus Q&A: Derivatives", instructor: "Dr. Abebe Kebede", date: "Today", time: "4:00 PM", active: true },
  { id: "2", title: "Physics: Mechanics Recap", instructor: "Prof. Sara Tesfaye", date: "Oct 30", time: "10:30 AM", active: false },
];

const PAST_RECORDINGS = [
  { id: "101", title: "Limits and Continuity", course: "Advanced Calculus", date: "Oct 24", duration: "1h 12m" },
  { id: "102", title: "Intro to Kinematics", course: "Physics Fundamentals", date: "Oct 21", duration: "58m" },
  { id: "103", title: "The Cell Structure", course: "Biology G11", date: "Oct 18", duration: "1h 05m" },
];

export default function StudentLiveClasses() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Learning Board</h1>
          <p className="text-gray-500 mt-2">Join live interactive sessions and watch past class recordings.</p>
        </div>
        <div className="relative">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
           <input type="text" placeholder="Search sessions..." className="pl-12 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm w-full md:w-64" />
        </div>
      </header>

      {/* UPCOMING SESSIONS */}
      <section>
         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Scheduled Sessions</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {UPCOMING_LIVE.map((session) => (
               <motion.div 
                 key={session.id} 
                 whileHover={{ y: -5 }}
                 className={`p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group ${session.active ? 'bg-emerald-600 border-none text-white' : 'bg-white dark:bg-[#111]'}`}
               >
                  <div className="relative z-10 flex flex-col h-full">
                     <div className="flex items-center gap-2 mb-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${session.active ? 'bg-white/20 border border-white/20 text-white' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                           {session.active ? 'Live Now' : 'Upcoming'}
                        </span>
                     </div>
                     <h3 className={`text-xl font-bold mb-2 ${session.active ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{session.title}</h3>
                     <p className={`text-sm mb-8 ${session.active ? 'text-emerald-100' : 'text-gray-500'}`}>Instructor: {session.instructor}</p>
                     
                     <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1.5 text-xs font-bold">
                              <Calendar size={14} /> {session.date}
                           </div>
                           <div className="flex items-center gap-1.5 text-xs font-bold">
                              <Clock size={14} /> {session.time}
                           </div>
                        </div>
                        <button className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${session.active ? 'bg-white text-emerald-700 hover:bg-emerald-50' : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-emerald-600'}`}>
                           {session.active ? 'Join Now' : 'Set Reminder'}
                        </button>
                     </div>
                  </div>
                  {session.active && (
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  )}
               </motion.div>
            ))}
         </div>
      </section>

      {/* PAST RECORDINGS */}
      <section>
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Past Recordings</h2>
            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View All</button>
         </div>
         <div className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-gray-50 dark:border-gray-800">
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Class Information</th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Date</th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Duration</th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                     {PAST_RECORDINGS.map((recording) => (
                        <tr key={recording.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                                    <PlayCircle size={24} className="text-emerald-500" />
                                 </div>
                                 <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{recording.title}</p>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{recording.course}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-sm font-medium text-gray-600 dark:text-gray-400">{recording.date}</td>
                           <td className="px-8 py-6 text-sm font-medium text-gray-600 dark:text-gray-400">{recording.duration}</td>
                           <td className="px-8 py-6 text-right">
                              <button className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-xl transition-all">
                                 <ChevronRight size={20} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </section>
    </div>
  );
}
