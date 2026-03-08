"use client";

import { 
  Plus, 
  Video, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Edit
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL_LESSONS = [
  { 
    id: "1", 
    title: "1. Introduction to Digital Learning", 
    type: "video", 
    duration: "12:45", 
    resources: ["Course_Overview.pdf", "Reading_List.docx"] 
  },
  { 
    id: "2", 
    title: "2. Setting up your Workspace", 
    type: "video", 
    duration: "18:20", 
    resources: ["Setup_Guide.pdf"] 
  },
  { 
    id: "3", 
    title: "3. Quiz: Foundations", 
    type: "quiz", 
    duration: "10 mins", 
    resources: [] 
  },
];

const LessonCard = ({ lesson, index, isExpanded, onToggle }: any) => (
  <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
    <div className="p-5 flex items-center justify-between pointer-events-none sm:pointer-events-auto">
      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={onToggle}>
        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 text-xs">
           {index + 1}
        </div>
        <div>
           <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {lesson.type === 'video' ? <Video size={16} className="text-emerald-500" /> : <FileText size={16} className="text-blue-500" />}
              {lesson.title}
           </h3>
           <p className="text-xs text-gray-500 mt-0.5">{lesson.duration} • {lesson.type}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><Edit size={16} /></button>
         <button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
         <button className="p-2 text-gray-400" onClick={onToggle}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
         </button>
      </div>
    </div>
    
    <AnimatePresence>
      {isExpanded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-5 pt-0"
        >
          <div className="pl-12 pt-4 border-t border-gray-50 dark:border-gray-800">
             <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Attached Resources</p>
             <div className="flex flex-wrap gap-2">
                {lesson.resources.length > 0 ? lesson.resources.map((res: string) => (
                   <span key={res} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                      <FileText size={12} /> {res}
                   </span>
                )) : <span className="text-xs text-gray-500">No resources attached</span>}
                <button className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1 hover:bg-emerald-100 transition-colors">
                   <Plus size={12} /> Add Resource
                </button>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function LessonManagement() {
  const [expandedId, setExpandedId] = useState<string | null>("1");
  const [selectedCourse, setSelectedCourse] = useState("1");

  return (
    <div className="max-w-4xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lesson Management</h1>
          <p className="text-gray-500 mt-2">Upload video lessons, attach PDFs, and organize your course curriculum.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
          <Plus size={20} />
          Add New Lesson
        </button>
      </header>

      {/* COURSE SELECTOR */}
      <div className="mb-8">
         <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Select Course</label>
         <select 
           value={selectedCourse} 
           onChange={(e) => setSelectedCourse(e.target.value)}
           className="w-full p-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 dark:text-white"
         >
            <option value="1">Advanced Calculus for Grade 12</option>
            <option value="2">Physics Fundamentals: Mechanics</option>
         </select>
      </div>

      {/* LESSON LIST */}
      <div className="space-y-4">
         {INITIAL_LESSONS.map((lesson, idx) => (
           <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
              index={idx} 
              isExpanded={expandedId === lesson.id}
              onToggle={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
           />
         ))}
      </div>

      {/* UPLOAD CTA */}
      <div className="mt-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center group cursor-pointer hover:border-emerald-500 transition-all">
         <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Video size={32} />
         </div>
         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to add more lessons?</h3>
         <p className="text-gray-500 mb-8 max-w-sm mx-auto">Upload video files (MP4, MKV) up to 2GB or link from YouTube/Vimeo.</p>
         <button className="px-8 py-3 bg-gray-900 text-white dark:bg-white dark:text-black rounded-xl font-bold hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-colors">
            Upload Lesson Content
         </button>
      </div>
    </div>
  );
}
