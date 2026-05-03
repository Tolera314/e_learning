"use client";

import {
   ChevronLeft,
   Play,
   CheckCircle2,
   Lock,
   FileText,
   Download,
   MessageSquare,
   HelpCircle,
   ChevronRight,
   Menu,
   Users,
   StickyNote,
   Send,
   Trophy
} from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

const QuizPlayer = dynamic(() => import("@/components/QuizPlayer"), { ssr: false, loading: () => <div className="p-10 text-center animate-pulse text-emerald-500 font-bold">Loading Academic Engine...</div> });
const CourseVideoPlayer = dynamic(() => import("@/components/CourseVideoPlayer"), { loading: () => <div className="aspect-video bg-gray-900 rounded-[2.5rem] animate-pulse" /> });
const ReadingViewer = dynamic(() => import("@/components/ReadingViewer"), { ssr: false, loading: () => <div className="h-[700px] bg-gray-100 dark:bg-gray-900 rounded-[2.5rem] animate-pulse" /> });
const LearningTools = dynamic(() => import("@/components/LearningTools"), { loading: () => <div className="h-full w-[400px] bg-gray-50 dark:bg-[#111] animate-pulse shrink-0" /> });
const JitsiMeeting = dynamic(() => import("@/components/JitsiMeeting"), { ssr: false, loading: () => <div className="aspect-video bg-[#050505] rounded-[2.5rem] animate-pulse" /> });
const StudentAssignmentView = dynamic(() => import("@/components/StudentAssignmentView"), { loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-[2rem] animate-pulse" /> });
const DiscussionForum = dynamic(() => import("@/components/DiscussionForum"), { loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-[2rem] animate-pulse" /> });
const CertificateRenderer = dynamic(() => import("@/components/CertificateRenderer"), { ssr: false });

// MOCK_QUESTIONS and CURRICULUM removed in favor of real data

export default function CourseLearningPage() {
   const params = useParams();
   const router = useRouter();
   const courseId = params?.id as string;
   
   const [sidebarOpen, setSidebarOpen] = useState(true);
   const [toolsOpen, setToolsOpen] = useState(true);
   const [activeTab, setActiveTab] = useState("overview");
   const [showCertificate, setShowCertificate] = useState(false);
   
   const [loading, setLoading] = useState(true);
   const [courseData, setCourseData] = useState<any>(null);
   const [activeLesson, setActiveLesson] = useState<any>(null);

   const fetchCourseData = React.useCallback(async () => {
      try {
         const res = await api.get(`/student/courses/${courseId}`);
         setCourseData(res.data);
         if (!activeLesson && res.data.curriculum?.[0]?.lessons?.[0]) {
            setActiveLesson(res.data.curriculum[0].lessons[0]);
         }
      } catch (err) {
         toast.error("Failed to load course content");
         console.error(err);
      } finally {
         setLoading(false);
      }
   }, [courseId, activeLesson]);

   React.useEffect(() => {
      if (courseId) fetchCourseData();
   }, [courseId, fetchCourseData]);

   const handleProgress = async (percent: number, durationWatched?: number) => {
      if (percent > 90 && !activeLesson.completed) {
         try {
            await api.post(`/student/lessons/${activeLesson.id}/progress`, {
                progress: percent,
                durationWatched: durationWatched || 0
            });
            
            // Update local state for immediate feedback
            setCourseData((prev: any) => {
                if (!prev) return prev;
                const newCurriculum = prev.curriculum.map((module: any) => ({
                    ...module,
                    lessons: module.lessons.map((lesson: any) => 
                        lesson.id === activeLesson.id ? { ...lesson, completed: true } : lesson
                    )
                }));
                return { ...prev, curriculum: newCurriculum };
            });

            toast.success("Lesson completed!");
         } catch (err) {
            console.error("Progress save failed", err);
         }
      } else if (durationWatched) {
          // Just save watch time without completing
          api.post(`/student/lessons/${activeLesson.id}/progress`, {
            progress: percent,
            durationWatched
          }).catch(console.error);
      }
   };

   if (loading) return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
          <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing Learning Environment...</p>
          </div>
      </div>
   );

   if (!courseData) return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
          <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Not Found</h2>
              <Link href="/dashboard/student/courses" className="mt-4 text-emerald-600 font-bold block">Back to Dashboard</Link>
          </div>
      </div>
   );

   const curriculum = courseData.curriculum || [];
   const courseProgress = courseData.progress || 0;

   return (
      <div className="flex h-[calc(100vh-80px)] overflow-hidden -m-10">
         {/* CURRICULUM SIDEBAR */}
         <AnimatePresence mode="wait">
            {sidebarOpen && (
               <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 350, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-white dark:bg-[#111] border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 overflow-hidden"
               >
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                     <Link href="/dashboard/student/courses" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors uppercase tracking-widest mb-4">
                        <ChevronLeft size={14} /> Back to My Courses
                     </Link>
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">{courseData.title}</h2>
                     <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                         <span>{Math.round(courseProgress)}% Completed</span>
                         <span>{curriculum.reduce((acc: number, mod: any) => acc + mod.lessons.filter((l:any) => l.completed).length, 0)} / {curriculum.reduce((acc: number, mod: any) => acc + mod.lessons.length, 0)} Lessons</span>
                     </div>
                     <div className="mt-2 h-1.5 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${courseProgress}%` }} />
                     </div>
                     {courseProgress === 100 && (
                         <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={async () => {
                                try {
                                    await api.post(`/student/courses/${courseId}/certificate`);
                                    setShowCertificate(true);
                                } catch (err: any) {
                                    toast.error(err.response?.data?.error || "Failed to claim certificate");
                                }
                            }}
                            className="mt-6 w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group"
                         >
                            <Trophy size={18} className="group-hover:rotate-12 transition-transform" />
                            Claim Certificate
                         </motion.button>
                     )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                     {curriculum.map((section: any, idx: number) => (
                        <div key={idx}>
                           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">{section.title}</h3>
                           <div className="space-y-1">
                              {section.lessons.map((lesson: any) => (
                                 <button
                                    key={lesson.id}
                                    onClick={() => setActiveLesson(lesson)}
                                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left group ${activeLesson?.id === lesson.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                 >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeLesson?.id === lesson.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                       {lesson.completed ? <CheckCircle2 size={16} /> : lesson.type === 'QUIZ' ? <HelpCircle size={16} /> : lesson.type === 'LIVE' ? <Users size={16} /> : lesson.type === 'READING' || lesson.type === 'COLLABORATIVE' ? <FileText size={16} /> : <Play size={16} fill={activeLesson?.id === lesson.id ? "currentColor" : "none"} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className={`text-sm font-bold truncate ${activeLesson?.id === lesson.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{lesson.title}</p>
                                       <p className="text-[10px] text-gray-400 font-medium mt-0.5">{lesson.duration}</p>
                                    </div>
                                 </button>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* CONTENT AREA */}
         <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50 dark:bg-[#0a0a0a]">
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar space-y-10">
               {/* DYNAMIC PLAYER / CONTENT */}
               <div className="max-w-5xl mx-auto">
                  <SubscriptionGuard>
                    <AnimatePresence mode="wait">
                      {activeLesson.type === 'VIDEO' && (
                         <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <CourseVideoPlayer
                               id={activeLesson.id as string}
                               src={activeLesson.videoUrl || ""}
                               onProgress={(p) => handleProgress(p, 5)} // Periodically save progress
                               onComplete={() => handleProgress(100, 5)}
                            />
                         </motion.div>
                      )}

                      {activeLesson.type === 'LIVE' && (
                         <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="aspect-video bg-[#050505] rounded-[2.5rem] flex flex-col relative overflow-hidden ring-8 ring-white dark:ring-white/5">
                            <JitsiMeeting
                               roomName={`EDA-Session-${activeLesson.id}`}
                               userName={JSON.parse(localStorage.getItem('user') || '{}').name || "Student"}
                            />
                         </motion.div>
                      )}

                      {(activeLesson.type === 'READING' || activeLesson.type === 'TEXT') && (
                         <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[700px]">
                            <ReadingViewer content={activeLesson.content} onComplete={() => handleProgress(100)} />
                         </motion.div>
                      )}

                      {activeLesson.type === 'QUIZ' && (
                         <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <QuizPlayer
                               quizId={activeLesson.quizId}
                               onComplete={() => {
                                  toast.success("Quiz completed!");
                                  fetchCourseData(); // Refresh to get updated progress
                               }}
                            />
                         </motion.div>
                      )}
                  </AnimatePresence>
                  </SubscriptionGuard>
               </div>

               {/* LESSON DETAILS & TABS */}
               <div className="max-w-5xl mx-auto space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div>
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 inline-block">Chapter 2: Derivatives</span>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">{activeLesson.title}</h1>
                     </div>
                     <div className="flex items-center gap-4">
                         <button 
                            onClick={async () => {
                               // find next lesson logic
                               const allLessons = curriculum.flatMap((m:any) => m.lessons);
                               const currentIndex = allLessons.findIndex((l:any) => l.id === activeLesson.id);
                               if (currentIndex < allLessons.length - 1) {
                                   setActiveLesson(allLessons[currentIndex + 1]);
                               } else {
                                   toast.success("Congratulations! You've reached the end of the course.");
                               }
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
                         >
                            Next Lesson <ChevronRight size={18} />
                         </button>
                     </div>
                  </div>

                  {/* TABS */}
                  <div className="flex gap-10 border-b border-gray-100 dark:border-gray-800">
                     {["overview", "resources", "assignments", "discussion"].map(tab => (
                        <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                           {tab}
                           {activeTab === tab && <motion.div layoutId="learning-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                        </button>
                     ))}
                  </div>

                  <div className="pb-20">
                     {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
                           <p className="text-lg">In this session, we dive deep into {activeLesson.title.toLowerCase()}. This content is optimized for modern learning patterns in Ethiopia.</p>
                           <h4 className="text-gray-900 dark:text-white font-bold mt-8 mb-4">Key Learning Points:</h4>
                           <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                              {["Instantaneous rate of change", "The Limit Definition", "Differentiability", "Tangent line equations"].map((item, i) => (
                                 <li key={i} className="flex items-center gap-3 bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 font-medium">
                                    <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                                 </li>
                              ))}
                           </ul>
                        </motion.div>
                     )}
                     {activeTab === 'assignments' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                           <StudentAssignmentView courseId={courseId} />
                        </motion.div>
                     )}
                     {activeTab === 'discussion' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-[600px] mt-4">
                           <DiscussionForum courseId={courseId} userRole="STUDENT" />
                        </motion.div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* LEARNING TOOLS SIDEBAR */}
         <AnimatePresence mode="wait">
            {toolsOpen && (
               <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 400, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="shrink-0 overflow-hidden hidden xl:block"
               >
                  <LearningTools />
               </motion.div>
            )}
         </AnimatePresence>

         {/* FLOATING ACTION TO TOGGLE CURRICULUM ON MOBILE */}
         <div className="fixed bottom-10 right-10 flex gap-4 z-50">
            <button
               onClick={() => setSidebarOpen(!sidebarOpen)}
               className="p-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl shadow-2xl flex items-center gap-2 font-bold lg:flex"
            >
               <Menu size={20} /> {sidebarOpen ? 'Hide Navigation' : 'Navigation'}
            </button>
            <button
               onClick={() => setToolsOpen(!toolsOpen)}
               className="p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-2 font-bold"
            >
               <StickyNote size={20} /> {toolsOpen ? 'Hide Tools' : 'Learning Tools'}
            </button>
         </div>

         <AnimatePresence>
            {showCertificate && (
                <CertificateRenderer 
                   studentName={JSON.parse(localStorage.getItem('user') || '{}').name || "Student"}
                   courseTitle={courseData.title}
                   courseId={courseId}
                   onClose={() => setShowCertificate(false)}
                />
            )}
         </AnimatePresence>
      </div>
   );
}
