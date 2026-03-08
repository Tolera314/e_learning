"use client";

import { 
  FileText, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  ChevronRight,
  Filter
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const ASSESSMENTS = [
  { id: "1", title: "Calculus Basics Quiz", type: "quiz", course: "Advanced Calculus", status: "completed", score: "92/100", date: "Oct 24, 2026" },
  { id: "2", title: "Newton's Laws Assignment", type: "assignment", course: "Physics Fundamentals", status: "submitted", score: "Pending", date: "Oct 27, 2026" },
  { id: "3", title: "Organic Chemistry Midterm", type: "quiz", course: "Org Chemistry Deep Dive", status: "todo", score: "—", date: "Due: Nov 5" },
  { id: "4", title: "Ancient Civilizations Essay", type: "assignment", course: "History G10", status: "todo", score: "—", date: "Due: Nov 10" },
];

const AssessmentCard = ({ item }: any) => (
  <motion.div 
    whileHover={{ x: 5 }}
    className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-6 group cursor-pointer hover:border-emerald-500 transition-all"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
       item.type === 'quiz' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
    }`}>
       {item.type === 'quiz' ? <HelpCircle size={24} /> : <FileText size={24} />}
    </div>
    
    <div className="flex-1 min-w-0">
       <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.course}</span>
          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${
             item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
             item.status === 'submitted' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
             'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
          }`}>
             {item.status}
          </span>
       </div>
       <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">{item.title}</h3>
       <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
             <Clock size={14} /> {item.date}
          </div>
          {item.score !== '—' && (
             <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <CheckCircle2 size={14} /> Result: {item.score}
             </div>
          )}
       </div>
    </div>

    <button className="p-3 text-gray-300 group-hover:text-emerald-600 transition-colors">
       <ChevronRight size={24} />
    </button>
  </motion.div>
);

export default function StudentAssessments() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assessments</h1>
          <p className="text-gray-500 mt-2">Track your quizzes, assignments, and academic performance.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-12 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm" />
           </div>
           <button className="p-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500"><Filter size={20} /></button>
        </div>
      </header>

      {/* STATUS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-70">Completed</h4>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold">12</span>
               <CheckCircle2 size={32} className="opacity-30" />
            </div>
         </div>
         <div className="bg-amber-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-500/20">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-70">Pending Submission</h4>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold">3</span>
               <Clock size={32} className="opacity-30" />
            </div>
         </div>
         <div className="bg-gray-900 dark:bg-gray-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-black/10">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-70">Overdue</h4>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold">0</span>
               <AlertCircle size={32} className="opacity-30" />
            </div>
         </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-8 border-b border-gray-100 dark:border-gray-800">
         {["all", "quizzes", "assignments"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-emerald-600' : 'text-gray-400'}`}
            >
               {tab}
               {activeTab === tab && <motion.div layoutId="ass-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
         ))}
      </div>

      {/* LIST */}
      <div className="space-y-4 pb-20">
         {ASSESSMENTS.filter(a => activeTab === 'all' || a.type === activeTab.slice(0, -1)).map(item => (
            <AssessmentCard key={item.id} item={item} />
         ))}
      </div>
    </div>
  );
}
