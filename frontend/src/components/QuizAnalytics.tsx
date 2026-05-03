"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { 
  Trophy, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  BarChart2,
  PieChart,
  HelpCircle,
  ChevronDown,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

interface QuizAnalyticsProps {
  quizId?: string;
}

interface QuestionStat {
  id: string;
  text: string;
  correctRate: number;
  incorrectOption: string;
  skippedRate: number;
}

export default function QuizAnalytics({ quizId }: QuizAnalyticsProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgScore: 0,
    passRate: 0,
    completion: 0,
    totalStudents: 0,
    distribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  });

  useEffect(() => {
    if (quizId) fetchPerformance();
  }, [quizId]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/instructor/quizzes/${quizId}/performance`);
      const results = response.data;
      
      if (results.length > 0) {
        const total = results.length;
        const avg = results.reduce((acc: number, curr: any) => acc + curr.score, 0) / total;
        const passed = results.filter((r: any) => r.score >= 50).length; // Assuming 50 is pass
        
        // Distribution (0-10, 11-20, etc.)
        const dist = new Array(10).fill(0);
        results.forEach((r: any) => {
          const index = Math.min(9, Math.floor(r.score / 10));
          dist[index]++;
        });

        setStats({
          avgScore: Math.round(avg),
          passRate: Math.round((passed / total) * 100),
          completion: 100, // Placeholder for enrolled total ratio
          totalStudents: total,
          distribution: dist
        });
      }
      setData(results);
    } catch (error) {
      toast.error("Failed to load quiz performance data");
    } finally {
      setLoading(false);
    }
  };

  if (loading && quizId) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Hydrating Analytics Engine...</p>
        </div>
    );
  }

  const overviewStats = [
    { label: "Avg. Score", value: `${stats.avgScore}%`, change: "+2%", icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Pass Rate", value: `${stats.passRate}%`, change: "Stable", icon: BarChart2, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Submissions", value: stats.totalStudents.toString(), change: "+5%", icon: PieChart, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Difficulty", value: stats.avgScore < 60 ? "High" : stats.avgScore < 80 ? "Medium" : "Easy", change: "Computed", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" }
  ];
  return (
    <div className="space-y-8">
      {/* PERFORMANCE OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {overviewStats.map((stat, i) => (
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
               {stats.distribution.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${(val / (stats.totalStudents || 1)) * 100}%` }}
                       className={`w-full rounded-t-xl ${i > 7 ? 'bg-emerald-500' : i > 4 ? 'bg-blue-500' : 'bg-red-500'}`}
                     />
                     <span className="text-[9px] font-black text-gray-400">{(i+1)*10}%</span>
                  </div>
               ))}
            </div>
         </div>

         {/* DIFFICULT QUESTIONS */}
         <div className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Question Gaps</h4>
            <div className="space-y-6">
               {(data as any).questionStats && (data as any).questionStats.length > 0 ? (
                  (data as any).questionStats.map((q: any, i: number) => (
                     <div key={i} className="flex items-center gap-4 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                           q.correctRate < 30 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                           {q.correctRate}%
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                              {q.text}
                           </p>
                           <p className="text-[10px] text-gray-400 font-medium">
                              Correct Rate | {q.totalResponses} Responses
                           </p>
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="py-10 text-center">
                     <AlertCircle className="mx-auto text-gray-300 mb-4" size={32} />
                     <p className="text-xs text-gray-400 font-bold">Deep analytics for individual questions requires higher volume of submissions.</p>
                  </div>
               )}
            </div>
            <button className="w-full mt-8 py-4 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2">
               <HelpCircle size={16} /> Export Detailed CSV
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
