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
import QuizPlayer from "@/components/QuizPlayer";
import CourseVideoPlayer from "@/components/CourseVideoPlayer";
import ReadingViewer from "@/components/ReadingViewer";
import LearningTools from "@/components/LearningTools";
import JitsiMeeting from "@/components/JitsiMeeting";
import StudentAssignmentView from "@/components/StudentAssignmentView";
import DiscussionForum from "@/components/DiscussionForum";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import CertificateRenderer from "@/components/CertificateRenderer";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

const MOCK_QUESTIONS = [
   {
      id: "q1",
      text: "What is the derivative of f(x) = x^2?",
      options: ["x", "2x", "x^3 / 3", "2x^2"],
      correctAnswer: 1,
      explanation: "Using the power rule: the derivative of x^n is nx^(n-1). For n=2, it becomes 2x^(2-1) = 2x."
   },
   {
      id: "q2",
      text: "Which rule is used to differentiate the product of two functions?",
      options: ["Chain Rule", "Quotient Rule", "Product Rule", "Power Rule"],
      correctAnswer: 2,
      explanation: "The Product Rule states that (uv)' = u'v + uv', which is specifically designed for products."
   }
];

const CURRICULUM = [
   {
      title: "Introduction to Calculus",
      lessons: [
         { id: "1", title: "1.1 Basic Concepts", duration: "12:45", completed: true, type: "video" },
         { id: "2", title: "1.2 Course Introduction", duration: "Live Session", completed: true, type: "live" },
      ]
   },
   {
      title: "Derivatives",
      lessons: [
         { id: "3", title: "2.1 The Concept of Derivative", duration: "15:10", completed: false, type: "video", active: true },
         { id: "4", title: "2.2 Rules of Differentiation", duration: "Reading Resource", completed: false, type: "reading" },
         { id: "5", title: "2.3 Group Study: Derivative Apps", duration: "Collaborative", completed: false, type: "collaborative" },
         { id: "6", title: "2.4 Quiz: Differentiation", duration: "15 mins", completed: false, type: "quiz" },
      ]
   }
];

export default function CourseLearningPage() {
   const params = useParams();
   const courseId = params?.id as string || "1";
   const [sidebarOpen, setSidebarOpen] = useState(true);
   const [toolsOpen, setToolsOpen] = useState(true);
   const [activeTab, setActiveTab] = useState("overview");
   const [activeLesson, setActiveLesson] = useState(CURRICULUM[1].lessons[0]);
   const [showCertificate, setShowCertificate] = useState(false);
   const [courseProgress, setCourseProgress] = useState(65); // Mocked for UI demo
   const [enrollmentData, setEnrollmentData] = useState<any>(null);

   // Real data fetching would happen here
   React.useEffect(() => {
    // api.get(`/enrollments/${courseId}`).then(...)
   }, [courseId]);

   const handleProgress = (percent: number) => {
      if (percent > 90 && !activeLesson.completed) {
         console.log(`Setting lesson ${activeLesson.id} as completed`);
         // In a real app, this would call the API
         activeLesson.completed = true;
      }
   };

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
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">Advanced Calculus for G12</h2>
                     <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        <span>{courseProgress}% Completed</span>
                        <span>{Math.round(courseProgress / 100 * 24)} / 24 Lessons</span>
                     </div>
                     <div className="mt-2 h-1.5 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${courseProgress}%` }} />
                     </div>
                     {courseProgress === 100 && (
                        <motion.button
                           initial={{ scale: 0.9, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           onClick={() => setShowCertificate(true)}
                           className="mt-6 w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group"
                        >
                           <Trophy size={18} className="group-hover:rotate-12 transition-transform" />
                           Claim Certificate
                        </motion.button>
                     )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                     {CURRICULUM.map((section, idx) => (
                        <div key={idx}>
                           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">{section.title}</h3>
                           <div className="space-y-1">
                              {section.lessons.map(lesson => (
                                 <button
                                    key={lesson.id}
                                    onClick={() => setActiveLesson(lesson as any)}
                                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left group ${activeLesson.id === lesson.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                 >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeLesson.id === lesson.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                       {lesson.completed ? <CheckCircle2 size={16} /> : lesson.type === 'quiz' ? <HelpCircle size={16} /> : lesson.type === 'live' ? <Users size={16} /> : lesson.type === 'reading' || lesson.type === 'collaborative' ? <FileText size={16} /> : <Play size={16} fill={activeLesson.id === lesson.id ? "currentColor" : "none"} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <p className={`text-sm font-bold truncate ${activeLesson.id === lesson.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{lesson.title}</p>
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
                     {activeLesson.type === 'video' && (
                        <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                           <CourseVideoPlayer
                              id={activeLesson.id as string}
                              src="https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4"
                              onProgress={(p, t) => console.log(p, t)}
                              onComplete={() => console.log("Video Finished")}
                           />
                        </motion.div>
                     )}

                     {activeLesson.type === 'live' && (
                        <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="aspect-video bg-[#050505] rounded-[2.5rem] flex flex-col relative overflow-hidden ring-8 ring-white dark:ring-white/5">
                           <JitsiMeeting
                              roomName={`EDA-Session-${activeLesson.id}`}
                              userName="Student" // In real app, use user.name
                           />
                        </motion.div>
                     )}

                     {(activeLesson.type === 'reading' || activeLesson.type === 'collaborative') && (
                        <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[700px]">
                           <ReadingViewer />
                        </motion.div>
                     )}

                     {activeLesson.type === 'quiz' && (
                        <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                           <QuizPlayer
                              quizId={activeLesson.id}
                              onComplete={() => {
                                 console.log("Quiz completed!");
                                 // Update local completion state
                                 const updatedCurriculum = [...CURRICULUM];
                                 const lesson = updatedCurriculum.flatMap(s => s.lessons).find(l => l.id === activeLesson.id);
                                 if (lesson) lesson.completed = true;
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
                        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all">
                           Complete & Next <ChevronRight size={18} />
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
                  courseTitle="Advanced Calculus for G12"
                  courseId={courseId}
                  onClose={() => setShowCertificate(false)}
               />
            )}
         </AnimatePresence>
      </div>
   );
}
