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
  Video,
  Users,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  History,
  X
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

const CATEGORIES = ["All", "Physics", "Biology", "Mathematics", "English", "Chemistry", "History"];

const CourseCard = ({ course }: any) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-gray-800/50 overflow-hidden shadow-sm group hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500"
  >
    <Link href={`/dashboard/student/courses/${course.id}`} className="block">
      <div className="h-48 bg-gray-100 dark:bg-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 mix-blend-overlay" />
        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform duration-700">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="text-gray-400" size={60} />
          )}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
           <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest border border-white/20">
              {course.level}
           </div>
        </div>
        {course.isFree && (
          <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
             Free
          </div>
        )}
      </div>
    </Link>

    <div className="p-7">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">{course.category}</span>
        <div className="flex items-center gap-1">
          <Star size={12} className="text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {course.averageRating || "4.8"}
          </span>
        </div>
      </div>

      <Link href={`/dashboard/student/courses/${course.id}`}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">{course.title}</h3>
      </Link>

      <div className="flex items-center gap-2 mb-6 opacity-70">
        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
          {course.instructor?.avatar ? (
             <img src={course.instructor.avatar} className="w-full h-full rounded-full object-cover" alt="" />
          ) : (
             <User size={12} />
          )}
        </div>
        <span className="text-xs font-bold text-gray-500">{course.instructor?.name || "Expert Instructor"}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="flex items-center gap-2 text-gray-400">
          <Video size={14} className="text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{course.durationHours || "12h+"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Users size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{course._count?.enrollments || "0"} Students</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Award size={14} className="text-purple-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Certified</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-2xl font-black text-gray-900 dark:text-white">
          {course.isFree ? "Free" : `${course.price} ETB`}
        </div>
        <Link 
          href={`/dashboard/student/courses/${course.id}`}
          className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-all transform hover:rotate-12 group/btn"
        >
          <ChevronRight size={20} className="group-hover/btn:scale-110" />
        </Link>
      </div>
    </div>
  </motion.div>
);

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchTrending();
    fetchRecommended();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory === "All" ? "" : `&category=${selectedCategory}`;
      const response = await api.get(`/search?q=${searchQuery}${categoryParam}`);
      setCourses(response.data.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await api.get("/search/trending");
      setTrending(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommended = async () => {
    try {
      const response = await api.get("/search/recommended");
      setRecommended(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] pb-24 font-outfit">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[70%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8"
          >
            <TrendingUp size={14} /> Knowledge in high definition
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-8 tracking-tight"
          >
            Expand Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">Digital Horizon</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium"
          >
            A video-first learning experience designed for the next generation of Ethiopian students.
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
             className="max-w-2xl mx-auto relative group"
             onFocus={() => setShowSearchHistory(true)}
             onBlurCapture={() => setTimeout(() => setShowSearchHistory(false), 200)}
          >
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={24} />
             <input 
               type="text" 
               placeholder="Search by subject, instructor, or topic..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-16 pr-8 py-6 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg font-medium"
             />

             {/* INTELLIGENT SEARCH POPUP */}
             <AnimatePresence>
                {showSearchHistory && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-[#111] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl z-50 overflow-hidden text-left p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={12} className="text-emerald-500" /> Trending Searches
                      </h4>
                      <button onClick={() => setShowSearchHistory(false)} className="text-gray-400 hover:text-gray-900">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                       {trending.length > 0 ? trending.map((item, idx) => (
                         <button 
                            key={idx}
                            onClick={() => setSearchQuery(item.query)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-600 hover:bg-emerald-500 hover:text-white transition-all capitalize"
                         >
                            {item.query}
                         </button>
                       )) : (
                         <p className="text-xs text-gray-400">Discover what others are learning...</p>
                       )}
                    </div>

                    {recommended.length > 0 && (
                      <>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <Sparkles size={12} className="text-blue-500" /> Recommended for You
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recommended.slice(0, 4).map(course => (
                            <Link key={course.id} href={`/dashboard/student/courses/${course.id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                               <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0">
                                  {course.thumbnailUrl && <img src={course.thumbnailUrl} className="w-full h-full object-cover rounded-xl" />}
                               </div>
                               <div className="overflow-hidden">
                                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{course.title}</p>
                                  <p className="text-[10px] text-gray-500">{course.instructor?.name}</p>
                               </div>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
             </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-8 py-3.5 rounded-2xl text-sm font-black whitespace-nowrap transition-all ${
                selectedCategory === category 
                ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 -translate-y-1" 
                : "bg-white dark:bg-[#111] text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-gray-800"
              }`}
            >
              {category}
            </button>
          ))}
          <div className="h-10 w-px bg-gray-100 dark:bg-gray-800 mx-2" />
          <button className="flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-black text-sm hover:scale-105 transition-all">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* RECOMMENDED SECTION (IF NOT SEARCHING) */}
      {!searchQuery && recommended.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mb-20">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                  <Sparkles size={20} />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Personalized for You</h2>
                  <p className="text-sm text-gray-500 font-medium tracking-tight">Based on your recent interests and searches</p>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
               {recommended.map(course => (
                 <CourseCard key={course.id} course={course} />
               ))}
            </div>
        </section>
      )}

      {/* SEARCH/MARKETPLACE GRID */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <BookOpen size={20} />
           </div>
           <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
             {searchQuery ? `Search Results for "${searchQuery}"` : "All Courses"}
           </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 opacity-50">
             {[1,2,3,4].map(i => (
               <div key={i} className="h-96 bg-gray-100 dark:bg-gray-900 rounded-[2.5rem] animate-pulse" />
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            <AnimatePresence mode="popLayout">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && courses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-32 text-center"
          >
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="text-gray-300" size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">No matches found</h3>
            <p className="text-gray-500 mt-2 font-medium">Try adjusting your filters or search keywords.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
