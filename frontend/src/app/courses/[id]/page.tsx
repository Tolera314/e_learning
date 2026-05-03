"use client";

import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  CheckCircle2, 
  Globe, 
  Calendar, 
  FileText, 
  Video, 
  BookOpen, 
  User, 
  ChevronRight,
  ShieldCheck,
  Award,
  MessageCircle,
  Share2,
  Heart,
  Loader2
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CourseDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/courses/${courseId}`);
      setCourse(data);
    } catch (err) {
      console.error("Failed to fetch course details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      // Check if user is logged in
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return router.push(`/login?redirect=/courses/${courseId}`);
      }
      
      // Simulate/Trigger enrollment
      await api.post(`/enrollments`, { courseId });
      router.push(`/dashboard/student/courses/${courseId}`);
    } catch (err) {
      // Even if enrollment fails (e.g. already enrolled), redirect to student dashboard
      router.push(`/dashboard/student/courses/${courseId}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#050505] p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Course Not Found</h1>
        <Link href="/courses" className="text-emerald-600 font-bold hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      {/* HERO SECTION */}
      <header className="bg-gray-900 pt-32 pb-40 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[140%] bg-emerald-500 rotate-12 blur-3xl opacity-20" />
        </div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <nav className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest mb-8">
              <Link href="/courses">Marketplace</Link> <ChevronRight size={12} /> <span className="text-gray-400">Course Details</span>
            </nav>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
            >
              {course.title}
            </motion.h1>
            <motion.p 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
               className="text-xl text-gray-400 mb-10 font-medium"
            >
              {course.shortDescription}
            </motion.p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
               <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Star size={18} fill="currentColor" /> {course.rating || 4.8} <span className="text-gray-500 font-medium">({course.reviewCount || 0} reviews)</span>
               </div>
               <div className="flex items-center gap-2 text-white font-bold">
                  <Users size={18} className="text-emerald-500" /> {course._count?.enrollments || 0} Students
               </div>
               <div className="flex items-center gap-2 text-white font-bold">
                  <Globe size={18} className="text-blue-500" /> {course.language}
               </div>
               <div className="flex items-center gap-2 text-white font-bold">
                  <Calendar size={18} className="text-amber-500" /> Updated {new Date(course.updatedAt).toLocaleDateString()}
               </div>
            </div>
          </div>

          {/* PURCHASE CARD */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="hidden lg:block bg-white dark:bg-[#111] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl absolute right-6 top-32 w-96"
          >
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-8 relative flex items-center justify-center overflow-hidden">
               {course.thumbnailUrl ? (
                 <img src={course.thumbnailUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
               ) : (
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 to-blue-600/30" />
               )}
               <Play size={60} className="text-white relative z-10" fill="currentColor" />
               <span className="absolute bottom-4 text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">Preview this course</span>
            </div>
            
            <div className="text-4xl font-black text-gray-900 dark:text-white mb-8 flex items-end gap-2">
               {course.isFree ? "Free" : `${course.price} ETB`}
               {!course.isFree && course.discountPrice && <span className="text-lg text-gray-400 line-through font-bold">{course.discountPrice} ETB</span>}
            </div>

            <button 
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all transform hover:scale-[1.02] active:scale-95 mb-4 flex items-center justify-center gap-2"
            >
               {isEnrolling ? <Loader2 className="animate-spin" /> : "Enroll Now"} <ChevronRight size={20} />
            </button>
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">30-Day Money-Back Guarantee</p>

            <div className="space-y-4">
               <h4 className="font-bold text-gray-900 dark:text-white text-sm">This course includes:</h4>
               <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                     <Video size={16} className="text-emerald-500" /> {course.videoHours || "15+"} Video content
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                     <Clock size={16} className="text-emerald-500" /> {course._count?.modules || 0} Modules
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                     <ShieldCheck size={16} className="text-emerald-500" /> Certificate of completion
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                     <Globe size={16} className="text-emerald-500" /> Lifetime access
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-center gap-6 pt-10 border-t border-gray-100 dark:border-gray-800 mt-8">
               <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-emerald-500 transition-colors">
                  <Share2 size={20} /> <span className="text-[10px] font-bold uppercase">Share</span>
               </button>
               <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={20} /> <span className="text-[10px] font-bold uppercase">Wishlist</span>
               </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-24">
          {/* WHAT YOU'LL LEARN */}
          {course.objectives && course.objectives.length > 0 && (
            <section className="p-10 bg-gray-50 dark:bg-[#0a0a0a] rounded-[3rem] border border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">What you&apos;ll learn</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {course.objectives.map((obj: string, i: number) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-1" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{obj}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* DESCRIPTION */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Course Description</h2>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              {course.fullDescription}
            </div>
          </section>

          {/* INSTRUCTOR */}
          <section>
             <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Meet the Instructor</h2>
             <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden shrink-0 border-4 border-emerald-500/10">
                   {course.instructor?.avatar ? (
                     <img src={course.instructor.avatar} alt={course.instructor.name} className="absolute inset-0 w-full h-full object-cover" />
                   ) : (
                     <User className="absolute inset-0 m-auto text-gray-300" size={60} />
                   )}
                </div>
                <div className="space-y-6">
                   <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">{course.instructor?.name}</h3>
                      <p className="text-emerald-600 font-bold">Expert Instructor</p>
                   </div>
                   <p className="text-gray-500 font-medium leading-relaxed">
                      Learn from one of Ethiopia&apos;s leading educators with years of practical and theoretical experience in the field.
                   </p>
                </div>
             </div>
          </section>
        </div>
      </main>

      {/* MOBILE BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-50 flex items-center justify-between px-8">
         <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</div>
            <div className="text-xl font-black text-gray-900 dark:text-white">{course.price} ETB</div>
         </div>
         <button 
           onClick={handleEnroll}
           disabled={isEnrolling}
           className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
         >
            {isEnrolling ? <Loader2 className="animate-spin" /> : "Enroll Now"}
         </button>
      </div>
    </div>
  );
}
