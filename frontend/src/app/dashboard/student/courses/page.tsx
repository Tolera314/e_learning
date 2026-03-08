"use client";

import { 
  Search, 
  Filter, 
  BookOpen, 
  Star, 
  User, 
  Play, 
  CheckCircle2,
  Clock,
  Heart
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const COURSES = [
  { id: "1", title: "Advanced Calculus for G12", instructor: "Dr. Abebe Kebede", progress: 65, rating: 4.8, status: "in-progress", image: "/course1.jpg" },
  { id: "2", title: "Physics Fundamentals: Mechanics", instructor: "Prof. Sara Tesfaye", progress: 12, rating: 4.9, status: "in-progress", image: "/course2.jpg" },
  { id: "3", title: "Introduction to Amharic Literature", instructor: "Mulugeta Haile", progress: 100, rating: 4.7, status: "completed", image: "/course3.jpg" },
  { id: "4", title: "Biology: Modern Genetics", instructor: "Dr. Dawit G/M", progress: 0, rating: 4.6, status: "saved", image: "/course4.jpg" },
];

const CourseCard = ({ course }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm group hover:border-emerald-500 transition-all"
  >
    <div className="h-48 bg-gray-100 dark:bg-gray-800 relative">
       <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-blue-600/10 flex items-center justify-center">
          <BookOpen className="text-white/20" size={60} />
       </div>
       {course.status === 'completed' && (
          <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 p-2 rounded-xl backdrop-blur-md">
             <CheckCircle2 size={20} />
          </div>
       )}
    </div>
    <div className="p-6">
       <div className="flex items-center gap-2 mb-3">
          <div className="p-1 px-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
             <Star size={12} className="text-amber-500" /> {course.rating}
          </div>
          <div className="p-1 px-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
             <Clock size={12} className="text-emerald-500" /> 12h 45m
          </div>
       </div>
       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-emerald-600 transition-colors">{course.title}</h3>
       <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
             <User size={12} />
          </div>
          <span className="text-xs text-gray-500 font-medium">{course.instructor}</span>
       </div>

       {course.status !== 'saved' && (
          <div className="space-y-3 mb-6">
             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Progress</span>
                <span>{course.progress}%</span>
             </div>
             <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${course.progress}%` }}
                   className="h-full bg-emerald-600 rounded-full" 
                />
             </div>
          </div>
       )}

       <button className="w-full py-3.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-bold text-sm hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
          {course.status === 'completed' ? 'Re-watch Lessons' : course.status === 'saved' ? 'Start Enrollment' : 'Continue Learning'} <Play size={14} fill="currentColor" />
       </button>
    </div>
  </motion.div>
);

export default function MyCourses() {
  const [activeTab, setActiveTab] = useState("in-progress");

  const filteredCourses = COURSES.filter(c => c.status === activeTab);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Academic Library</h1>
          <p className="text-gray-500 mt-2">Manage your enrolled courses and track your academic progress.</p>
        </div>
        <div className="relative group">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
           <input 
             type="text" 
             placeholder="Find a course..." 
             className="pl-12 pr-6 py-3.5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm w-full md:w-80 shadow-sm"
           />
        </div>
      </header>

      {/* TABS */}
      <div className="flex items-center gap-4 sm:gap-8 border-b border-gray-100 dark:border-gray-800 mb-10 overflow-x-auto pb-px scrollbar-hide">
         {[
            { id: "in-progress", label: "In Progress", icon: <Clock size={16} /> },
            { id: "completed", label: "Completed", icon: <CheckCircle2 size={16} /> },
            { id: "saved", label: "Wishlist", icon: <Heart size={16} /> },
         ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all relative shrink-0 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
               {tab.icon} {tab.label}
               {activeTab === tab.id && (
                  <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
               )}
            </button>
         ))}
      </div>

      {/* COURSE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
         {filteredCourses.map(course => <CourseCard key={course.id} course={course} />)}
         
         {filteredCourses.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50/50 dark:bg-gray-800/20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
               <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">No courses found</h3>
               <p className="text-sm text-gray-500 mt-2">Browse the marketplace to find your next learning goal.</p>
               <button className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20">Explore Courses</button>
            </div>
         )}
      </div>
    </div>
  );
}
