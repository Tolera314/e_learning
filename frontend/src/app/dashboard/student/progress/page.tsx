"use client";

import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  CheckCircle2,
  Calendar,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const ANALYTICS_CARDS = [
  { label: "Overall Progress", value: "72%", sub: "4 Courses in progress", icon: <Target className="text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
  { label: "Study Time", value: "48.5h", sub: "This month", icon: <Clock className="text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/10" },
  { label: "Quiz Accuracy", value: "84%", sub: "Top 10% of class", icon: <TrendingUp className="text-purple-500" />, color: "bg-purple-50 dark:bg-purple-900/10" },
  { label: "Completion Rate", value: "95%", sub: "On-time submissions", icon: <CheckCircle2 className="text-orange-500" />, color: "bg-orange-50 dark:bg-orange-900/10" },
];

export default function StudentProgress() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Progress</h1>
          <p className="text-gray-500 mt-2">Visualize your academic journey and track your milestones.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 shadow-sm">
           <Calendar size={18} /> Last 30 Days <ChevronRight size={14} />
        </button>
      </header>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {ANALYTICS_CARDS.map((card, i) => (
           <motion.div 
             key={i} 
             whileHover={{ y: -5 }}
             className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm"
           >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${card.color}`}>
                 {card.icon}
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</h3>
              <p className="text-xs text-gray-500 font-medium">{card.sub}</p>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* STUDY TIME CHART PLACEHOLDER */}
         <div className="lg:col-span-2 bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">Study Activity</h2>
               <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                     <TrendingUp size={14} /> +15.5%
                  </div>
               </div>
            </div>
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-50 dark:border-gray-800 rounded-3xl group">
               <BarChart3 className="text-gray-200 group-hover:text-emerald-500 transition-colors mb-4" size={48} />
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Interactive Study Time Graph Visualization</p>
            </div>
         </div>

         {/* RECENT MILESTONES */}
         <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Milestones</h2>
            <div className="space-y-6 flex-1">
               {[
                 { title: "Calculus Expert", desc: "Completed 10 advanced modules", date: "Oct 24", icon: "🏆", color: "bg-amber-50" },
                 { title: "7-Day Streak", desc: "Learned consistently for a week", date: "Oct 22", icon: "🔥", color: "bg-orange-50" },
                 { title: "Perfect Score", desc: "100% on Physics Mechanics quiz", date: "Oct 18", icon: "⭐", color: "bg-purple-50" },
               ].map((milestone, i) => (
                  <div key={i} className="flex gap-4">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${milestone.color} dark:bg-white/5`}>
                        {milestone.icon}
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{milestone.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{milestone.desc}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-2">{milestone.date}</p>
                     </div>
                  </div>
               ))}
            </div>
            <button className="w-full mt-10 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-all">View Achievement Badges</button>
         </div>
      </div>
    </div>
  );
}
