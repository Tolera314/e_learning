"use client";

import { 
  Plus, 
  HelpCircle, 
  CheckCircle2,
  MoreVertical,
  FileText
} from "lucide-react";
import { useState } from "react";

const QUIZZES = [
  { id: "1", title: "Calculus Basics Quiz", course: "Advanced Calculus", questions: 15, submissions: 124, avgScore: "78%" },
  { id: "2", title: "Physics: Mechanics Midterm", course: "Physics Fundamentals", questions: 30, submissions: 85, avgScore: "82%" },
  { id: "3", title: "Organic Chemistry Introduction", course: "Org Chemistry Deep Dive", questions: 10, submissions: 0, avgScore: "N/A" },
];

export default function InstructorQuizzes() {
  const [activeTab, setActiveTab] = useState("quizzes");

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quizzes & Assignments</h1>
          <p className="text-gray-500 mt-2">Create assessments and review student submissions.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all text-center justify-center">
          <Plus size={20} />
          Create assessment
        </button>
      </header>

      {/* TABS */}
      <div className="flex gap-8 border-b border-gray-100 dark:border-gray-800 mb-8">
         {["quizzes", "assignments", "submissions"].map((tab) => (
           <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold capitalize transition-all border-b-2 ${activeTab === tab ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
           >
              {tab}
           </button>
         ))}
      </div>

      {/* QUIZ LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {QUIZZES.map((quiz) => (
           <div key={quiz.id} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                    <HelpCircle size={24} />
                 </div>
                 <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{quiz.title}</h3>
              <p className="text-xs text-gray-500 mb-6">{quiz.course}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Questions</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{quiz.questions}</p>
                 </div>
                 <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Score</p>
                    <p className="text-sm font-bold text-emerald-600">{quiz.avgScore}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                 <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <CheckCircle2 size={12} className="text-emerald-500" /> {quiz.submissions} Submissions
                 </div>
                 <button className="text-xs font-bold text-emerald-600 hover:dark:text-emerald-400">Review Results</button>
              </div>
           </div>
         ))}
         
         {/* CREATE NEW CARD */}
         <button className="bg-gray-50 dark:bg-gray-800/20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:border-emerald-500 transition-all group min-h-[250px]">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
               <Plus size={24} />
            </div>
            <p className="font-bold text-gray-900 dark:text-white">New Assessment</p>
            <p className="text-xs text-gray-500 mt-2">Create a quiz or set an assignment.</p>
         </button>
      </div>

      {/* ASSIGNMENT CTA IF EMPTY */}
      {activeTab === 'assignments' && (
         <div className="p-20 text-center bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 mt-10">
            <FileText className="mx-auto text-gray-300 mb-6" size={60} />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Assignments yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Assignments allow students to upload work which you can then grade and provide feedback on.</p>
            <button className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold">Create First Assignment</button>
         </div>
      )}
    </div>
  );
}
