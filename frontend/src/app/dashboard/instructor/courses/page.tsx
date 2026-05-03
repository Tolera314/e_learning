"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Users, 
  Star,
  BookOpen,
  Edit3,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import SlidePanel from "@/components/SlidePanel";
import api from "@/lib/api";
import { useEffect } from "react";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function InstructorCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    api.get("/instructor/courses")
      .then(res => setCourses(res.data.data || res.data)) // Handle paginated response
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    language: "English",
    segment: "UNIVERSITY"
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({ title: "", description: "", category: "", level: "Beginner", language: "English", segment: "UNIVERSITY" });
    setThumbnail(null);
    setPreviewUrl(null);
    setIsPanelOpen(true);
  };

  const handleOpenEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({ 
      title: course.title, 
      description: course.shortDescription || "", 
      category: course.category, 
      level: course.level || "Beginner", 
      language: course.language || "English",
      segment: course.segment || "UNIVERSITY"
    });
    setPreviewUrl(course.thumbnailUrl || null);
    setIsPanelOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be under 5MB");
        return;
      }
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveCourse = async () => {
    if (formData.title.length < 10) {
      alert("Title must be at least 10 characters");
      return;
    }
    
    setSaving(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("shortDescription", formData.description);
      data.append("category", formData.category);
      data.append("level", formData.level);
      data.append("language", formData.language);
      data.append("segment", formData.segment);
      if (thumbnail) data.append("thumbnail", thumbnail);
      
      // Modules and other fields can be added here as stringified JSON if needed
      data.append("modules", JSON.stringify([]));

      if (editingCourse) {
        await api.patch(`/courses/${editingCourse.id}`, data);
      } else {
        await api.post("/courses", data);
      }
      
      fetchCourses();
      setIsPanelOpen(false);
    } catch (err) {
      console.error("Failed to save course:", err);
      alert("Error saving course. Please check your data.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course forever?")) {
      try {
        await api.delete(`/courses/${id}`);
        setCourses(courses.filter(c => c.id !== id));
      } catch (e) {
        alert("Failed to delete course.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your curriculum, assignments, and quizzes clearly.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all text-center justify-center"
        >
          <Plus size={20} />
          Create Course
        </button>
      </header>

      {/* SEARCH */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by title..." 
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
        />
      </div>

      {/* COURSE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({length:3}).map((_,i) => <div key={i} className="h-72 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />)
        ) : courses.map((course) => (
          <div key={course.id} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
            <div className={`h-48 relative overflow-hidden`}>
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  <Video size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <div className="absolute top-4 right-4">
                <StatusBadge status={course.status || "DRAFT"} />
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{course.category}</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-4 line-clamp-2">{course.title}</h3>
              
              <div className="flex items-center gap-4 text-sm font-bold text-gray-600 dark:text-gray-300 mb-6 mt-auto">
                <span className="flex items-center gap-1.5"><Users size={16} className="text-emerald-500" /> {course.students || 0}</span>
                <span className="flex items-center gap-1.5"><Star size={16} className="text-amber-500 fill-amber-500" /> {course.rating === 0 || !course.rating ? "New" : course.rating}</span>
              </div>
              
              <div className="pt-5 border-t border-gray-100 dark:border-gray-800 grid grid-cols-4 gap-2">
                <button onClick={() => handleOpenEdit(course)} className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all" title="Edit Info">
                   <Edit3 size={18} />
                </button>
                <Link href={`/dashboard/instructor/courses/${course.id}`} className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" title="Manage Lessons">
                  <Video size={18} />
                </Link>
                <Link href={`/dashboard/instructor/courses/${course.id}/quizzes`} className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all" title="Quizzes">
                  <HelpCircle size={18} />
                </Link>
                <Link href={`/dashboard/instructor/courses/${course.id}/assignments`} className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" title="Assignments">
                  <FileText size={18} />
                </Link>
                <button onClick={() => handleDelete(course.id)} className="col-span-4 mt-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && courses.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Courses Found</h3>
            <p className="text-gray-500">Click the button above to create your first course.</p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT COURSE SLIDE PANEL */}
      <SlidePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        title={editingCourse ? "Edit Course Info" : "Create New Course"}
        subtitle="Saved automatically as draft."
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Course Title *</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Master Calculus for Grade 12" 
              className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
            />
            {formData.title.length > 0 && formData.title.length < 10 && <p className="text-xs text-red-500 mt-2">Title must be at least 10 chars</p>}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Short Description *</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What will students learn?" 
              className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category (e.g. Mathematics)</label>
              <input 
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="Custom category name..."
                className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Academic Segment</label>
              <select 
                value={formData.segment}
                onChange={(e) => setFormData({...formData, segment: e.target.value})}
                className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="KG_G5">KG to Grade 5</option>
                <option value="G6_G12">Grade 6 to 12</option>
                <option value="UNIVERSITY">University & Professional</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Difficulty Level</label>
              <select 
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white"
              >
                {["Beginner", "Intermediate", "Advanced"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Course Thumbnail</label>
             <label className="block border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center bg-gray-50 dark:bg-[#0a0a0a] cursor-pointer hover:border-emerald-500 transition-colors relative overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                ) : null}
                <div className="relative z-10">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{thumbnail ? thumbnail.name : "Click to upload image"}</p>
                  <p className="text-xs text-gray-500 mt-1">16:9 ratio, Max 5MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
             </label>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleSaveCourse}
              disabled={saving}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : null}
              {saving ? "Saving Course..." : "Save Course Draft"}
            </button>
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}
