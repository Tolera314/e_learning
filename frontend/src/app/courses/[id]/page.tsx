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
  Heart
} from "lucide-react";
import { useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock data for a single course
const COURSE_DATA = {
  id: "1",
  title: "Advanced Calculus for Grade 12",
  subtitle: "Master complex integration, differentiation, and their real-world applications for the national exam.",
  instructor: {
    name: "Dr. Abebe Kebede",
    role: "Senior Mathematics Lecturer",
    bio: "Dr. Abebe has over 15 years of experience teaching advanced mathematics in Ethopia's top universities. He specializes in making complex concepts accessible to high school students.",
    students: "10k+",
    courses: 12,
    rating: 4.9,
    avatar: "/instructor-abebe.jpg"
  },
  rating: 4.8,
  reviewCount: 1250,
  students: 8400,
  lastUpdated: "March 2026",
  language: "English / Amharic",
  price: 450,
  isFree: false,
  videoHours: "15.5 hours",
  liveSessions: 8,
  totalResources: 24,
  objectives: [
    "Master definite and indefinite integrals",
    "Apply calculus to physical motion and economics",
    "Solve complex differential equations with ease",
    "Prepare thoroughly for the Ethiopian National Exam",
    "Understand the geometric interpretation of derivatives"
  ],
  modules: [
    {
      id: "m1",
      title: "Module 1: Foundations of Integration",
      lessons: [
        { id: "l1", title: "Introduction to Calculus", type: "VIDEO", duration: "12:45", isFree: true },
        { id: "l2", title: "Meet the Instructor", type: "LIVE", duration: "Scheduled: Mon 10AM", isFree: true },
        { id: "l3", title: "Review of Differentiation", type: "VIDEO", duration: "45:20", isFree: false }
      ]
    },
    {
      id: "m2",
      title: "Module 2: Advanced Techniques",
      lessons: [
        { id: "l4", title: "Integration by Parts", type: "VIDEO", duration: "55:10", isFree: false },
        { id: "l5", title: "Group Study: Complex Problems", type: "READING", duration: "Collaborative", isFree: false },
        { id: "l6", title: "Live Session: Q&A on Module 2", type: "LIVE", duration: "Scheduled: Wed 2PM", isFree: false },
        { id: "l7", title: "Mid-Term Practice Quiz", type: "QUIZ", duration: "15 Questions", isFree: false }
      ]
    }
  ]
};

export default function CourseDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = () => {
    setIsEnrolling(true);
    // Simulate enrollment logic
    setTimeout(() => {
      router.push(`/dashboard/student/courses/${resolvedParams.id}`);
    }, 1500);
  };

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
              {COURSE_DATA.title}
            </motion.h1>
            <motion.p 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
               className="text-xl text-gray-400 mb-10 font-medium"
            >
              {COURSE_DATA.subtitle}
            </motion.p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
               <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Star size={18} fill="currentColor" /> {COURSE_DATA.rating} <span className="text-gray-500 font-medium">({COURSE_DATA.reviewCount} reviews)</span>
               </div>
               <div className="flex items-center gap-2 text-white font-bold">
                  <Users size={18} className="text-emerald-500" /> {COURSE_DATA.students.toLocaleString()} Students
               </div>
               <div className="flex items-center gap-2 text-white font-bold">
                  <Globe size={18} className="text-blue-500" /> {COURSE_DATA.language}
               </div>
               <div className="flex items-center gap-2 text-white font-bold">
                  <Calendar size={18} className="text-amber-500" /> Updated {COURSE_DATA.lastUpdated}
               </div>
            </div>
          </div>

          {/* PURCHASE CARD (Fixed on mobile/Sidebar on desktop) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="hidden lg:block bg-white dark:bg-[#111] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl absolute right-6 top-32 w-96"
          >
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-8 relative flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 to-blue-600/30" />
               <Play size={60} className="text-white relative z-10" fill="currentColor" />
               <span className="absolute bottom-4 text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">Preview this course</span>
            </div>
            
            <div className="text-4xl font-black text-gray-900 dark:text-white mb-8 flex items-end gap-2">
               {COURSE_DATA.isFree ? "Free" : `${COURSE_DATA.price} ETB`}
               {!COURSE_DATA.isFree && <span className="text-lg text-gray-400 line-through font-bold">1,200 ETB</span>}
            </div>

            <button 
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all transform hover:scale-[1.02] active:scale-95 mb-4 flex items-center justify-center gap-2"
            >
               {isEnrolling ? "Processing..." : "Enroll Now"} <ChevronRight size={20} />
            </button>
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">30-Day Money-Back Guarantee</p>

            <div className="space-y-4">
               <h4 className="font-bold text-gray-900 dark:text-white text-sm">This course includes:</h4>
               <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                     <Video size={16} className="text-emerald-500" /> {COURSE_DATA.videoHours} Video content
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                     <Clock size={16} className="text-emerald-500" /> {COURSE_DATA.liveSessions} Live class sessions
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                     <FileText size={16} className="text-emerald-500" /> {COURSE_DATA.totalResources} Reading materials
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
               <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <MessageCircle size={20} /> <span className="text-[10px] font-bold uppercase">Gift</span>
               </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-24">
          {/* WHAT YOU'LL LEARN */}
          <section className="p-10 bg-gray-50 dark:bg-gray-[#0a0a0a] rounded-[3rem] border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">What you&apos;ll learn</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {COURSE_DATA.objectives.map((obj, i) => (
                <div key={i} className="flex gap-4">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-1" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{obj}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CURRICULUM */}
          <section>
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black text-gray-900 dark:text-white">Course Curriculum</h2>
               <span className="text-sm text-gray-500 font-bold">{COURSE_DATA.modules.length} modules • {COURSE_DATA.modules.reduce((acc, m) => acc + m.lessons.length, 0)} sessions</span>
            </div>
            
            <div className="space-y-6">
               {COURSE_DATA.modules.map((module) => (
                  <div key={module.id} className="border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden">
                     <div className="p-6 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white">{module.title}</h3>
                        <span className="text-xs text-gray-500 font-medium">{module.lessons.length} sections</span>
                     </div>
                     <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {module.lessons.map(lesson => (
                           <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                              <div className="flex items-center gap-4">
                                 {lesson.type === 'VIDEO' && <Video size={18} className="text-blue-500" />}
                                 {lesson.type === 'LIVE' && <Users size={18} className="text-amber-500" />}
                                 {lesson.type === 'READING' && <FileText size={18} className="text-emerald-500" />}
                                 {lesson.type === 'QUIZ' && <Award size={18} className="text-purple-500" />}
                                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:underline">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-6">
                                 {lesson.isFree && <span className="text-[10px] font-black text-emerald-600 uppercase">Preview</span>}
                                 <span className="text-xs text-gray-400 font-medium">{lesson.duration}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
          </section>

          {/* INSTRUCTOR */}
          <section>
             <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Meet the Instructor</h2>
             <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden shrink-0 border-4 border-emerald-500/10">
                   <User className="absolute inset-0 m-auto text-gray-300" size={60} />
                </div>
                <div className="space-y-6">
                   <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">{COURSE_DATA.instructor.name}</h3>
                      <p className="text-emerald-600 font-bold">{COURSE_DATA.instructor.role}</p>
                   </div>
                   
                   <div className="flex gap-8">
                      <div className="flex items-center gap-2">
                         <Star size={18} className="text-amber-500" fill="currentColor" />
                         <span className="text-sm font-bold text-gray-900 dark:text-white">{COURSE_DATA.instructor.rating} Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Users size={18} className="text-blue-500" />
                         <span className="text-sm font-bold text-gray-900 dark:text-white">{COURSE_DATA.instructor.students} Students</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Play size={18} className="text-emerald-500" />
                         <span className="text-sm font-bold text-gray-900 dark:text-white">{COURSE_DATA.instructor.courses} Courses</span>
                      </div>
                   </div>

                   <p className="text-gray-500 font-medium leading-relaxed">
                      {COURSE_DATA.instructor.bio}
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
            <div className="text-xl font-black text-gray-900 dark:text-white">{COURSE_DATA.price} ETB</div>
         </div>
         <button 
           onClick={handleEnroll}
           className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
         >
            Enroll Now
         </button>
      </div>
    </div>
  );
}
