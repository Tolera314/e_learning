"use client";

import { useState } from "react";
import { 
  ClipboardCheck, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart2,
  MoreVertical,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const MOCK_QUIZZES = [
  { id: "1", title: "Python Basics Final", instructor: "Ahmed Z.", submissions: 242, avgScore: "82%", status: "HEALTHY" },
  { id: "2", title: "Chemistry Midterm G11", instructor: "Hirut T.", submissions: 156, avgScore: "64%", status: "ANOMALY" },
  { id: "3", title: "Calculus I Advanced", instructor: "Dawit S.", submissions: 89, avgScore: "71%", status: "HEALTHY" }
];

export default function QuizOversight() {
  const [quizzes, setQuizzes] = useState(MOCK_QUIZZES);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ClipboardCheck className="text-emerald-600" size={32} />
            Assessment Rigor & Integrity
          </h1>
          <p className="text-gray-500 mt-1">Audit academic performance and monitor for integrity anomalies.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
              <BarChart2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Avg</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">74.2%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {quizzes.map((quiz, idx) => (
            <motion.div 
              key={quiz.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 ${
                    quiz.status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20' : 'bg-red-100 text-red-600 dark:bg-red-900/20'
                  }`}>
                    {quiz.status === 'HEALTHY' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} className="animate-pulse" />}
                    {quiz.status}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{quiz.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Instructor: {quiz.instructor}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submissions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{quiz.submissions}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Average Score</p>
                    <p className="text-lg font-bold text-emerald-600">{quiz.avgScore}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-2">
                <button className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                  <Activity size={16} /> Performance Audit
                </button>
                <button className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 transition-all">
                  <Eye size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
