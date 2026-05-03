"use client";

import { 
  Plus, 
  Video, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Edit,
  Loader2,
  AlertCircle,
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import SlidePanel from "@/components/SlidePanel";

const LessonCard = ({ lesson, index, isExpanded, onToggle, onDelete, onEdit }: any) => (
  <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
    <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={onToggle}>
        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 text-xs">
           {index + 1}
        </div>
        <div>
           <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {lesson.type === 'VIDEO' ? <Video size={16} className="text-emerald-500" /> : <FileText size={16} className="text-blue-500" />}
              {lesson.title}
           </h3>
           <p className="text-xs text-gray-500 mt-0.5">
             {lesson.durationSeconds ? `${Math.floor(lesson.durationSeconds / 60)}:${(lesson.durationSeconds % 60).toString().padStart(2, '0')}` : '0:00'} • {lesson.type}
           </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <button onClick={() => onEdit(lesson)} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><Edit size={16} /></button>
         <button onClick={() => onDelete(lesson.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
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
             <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Lesson Details</p>
             <div className="space-y-3">
                {lesson.content && (
                   <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.content}</p>
                )}
                {lesson.videoUrl && (
                   <div className="text-xs text-emerald-600 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-lg break-all">
                      <Video size={12} /> {lesson.videoUrl}
                   </div>
                )}
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function LessonManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "video",
    file: null as File | null,
    liveDate: "",
    content: "",
    isFreePreview: false
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCurriculum(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/instructor/courses");
      const list = data.data || data;
      setCourses(list);
      if (list.length > 0) setSelectedCourse(list[0].id);
    } catch (err) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculum = async (courseId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/lessons/courses/${courseId}/curriculum`);
      setModules(data);
    } catch (err) {
      toast.error("Failed to fetch curriculum");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!selectedCourse) return;
    const title = prompt("Enter Module Title:");
    if (!title) return;

    try {
      await api.post(`/lessons/modules/${selectedCourse}`, { title, orderIndex: modules.length });
      fetchCurriculum(selectedCourse);
      toast.success("Module created");
    } catch (err) {
      toast.error("Failed to create module");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Delete module and all its lessons?")) return;
    try {
      await api.delete(`/lessons/modules/${moduleId}`);
      fetchCurriculum(selectedCourse);
      toast.success("Module deleted");
    } catch (err) {
      toast.error("Failed to delete module");
    }
  };

  const handleOpenAddLesson = (moduleId: string) => {
    setTargetModuleId(moduleId);
    setFormData({ title: "", type: "video", file: null, liveDate: "", content: "", isFreePreview: false });
    setIsPanelOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File exceeds 5MB limit");
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleSaveLesson = async () => {
    if (!formData.title) {
      toast.error("Lesson title is required.");
      return;
    }
    
    setSaving(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("type", formData.type.toUpperCase());
      data.append("content", formData.content);
      data.append("isFreePreview", String(formData.isFreePreview));
      if (formData.file) {
        data.append("video", formData.file);
      }
      if (formData.liveDate) {
        data.append("liveDate", formData.liveDate);
      }

      await api.post(`/lessons/modules/${targetModuleId}/lessons`, data);
      setIsPanelOpen(false);
      fetchCurriculum(selectedCourse);
      toast.success("Lesson added");
    } catch (err) {
      toast.error("Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      fetchCurriculum(selectedCourse);
      if (expandedId === lessonId) setExpandedId(null);
      toast.success("Lesson deleted");
    } catch (err) {
      toast.error("Failed to delete lesson");
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading your lessons...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lesson Management</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your course curriculum, upload lessons, and organize modules.</p>
        </div>
        <button onClick={handleAddModule} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
          <Plus size={20} />
          Add New Module
        </button>
      </header>

      {/* COURSE SELECTOR */}
      <div className="mb-8 p-6 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
         <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Currently Managing</label>
         <select 
           value={selectedCourse} 
           onChange={(e) => setSelectedCourse(e.target.value)}
           className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 dark:text-white"
         >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
         </select>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Updating curriculum...</p>
        </div>
      ) : (
        <div className="space-y-10">
           {modules.length > 0 ? modules.map((module) => (
             <div key={module.id} className="relative">
                <div className="flex items-center justify-between mb-4 px-2 group">
                   <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xs">M</span>
                      {module.title}
                   </h2>
                   <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenAddLesson(module.id)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                         <Plus size={14} /> Add Lesson
                      </button>
                      <button onClick={() => handleDeleteModule(module.id)} className="text-red-400 hover:text-red-500">
                         <Trash2 size={14} />
                      </button>
                   </div>
                </div>
                
                <div className="space-y-4">
                   {module.lessons && module.lessons.length > 0 ? (
                      module.lessons.map((lesson: any, idx: number) => (
                        <LessonCard 
                           key={lesson.id} 
                           lesson={lesson} 
                           index={idx} 
                           isExpanded={expandedId === lesson.id}
                           onToggle={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
                           onDelete={handleDeleteLesson}
                           onEdit={() => {}} 
                        />
                      ))
                   ) : (
                      <div className="p-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-center bg-gray-50/50 dark:bg-gray-800/10">
                         <p className="text-sm text-gray-400 font-medium">No lessons in this module yet.</p>
                      </div>
                   )}
                </div>
             </div>
           )) : (
             <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-inner">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Modules Found</h3>
                <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">This course doesn't have any modules yet. Start by creating a module to organize your lessons.</p>
                <button onClick={handleAddModule} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/10">
                   Create First Module
                </button>
             </div>
           )}
        </div>
      )}

      {/* ADD LESSON POPUP (SLIDEPANEL) */}
      <SlidePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        title="Add New Lesson"
      >
        <div className="space-y-6">
           <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Lesson Title *</label>
              <input 
                 type="text" 
                 value={formData.title}
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
                 placeholder="e.g. Understanding Variables" 
                 className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
              />
           </div>

           <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Lesson Type *</label>
              <div className="grid gap-3">
                 {[
                   { id: "video", label: "Pre-recorded Video", desc: "Upload MP4 lessons", icon: Video },
                   { id: "live", label: "Live Session", desc: "Interactive classroom via Jitsi", icon: Users },
                   { id: "reading", label: "Reading Resource", desc: "PDFs and text material", icon: FileText }
                 ].map(type => {
                   const Icon = type.icon;
                   const active = formData.type === type.id;
                   return (
                     <button 
                       key={type.id}
                       onClick={() => setFormData({...formData, type: type.id})}
                       className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${active ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-100 dark:border-gray-800'}`}
                     >
                       <div className={`p-2 rounded-lg ${active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                         <Icon size={20} />
                       </div>
                       <div>
                         <h4 className={`font-bold ${active ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>{type.label}</h4>
                         <p className="text-xs text-gray-500 mt-0.5 font-medium">{type.desc}</p>
                       </div>
                     </button>
                   );
                 })}
              </div>
           </div>

           {formData.type === "video" && (
             <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Video File (Max 5MB)</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center bg-gray-50 dark:bg-[#0a0a0a] hover:border-emerald-500 transition-colors relative overflow-hidden">
                   <p className="text-xs font-bold text-emerald-600">{formData.file ? formData.file.name : "Click to select MP4"}</p>
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="video/*" onChange={handleFileChange} />
                </div>
             </div>
           )}

           <div className="flex items-center gap-3">
              <input type="checkbox" checked={formData.isFreePreview} onChange={e => setFormData({...formData, isFreePreview: e.target.checked})} className="w-5 h-5 accent-emerald-500" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Free Preview Lesson</p>
           </div>

           <div className="pt-6">
              <button 
                 onClick={handleSaveLesson}
                 disabled={saving}
                 className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                 {saving ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                 {saving ? "Uploading..." : "Add Lesson"}
              </button>
           </div>
        </div>
      </SlidePanel>
    </div>
  );
}
