"use client";

import { 
  BarChart3, TrendingUp, Clock, Target, CheckCircle2, Calendar, BookOpen,
  Brain, Sparkles, ChevronRight, Zap, Target as TargetIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

interface ProgressData {
  overallProgress: number;
  studyTimeHours: number;
  quizAccuracy: number;
  completionRate: number;
  courseProgress: { id: string; name: string; progress: number; lessons: number; total: number; quizScore: string }[];
  dailyActivity: number[];
  recentQuizScores: number[];
  skills: { subject: string; value: number; fullMark: number }[];
  recommendations: { type: string; text: string; priority: 'high' | 'medium' | 'low' }[];
}

const BarChart = ({ data, color = "bg-emerald-500" }: { data: number[]; color?: string }) => {
  const max = Math.max(...data, 1);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="flex items-end gap-2 h-36">
      {data.map((val, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
          <span className="text-[9px] text-gray-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{val}h</span>
          <div className="w-full flex-1 flex flex-col justify-end">
            <div className={`${color} rounded-t-lg opacity-70 hover:opacity-100 transition-all`} style={{ height: `${Math.max((val / max) * 100, 4)}%` }} />
          </div>
          <span className="text-[9px] text-gray-400 font-medium">{days[i]}</span>
        </div>
      ))}
    </div>
  );
};

const TIMEFRAMES = ["7 Days", "30 Days", "3 Months"];

export default function StudentProgress() {
  const [timeframe, setTimeframe] = useState("7 Days");
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    api.get("/student/progress")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleClaimCertificate = async (courseId: string, courseName: string) => {
    setClaiming(courseId);
    try {
      const res = await api.post(`/student/certificates/claim/${courseId}`);
      if (res.data.pdfData) {
        const link = document.createElement('a');
        link.href = res.data.pdfData;
        link.download = `Certificate_${courseName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      alert("Failed to claim certificate. Ensure you have 100% completion.");
    } finally {
      setClaiming(null);
    }
  };

  const stats = [
    { label: "Overall Progress", value: `${data?.overallProgress ?? 0}%`, icon: Target, color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" },
    { label: "Study Time", value: `${data?.studyTimeHours ?? 0}h`, icon: Clock, color: "bg-blue-50 dark:bg-blue-900/10 text-blue-600" },
    { label: "Quiz Accuracy", value: `${data?.quizAccuracy ?? 0}%`, icon: TrendingUp, color: "bg-purple-50 dark:bg-purple-900/10 text-purple-600" },
    { label: "Completion Rate", value: `${data?.completionRate ?? 0}%`, icon: CheckCircle2, color: "bg-orange-50 dark:bg-orange-900/10 text-orange-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Academic Insights</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Powered by Ethio-Digital AI Engine</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
          {TIMEFRAMES.map(t => (
            <button key={t} onClick={() => setTimeframe(t)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeframe === t ? 'bg-white dark:bg-[#111] text-purple-600 shadow-sm' : 'text-gray-500'}`}>{t}</button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({length:4}).map((_,i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[2rem]" />)}
        </div>
      ) : (
        <div className="space-y-12">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((card, i) => { const Icon = card.icon; return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none transition-all hover:scale-[1.02]">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${card.color}`}><Icon size={24} /></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">{card.value}</h3>
              </motion.div>
            );})}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* RADAR CHART - Skill Distribution */}
            <div className="lg:col-span-1 bg-white dark:bg-[#111] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
              <div className="w-full mb-6">
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                  <Brain size={20} className="text-purple-500" /> Skill Radar
                </h3>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data?.skills || []}>
                    <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
                    <Radar
                      name="Expertise"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Category Mastery Overview</p>
            </div>

            {/* BAR CHARTS */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-[#111] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3"><BarChart3 size={20} className="text-blue-500" /> Activity</h3>
                    <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl">WEEKLY</span>
                  </div>
                  <BarChart data={data?.dailyActivity ?? [0,0,0,0,0,0,0]} color="bg-blue-500" />
               </div>
               <div className="bg-white dark:bg-[#111] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3"><TrendingUp size={20} className="text-emerald-500" /> Performances</h3>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl">RECENT</span>
                  </div>
                  <BarChart data={data?.recentQuizScores?.length ? data.recentQuizScores : [0]} color="bg-emerald-500" />
               </div>
            </div>
          </div>

          {/* AI RECOMMENDATIONS */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-1 rounded-[3rem] shadow-2xl shadow-purple-500/20">
            <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[2.9rem] flex flex-col md:flex-row gap-8 items-center">
               <div className="shrink-0">
                  <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-[2rem] flex items-center justify-center text-5xl">
                    🤖
                  </div>
               </div>
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Expert Study Coach</h3>
                    <div className="px-3 py-1 bg-purple-600 text-[10px] font-black text-white rounded-full flex items-center gap-1"><Sparkles size={10} /> AI ACTIVE</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.recommendations && data.recommendations.length > 0 ? data.recommendations.map((rec, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 flex items-start gap-4 group hover:border-purple-200 transition-all">
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${rec.priority === 'high' ? 'bg-red-500 animate-pulse' : rec.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-relaxed">{rec.text}</p>
                      </div>
                    )) : (
                      <p className="text-gray-400 italic">No recommendations available yet. Keep learning to get personalized advice!</p>
                    )}
                  </div>
               </div>
               <button className="h-full px-8 py-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-3xl hover:opacity-90 transition-all flex flex-col items-center justify-center gap-2">
                  <Zap size={20} />
                  <span className="text-[10px] uppercase tracking-widest">Optimized Plan</span>
               </button>
            </div>
          </div>

          {/* COURSE PROGRESS TABLE */}
          <div className="bg-white dark:bg-[#111] rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                <BookOpen size={20} className="text-indigo-500" /> Mastery Breakdown
              </h3>
              <button className="text-[10px] font-black text-gray-400 tracking-widest flex items-center gap-1 hover:text-gray-900 transition-colors">VIEW ALL COURSES <ChevronRight size={12}/></button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.courseProgress && data.courseProgress.map((course, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-gray-50/50 dark:bg-gray-800/10 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{course.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.lessons}/{course.total} LESSONS COMPLETED</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-indigo-600">{course.progress}%</p>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-2"><TargetIcon size={12} className="text-purple-500"/> Avg Score: <span className="text-gray-900 dark:text-white">{course.quizScore}</span></span>
                    {course.progress >= 100 ? (
                      <button 
                        onClick={() => handleClaimCertificate(course.id, course.name)}
                        disabled={claiming === course.id}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
                      >
                        {claiming === course.id ? <Clock size={12} className="animate-spin" /> : <Zap size={12} />}
                        CLAIM CERTIFICATE
                      </button>
                    ) : (
                      <button className="px-5 py-2.5 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all">Resume Learning</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
