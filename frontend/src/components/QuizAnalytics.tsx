"use client";

import { 
  Trophy, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  BarChart2,
  PieChart,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";

interface QuestionStat {
  id: string;
  text: string;
  correctRate: number;
  incorrectOption: string;
  skippedRate: number;
}

const MOCK_QUESTION_STATS: QuestionStat[] = [
  {
    id: "q1",
    text: "Define the limit of a function at a point x=a.",
    correctRate: 45,
    incorrectOption: "Confused with derivative",
    skippedRate: 12
  },
  {
    id: "q2",
    text: "Solve for the derivative of sin(x).",
    correctRate: 88,
    incorrectOption: "cos(-x)",
    skippedRate: 2
  }
];

export default function QuizAnalytics() {
  return (
    <div className="space-y-8">
      {/* PERFORMANCE OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {[
           { label: "Avg. Score", value: "74%", change: "+5%", icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50" },
           { label: "Pass Rate", value: "68%", change: "-2%", icon: BarChart2, color: "text-blue-500", bg: "bg-blue-50" },
           { label: "Completion", value: "92%", change: "+12%", icon: PieChart, color: "text-purple-500", bg: "bg-purple-50" },
           { label: "Difficulty", value: "High", change: "Stable", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" }
         ].map((stat, i) => (
           <div key={i} className="p-6 bg-white dark:bg-[#111] rounded-[2rem] border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start mb-4">
                 <div className={`w-12 h-12 rounded-2xl ${stat.bg} dark:bg-opacity-10 flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={20} />
                 </div>
                 <span className={`text-[10px] font-black ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.change}</span>
              </div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* SCORE DISTRIBUTION */}
         <div className="xl:col-span-2 p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white">Score Distribution</h4>
                  <p className="text-xs text-gray-400 font-bold">Frequency of scores across 124 students</p>
               </div>
               <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors">
                  Module 1 Quiz <ChevronDown size={14} />
               </button>
            </div>

            <div className="flex items-end gap-3 h-48 mb-6">
               {[4, 8, 15, 32, 45, 28, 12, 5].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${(val / 45) * 100}%` }}
                       className={`w-full rounded-t-xl ${i > 4 ? 'bg-emerald-500' : i > 2 ? 'bg-blue-500' : 'bg-red-500'}`}
                     />
                     <span className="text-[9px] font-black text-gray-400">{(i+1)*10}%</span>
                  </div>
               ))}
            </div>
         </div>

         {/* DIFFICULT QUESTIONS */}
         <div className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Learning Gaps</h4>
            <div className="space-y-6">
               {MOCK_QUESTION_STATS.map(q => (
                  <div key={q.id}>
                     <p className="text-xs font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{q.text}</p>
                     <div className="flex justify-between text-[10px] items-center mb-1.5 font-bold">
                        <span className="text-red-500 flex items-center gap-1"><AlertCircle size={12} /> Only {q.correctRate}% Correct</span>
                        <span className="text-gray-400 text-right">Most common: {q.incorrectOption}</span>
                     </div>
                     <div className="h-1.5 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${q.correctRate}%` }} />
                     </div>
                  </div>
               ))}
            </div>
            <button className="w-full mt-8 py-4 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2">
               <HelpCircle size={16} /> View All Questions
            </button>
         </div>
      </div>

      <div className="p-8 bg-emerald-100 dark:bg-emerald-900/10 border border-emerald-500/10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
         <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <TrendingUp size={24} />
         </div>
         <div className="flex-1">
            <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-400 italic">Expert Advice</h4>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-400/60 font-medium leading-relaxed">Most students missed Q1 because they confuse "Limit" with "Derivative". Consider adding a quick 5-min video specifically explaining the difference to capture their attention.</p>
         </div>
      </div>
    </div>
  );
}
