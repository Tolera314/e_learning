"use client";

import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Video, 
  FileText, 
  HelpCircle, 
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  History,
  Eye,
  Settings2,
  Users,
  Clock
} from "lucide-react";
import { useState } from "react";
import { motion, Reorder } from "framer-motion";

interface Lesson {
  id: string;
  title: string;
  type: "VIDEO" | "LIVE" | "READING" | "QUIZ";
  duration: string;
  updatedAt: string;
  version: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

const MOCK_MODULES: Module[] = [
  {
    id: "m1",
    title: "Module 1: Calculus Foundations",
    lessons: [
      { id: "l1", title: "1.1 Basic Concepts", type: "VIDEO", duration: "12:45", updatedAt: "Oct 24, 2023", version: "v1.2" },
      { id: "l2", title: "1.2 Course Introduction", type: "LIVE", duration: "60:00", updatedAt: "Oct 25, 2023", version: "v1.0" },
    ]
  },
  {
    id: "m2",
    title: "Module 2: Advanced Derivatives",
    lessons: [
      { id: "l3", title: "2.1 The Concept of Derivative", type: "VIDEO", duration: "15:10", updatedAt: "Oct 28, 2023", version: "v2.1" },
      { id: "l4", title: "2.2 Rules of Differentiation", type: "READING", duration: "5 pages", updatedAt: "Oct 29, 2023", version: "v1.1" },
      { id: "l5", title: "2.3 Quiz: Differentiation", type: "QUIZ", duration: "15 mins", updatedAt: "Oct 28, 2023", version: "v1.0" },
    ]
  }
];

export default function CourseMaterialManager() {
  const [modules, setModules] = useState<Module[]>(MOCK_MODULES);
  const [editingModule, setEditingModule] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Course Materials</h3>
            <p className="text-xs text-gray-400 font-bold">Manage lessons, resources and quizzes for "Advanced Calculus"</p>
         </div>
         <button className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2">
            <Plus size={18} /> Add Module
         </button>
      </div>

      <Reorder.Group axis="y" values={modules} onReorder={setModules} className="space-y-6">
        {modules.map((module) => (
          <Reorder.Item 
            key={module.id} 
            value={module}
            className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm"
          >
            {/* MODULE HEADER */}
            <div className="p-6 flex items-center justify-between border-b border-gray-50 dark:border-gray-800 bg-gray-50/30">
               <div className="flex items-center gap-4 flex-1">
                  <div className="cursor-grab active:cursor-grabbing text-gray-300">
                     <GripVertical size={20} />
                  </div>
                  {editingModule === module.id ? (
                    <input 
                      autoFocus
                      className="bg-transparent border-b border-emerald-500 font-black text-gray-900 dark:text-white outline-none text-lg"
                      value={module.title}
                      onBlur={() => setEditingModule(null)}
                      onChange={(e) => {
                         const newModules = modules.map(m => m.id === module.id ? { ...m, title: e.target.value } : m);
                         setModules(newModules);
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-3 group/title">
                       <h4 className="text-lg font-black text-gray-900 dark:text-white italic">{module.title}</h4>
                       <button onClick={() => setEditingModule(module.id)} className="opacity-0 group-hover/title:opacity-100 p-1 text-gray-400">
                          <Edit2 size={14} />
                       </button>
                    </div>
                  )}
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase">{module.lessons.length} Lessons</span>
                  <button className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
               </div>
            </div>

            {/* LESSONS LIST */}
            <div className="p-4 space-y-3">
               <Reorder.Group 
                 axis="y" 
                 values={module.lessons} 
                 onReorder={(newLessons) => {
                   setModules(modules.map(m => m.id === module.id ? { ...m, lessons: newLessons } : m));
                 }}
                 className="space-y-3"
               >
                 {module.lessons.map((lesson) => (
                   <Reorder.Item 
                     key={lesson.id} 
                     value={lesson}
                     className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl group/lesson hover:border-emerald-500/30 transition-all"
                   >
                      <div className="flex items-center gap-4 flex-1 mb-4 md:mb-0">
                         <div className="cursor-grab active:cursor-grabbing text-gray-200 group-hover/lesson:text-gray-400 transition-colors">
                            <GripVertical size={16} />
                         </div>
                         <div className={`p-3 rounded-xl ${
                            lesson.type === 'VIDEO' ? 'bg-blue-50 text-blue-500' :
                            lesson.type === 'LIVE' ? 'bg-red-50 text-red-500' :
                            lesson.type === 'READING' ? 'bg-amber-50 text-amber-500' :
                            'bg-purple-50 text-purple-500'
                         }`}>
                            {lesson.type === 'VIDEO' ? <Video size={18} /> :
                             lesson.type === 'LIVE' ? <Users size={18} /> :
                             lesson.type === 'READING' ? <FileText size={18} /> :
                             <HelpCircle size={18} />}
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{lesson.title}</p>
                            <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-gray-500">
                               <span className="flex items-center gap-1"><Clock size={12} /> {lesson.duration}</span>
                               <span className="flex items-center gap-1"><History size={12} /> {lesson.version}</span>
                               <span className="opacity-60 hidden sm:inline">Updated {lesson.updatedAt}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-50 dark:border-gray-800">
                         <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-emerald-600 transition-all">
                            <Eye size={14} /> Preview
                         </button>
                         <button className="p-2 text-gray-200 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"><Settings2 size={16} /></button>
                         <button className="p-2 text-gray-200 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                   </Reorder.Item>
                 ))}
               </Reorder.Group>

               <div className="pt-4 flex justify-center">
                  <button className="px-8 py-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-emerald-500 transition-all">
                     + Insert Lesson to {module.title}
                  </button>
               </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* VERSION ALERT */}
      <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-blue-500/20">
         <div className="flex-1">
            <h4 className="text-xl font-black mb-2 italic flex items-center gap-2"><History size={24} /> Lesson Versioning</h4>
            <p className="text-sm opacity-80 leading-relaxed max-w-xl">When you update existing materials, we automatically store the previous version. Students will receive a "New Content Available" notification in their player.</p>
         </div>
         <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs hover:scale-[1.05] transition-all whitespace-nowrap">
            View History Logs
         </button>
      </div>
    </div>
  );
}
