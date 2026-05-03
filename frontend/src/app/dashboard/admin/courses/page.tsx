"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Users, 
  Layers, 
  Loader2,
  Calendar,
  MoreVertical,
  Ban,
  Tag,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Course {
  id: string;
  title: string;
  category: string;
  visibility: string;
  price: number;
  createdAt: string;
  instructor: {
    name: string;
    email: string;
  };
  _count: {
    enrollments: number;
    modules: number;
  };
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/courses", {
        params: {
          visibility: statusFilter || undefined
        }
      });
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [statusFilter]);

  const updateStatus = async (courseId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/courses/${courseId}/status`, { visibility: newStatus });
      setCourses(courses.map(c => c.id === courseId ? { ...c, visibility: newStatus } : c));
      toast.success(`Course status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BookOpen className="text-emerald-600" size={32} />
            Course Catalog Oversight
          </h1>
          <p className="text-gray-500 mt-1">Audit, approve, and manage all learning content platform-wide.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Courses</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{courses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search courses or instructors..." 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="p-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-medium"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800">
              <Loader2 className="animate-spin text-emerald-600" size={40} />
              <p className="text-gray-500 font-medium">Scanning catalog...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-20 text-center text-gray-500 italic bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800">
              No courses found.
            </div>
          ) : (
            filteredCourses.map((course) => (
              <motion.div 
                key={course.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#111] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col lg:flex-row items-center gap-6"
              >
                {/* Thumbnail Placeholder */}
                <div className="w-full lg:w-48 h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group overflow-hidden relative">
                  <BookOpen size={32} className="group-hover:scale-110 transition-transform" />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                    <Tag size={10} /> {course.category}
                  </div>
                </div>

                {/* Course Metadata */}
                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{course.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <GraduationCap size={14} className="text-emerald-600" />
                        by <span className="font-semibold text-gray-700 dark:text-gray-300">{course.instructor.name}</span>
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                      course.visibility === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                      course.visibility === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 font-black animate-pulse' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700/50'
                    }`}>
                      {course.visibility.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl">
                      <Users size={14} className="text-blue-500" /> {course._count.enrollments} Students
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl">
                      <Layers size={14} className="text-purple-500" /> {course._count.modules} Modules
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl">
                      <Calendar size={14} className="text-gray-400" /> Created {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 lg:flex-col gap-2 w-full lg:w-auto">
                  {course.visibility === 'PENDING_APPROVAL' ? (
                    <button 
                      onClick={() => updateStatus(course.id, 'PUBLISHED')}
                      className="flex-1 lg:w-32 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Approve
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateStatus(course.id, course.visibility === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED')}
                      className={`flex-1 lg:w-32 py-2.5 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        course.visibility === 'PUBLISHED' 
                          ? 'border-amber-200 text-amber-600 hover:bg-amber-50' 
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {course.visibility === 'PUBLISHED' ? <><Ban size={16} /> Block</> : <><CheckCircle2 size={16} /> Publish</>}
                    </button>
                  )}
                  <button className="flex-1 lg:w-32 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                    <Eye size={16} /> Preview
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
