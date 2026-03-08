"use client";

import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  BarChart2, 
  Edit3, 
  Users, 
  Star,
  BookOpen
} from "lucide-react";
import Link from "next/link";

const COURSES = [
  { id: "1", title: "Advanced Calculus for Grade 12", category: "Mathematics", students: 1248, rating: 4.8, status: "PUBLISHED", thumbnail: "Math" },
  { id: "2", title: "Physics Fundamentals: Mechanics", category: "Physics", students: 856, rating: 4.9, status: "PUBLISHED", thumbnail: "Physics" },
  { id: "3", title: "Organic Chemistry Deep Dive", category: "Chemistry", students: 420, rating: 4.7, status: "PENDING_APPROVAL", thumbnail: "Chem" },
  { id: "4", title: "Introduction to Ethiopian History", category: "Social Studies", students: 0, rating: 0, status: "DRAFT", thumbnail: "History" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    PENDING_APPROVAL: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
    DRAFT: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-100 dark:border-gray-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
};

export default function InstructorCourses() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage, edit, and track the performance of your courses.</p>
        </div>
        <Link href="/dashboard/instructor/courses/create" className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all text-center justify-center">
          <Plus size={20} />
          Create New Course
        </Link>
      </header>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
            />
         </div>
         <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Filter size={18} />
            Filter
         </button>
      </div>

      {/* COURSE TABLE */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Course Details</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Stats</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {COURSES.map((course) => (
                     <tr key={course.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-16 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center font-bold text-emerald-600 text-xs">
                                 {course.thumbnail}
                              </div>
                              <div>
                                 <p className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{course.title}</p>
                                 <p className="text-xs text-gray-500 mt-1">{course.category}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                 <Users size={16} className="text-gray-400" />
                                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{course.students}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Star size={16} className="text-amber-500 fill-amber-500" />
                                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{course.rating || "N/A"}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <StatusBadge status={course.status} />
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors" title="Edit Course">
                                 <Edit3 size={18} />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View Analytics">
                                 <BarChart2 size={18} />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                 <MoreVertical size={18} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {COURSES.length === 0 && (
            <div className="p-20 text-center">
               <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen size={40} className="text-gray-300" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No courses yet</h3>
               <p className="text-gray-500 mb-8">Start by creating your first digital course today.</p>
               <Link href="/dashboard/instructor/courses/create" className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold">
                  Create Course
               </Link>
            </div>
         )}
      </div>
    </div>
  );
}
