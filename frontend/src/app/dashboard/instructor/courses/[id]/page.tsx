"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Plus, 
  Video, 
  Users, 
  FileText, 
  Settings, 
  Save, 
  GripVertical,
  Trash2,
  PlayCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import SlidePanel from "@/components/SlidePanel";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function LessonEditor() {
  const params = useParams();
  const courseId = params?.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // New Lesson Form
  const [formData, setFormData] = useState({
    title: "",
    type: "video",
    file: null as File | null,
    liveDate: "",
    content: "",
    isFreePreview: false
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchCurriculum();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      setCourse(data);
    } catch (err) {
      console.error("Fetch Course Error:", err);
    }
  };

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/lessons/courses/${courseId}/curriculum`);
      setModules(data);
    } catch (err) {
      toast.error("Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    const title = prompt("Enter Module Title:");
    if (!title) return;

    try {
      await api.post(`/lessons/modules/${courseId}`, { title, orderIndex: modules.length });
      fetchCurriculum();
      toast.success("Module created");
    } catch (err) {
      toast.error("Failed to create module");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Delete module and all its lessons?")) return;
    try {
      await api.delete(`/lessons/modules/${moduleId}`);
      fetchCurriculum();
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
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error("File exceeds 100MB limit");
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
      fetchCurriculum();
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
      fetchCurriculum();
      if (activeLesson?.id === lessonId) setActiveLesson(null);
      toast.success("Lesson deleted");
    } catch (err) {
      toast.error("Failed to delete lesson");
    }
  };

  const getIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    switch(t) {
      case "video": return <PlayCircle size={16} />;
      case "live": return <Users size={16} />;
      case "reading": return <FileText size={16} />;
      default: return <Video size={16} />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-10">
      {/* HEADER */}
      <header className="flex items-center justify-between p-6 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-gray-800 shrink-0">
         <div className="flex items-center gap-4">
            <Link href="/dashboard/instructor/courses" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors">
               <ChevronLeft size={20} />
            </Link>
            <div>
               <h1 className="text-xl font-bold text-gray-900 dark:text-white">Curriculum Editor</h1>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{course?.title || "Loading Course..."}</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-lg text-xs font-bold">
               <Save size={14} /> Auto-saving enabled
            </div>
         </div>
      </header>

      {/* SPLIT SCREEN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
         
         {/* LEFT: MODULE LIST */}
         <div className="w-[350px] shrink-0 bg-gray-50/50 dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#111]">
               <h2 className="font-bold text-gray-900 dark:text-white">Course Outline</h2>
               <button onClick={handleAddModule} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Add Module">
                  <Plus size={16} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
               {loading ? (
                 <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
               ) : modules.map((module) => (
                 <div key={module.id} className="space-y-2">
                    <div className="flex items-center justify-between group">
                       <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{module.title}</h3>
                       <div className="flex items-center gap-2">
                         <button 
                           onClick={() => handleOpenAddLesson(module.id)}
                           className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                         >
                           <Plus size={10} /> Add Lesson
                         </button>
                         <button onClick={() => handleDeleteModule(module.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10}/></button>
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       {module.lessons && module.lessons.map((lesson: any) => (
                         <div 
                           key={lesson.id} 
                           onClick={() => setActiveLesson(lesson)}
                           className={`group flex items-center gap-3 p-3 bg-white dark:bg-[#111] border rounded-2xl cursor-pointer transition-all ${activeLesson?.id === lesson.id ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}
                         >
                            <GripVertical size={14} className="text-gray-300 dark:text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeLesson?.id === lesson.id ? 'bg-emerald-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500'}`}>
                               {getIcon(lesson.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className={`text-sm font-bold truncate ${activeLesson?.id === lesson.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{lesson.title}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-[10px] text-gray-400 font-medium capitalize">{lesson.type}</p>
                                  {lesson.isFreePreview && <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">Free Preview</span>}
                               </div>
                            </div>
                         </div>
                       ))}
                       {(!module.lessons || module.lessons.length === 0) && (
                         <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-center text-xs text-gray-400 font-medium">
                           No lessons yet.
                         </div>
                       )}
                    </div>
                 </div>
               ))}
               {!loading && modules.length === 0 && (
                 <div className="text-center py-10">
                   <AlertCircle size={32} className="mx-auto text-gray-300 mb-4" />
                   <p className="text-xs text-gray-500">No modules yet. Click + to start.</p>
                 </div>
               )}
            </div>
         </div>

         {/* RIGHT: EDITOR */}
         <div className="flex-1 bg-white dark:bg-[#111] flex flex-col overflow-y-auto custom-scrollbar">
            {activeLesson ? (
              <div className="max-w-3xl mx-auto w-full p-10 space-y-8">
                 <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                         {getIcon(activeLesson.type)} {activeLesson.type} Lesson
                      </p>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeLesson.title}</h2>
                    </div>
                    <button onClick={() => handleDeleteLesson(activeLesson.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors shrink-0" title="Delete Lesson">
                       <Trash2 size={20} />
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Lesson Title</label>
                       <input 
                         type="text" 
                         value={activeLesson.title}
                         readOnly
                         className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none text-gray-400"
                       />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
                       <div>
                          <p className="font-bold text-gray-900 dark:text-white">Free Preview</p>
                          <p className="text-xs text-gray-500 mt-1">Allow unsubscribed students to watch this lesson.</p>
                       </div>
                       <input 
                         type="checkbox" 
                         checked={activeLesson.isFreePreview || false}
                         disabled
                         className="w-6 h-6 rounded-lg accent-emerald-500"
                       />
                    </div>

                    {activeLesson.videoUrl && (
                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Lesson Video</label>
                          <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative group">
                             <video src={activeLesson.videoUrl} controls className="w-full h-full" />
                          </div>
                       </div>
                    )}
                 </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                 <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
                    <Video size={40} className="text-gray-300" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a lesson</h2>
                 <p className="text-gray-500 max-w-sm">Choose a lesson from the left panel to preview its content.</p>
              </div>
            )}
         </div>
      </div>

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
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Video File (Max 100MB)</label>
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
                 {saving ? "Uploading & Saving..." : "Add Lesson"}
              </button>
           </div>
        </div>
      </SlidePanel>
    </div>
  );
}
