"use client";

import { 
  BookOpen, 
  CheckCircle2, 
  Flame, 
  BarChart3, 
  Play, 
  ArrowRight,
  Bell,
  MessageSquare,
  FileText,
  HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";

const STATS = [
  { label: "Enrolled Courses", value: "8", icon: <BookOpen className="text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/10" },
  { label: "Completed Lessons", value: "24", icon: <CheckCircle2 className="text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/10" },
  { label: "Learning Streak", value: "12 Days", icon: <Flame className="text-orange-500" />, color: "bg-orange-50 dark:bg-orange-900/10" },
  { label: "Quiz Avg Score", value: "88%", icon: <BarChart3 className="text-purple-500" />, color: "bg-purple-50 dark:bg-purple-900/10" },
];

const ACTIVITIES = [
  { type: "quiz", title: "Advanced Calculus Quiz", result: "92/100", time: "2 hours ago" },
  { type: "feedback", title: "Physics Assignment Feedback", result: "Excellent work!", time: "5 hours ago" },
  { type: "announcement", title: "New Biology Course Available", result: "Modern Genetics", time: "1 day ago" },
  { type: "message", title: "Message from Dr. Abebe", result: "Welcome to the class!", time: "2 days ago" },
];

export default function StudentDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">Welcome back, Student! 👋</h1>
        <p className="text-gray-500 mt-2">Pick up where you left off and keep the learning momentum going.</p>
      </header>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {STATS.map((stat, i) => (
           <motion.div 
             key={i} 
             whileHover={{ y: -5 }}
             className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
           >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.color}`}>
                 {stat.icon}
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* CONTINUE LEARNING */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <Play size={20} className="text-emerald-600" /> Continue Learning
            </h2>
            <div className="bg-white dark:bg-[#111] p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-8 items-center group cursor-pointer hover:border-emerald-500 transition-all">
               <div className="w-full sm:w-48 h-32 bg-gray-100 dark:bg-gray-800 rounded-[2rem] overflow-hidden relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 flex items-center justify-center">
                     <BookOpen className="text-white/30" size={48} />
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] text-white font-bold uppercase tracking-wider">
                     Mathematics
                  </div>
               </div>
               <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div>
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">Advanced Calculus - Grade 12</h3>
                     <p className="text-sm text-gray-500 font-medium font-outfit">Current Lesson: Derivatives of Trigonometric Functions</p>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-emerald-600 rounded-full" 
                     />
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-emerald-600">65% Completed</span>
                     <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-bold text-sm hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all shadow-lg group-hover:scale-105">
                        Continue Lesson <ArrowRight size={16} />
                     </button>
                  </div>
               </div>
            </div>

            {/* UPCOMING LIVE CLASS CALLOUT */}
            <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/20">Live Now</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Live Session: Physics Mechanics Recap</h3>
                  <p className="text-emerald-100 text-sm mb-6 max-w-md">Dr. Sara is waiting for you in the live room. Join now and ask your questions directly!</p>
                  <button className="px-8 py-3 bg-white text-emerald-700 rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-emerald-50 transition-colors">Join Live Class</button>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            </div>
         </div>

         {/* RECENT ACTIVITY */}
         <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <Bell size={20} className="text-blue-600" /> Recent Activity
            </h2>
            <div className="bg-white dark:bg-[#111] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
               {ACTIVITIES.map((activity, i) => (
                  <div key={i} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 dark:border-gray-800">
                     <div className={`p-3 rounded-2xl shrink-0 ${
                        activity.type === 'quiz' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' : 
                        activity.type === 'feedback' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                        activity.type === 'announcement' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 
                        'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                     }`}>
                        {activity.type === 'quiz' ? <HelpCircle size={20} /> : 
                         activity.type === 'feedback' ? <FileText size={20} /> : 
                         activity.type === 'announcement' ? <Bell size={20} /> : 
                         <MessageSquare size={20} />}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{activity.result}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">{activity.time}</p>
                     </div>
                  </div>
               ))}
               <button className="w-full py-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-sm font-bold text-gray-500 hover:text-emerald-600 transition-all">View All Activity</button>
            </div>
         </div>
      </div>
    </div>
  );
}
