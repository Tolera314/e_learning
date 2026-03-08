"use client";

import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Video, 
  FileText, 
  HelpCircle, 
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check
} from "lucide-react";
import { useState } from "react";
import { motion, Reorder } from "framer-motion";

interface Lesson {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT";
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CurriculumBuilderProps {
  modules: Module[];
  onChange: (modules: Module[]) => void;
}

export default function CurriculumBuilder({ modules, onChange }: CurriculumBuilderProps) {
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);

  const addModule = () => {
    const newModule: Module = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Module",
      lessons: []
    };
    onChange([...modules, newModule]);
    setEditingModule(newModule.id);
  };

  const removeModule = (id: string) => {
    onChange(modules.filter(m => m.id !== id));
  };

  const addLesson = (moduleId: string, type: Lesson['type']) => {
    const newModules = modules.map(m => {
      if (m.id === moduleId) {
        const newLesson: Lesson = {
          id: Math.random().toString(36).substr(2, 9),
          title: `New ${type.toLowerCase()}`,
          type
        };
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    });
    onChange(newModules);
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    const newModules = modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    });
    onChange(newModules);
  };

  const updateModuleTitle = (id: string, title: string) => {
    onChange(modules.map(m => m.id === id ? { ...m, title } : m));
  };

  const updateLessonTitle = (moduleId: string, lessonId: string, title: string) => {
    onChange(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, title } : l) };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-6">
      <Reorder.Group axis="y" values={modules} onReorder={onChange} className="space-y-6">
        {modules.map((module) => (
          <Reorder.Item 
            key={module.id} 
            value={module}
            className="bg-gray-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden group/module"
          >
            {/* MODULE HEADER */}
            <div className="p-5 flex items-center justify-between bg-white dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-4 flex-1">
                  <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
                     <GripVertical size={20} />
                  </div>
                  {editingModule === module.id ? (
                    <div className="flex items-center gap-2 flex-1">
                       <input 
                         autoFocus
                         className="bg-transparent border-b border-emerald-500 font-bold text-gray-900 dark:text-white outline-none w-full"
                         value={module.title}
                         onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                         onBlur={() => setEditingModule(null)}
                         onKeyDown={(e) => e.key === 'Enter' && setEditingModule(null)}
                       />
                       <button onClick={() => setEditingModule(null)} className="p-1 text-emerald-500"><Check size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/title flex-1">
                       <h4 className="font-bold text-gray-900 dark:text-white">{module.title}</h4>
                       <button onClick={() => setEditingModule(module.id)} className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1 text-gray-400 hover:text-emerald-500">
                          <Edit2 size={14} />
                       </button>
                    </div>
                  )}
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => removeModule(module.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                     <Trash2 size={18} />
                  </button>
               </div>
            </div>

            {/* LESSONS LIST */}
            <div className="p-4 space-y-3">
               {module.lessons.length > 0 ? (
                 <Reorder.Group 
                   axis="y" 
                   values={module.lessons} 
                   onReorder={(newLessons) => {
                     onChange(modules.map(m => m.id === module.id ? { ...m, lessons: newLessons } : m));
                   }}
                   className="space-y-3"
                 >
                   {module.lessons.map((lesson) => (
                     <Reorder.Item 
                       key={lesson.id} 
                       value={lesson}
                       className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl group/lesson"
                     >
                        <div className="flex items-center gap-4 flex-1">
                           <div className="cursor-grab active:cursor-grabbing text-gray-200 group-hover/lesson:text-gray-400 transition-colors">
                              <GripVertical size={16} />
                           </div>
                           <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                              {lesson.type === "VIDEO" && <Video size={16} className="text-blue-500" />}
                              {lesson.type === "TEXT" && <FileText size={16} className="text-amber-500" />}
                              {lesson.type === "QUIZ" && <HelpCircle size={16} className="text-purple-500" />}
                              {lesson.type === "ASSIGNMENT" && <ClipboardCheck size={16} className="text-emerald-500" />}
                           </div>
                           
                           {editingLesson === lesson.id ? (
                             <input 
                               autoFocus
                               className="bg-transparent border-b border-emerald-500 text-sm font-medium text-gray-900 dark:text-white outline-none w-full"
                               value={lesson.title}
                               onChange={(e) => updateLessonTitle(module.id, lesson.id, e.target.value)}
                               onBlur={() => setEditingLesson(null)}
                               onKeyDown={(e) => e.key === 'Enter' && setEditingLesson(null)}
                             />
                           ) : (
                             <div className="flex items-center gap-2 group/ltitle">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lesson.title}</span>
                                <button onClick={() => setEditingLesson(lesson.id)} className="opacity-0 group-hover/ltitle:opacity-100 p-1 text-gray-400">
                                   <Edit2 size={12} />
                                </button>
                             </div>
                           )}
                        </div>
                        <button onClick={() => removeLesson(module.id, lesson.id)} className="p-2 text-gray-200 hover:text-red-500 transition-colors">
                           <Trash2 size={16} />
                        </button>
                     </Reorder.Item>
                   ))}
                 </Reorder.Group>
               ) : (
                 <div className="py-8 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                    <p className="text-xs text-gray-400">No lessons in this module yet.</p>
                 </div>
               )}

               {/* ADD LESSON BUTTONS */}
               <div className="pt-2 flex flex-wrap gap-2">
                  <button onClick={() => addLesson(module.id, "VIDEO")} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                     <Plus size={14} /> Video
                  </button>
                  <button onClick={() => addLesson(module.id, "TEXT")} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">
                     <Plus size={14} /> Text
                  </button>
                  <button onClick={() => addLesson(module.id, "QUIZ")} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/10 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
                     <Plus size={14} /> Quiz
                  </button>
                  <button onClick={() => addLesson(module.id, "ASSIGNMENT")} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">
                     <Plus size={14} /> Assignment
                  </button>
               </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <button 
        onClick={addModule} 
        className="w-full py-4 bg-gray-50 dark:bg-gray-800/20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-gray-500 font-bold hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={20} /> Add New Module
      </button>
    </div>
  );
}
