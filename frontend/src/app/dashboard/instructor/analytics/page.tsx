"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { 
  BarChart3, 
  Users, 
  Video, 
  HelpCircle, 
  Activity,
  LayoutDashboard,
  Settings,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy Load Components for better performance (LCP)
const LiveClassMonitor = dynamic(() => import("@/components/LiveClassMonitor"), { 
  loading: () => <div className="h-96 bg-gray-50 dark:bg-gray-900/50 animate-pulse rounded-3xl" />
});
const StudentProgressTracker = dynamic(() => import("@/components/StudentProgressTracker"), {
  loading: () => <div className="h-96 bg-gray-50 dark:bg-gray-900/50 animate-pulse rounded-3xl" />
});
const QuizAnalytics = dynamic(() => import("@/components/QuizAnalytics"), {
  loading: () => <div className="h-96 bg-gray-50 dark:bg-gray-900/50 animate-pulse rounded-3xl" />
});
const PerformanceMonitor = dynamic(() => import("@/components/PerformanceMonitor"), {
  loading: () => <div className="h-96 bg-gray-50 dark:bg-gray-900/50 animate-pulse rounded-3xl" />
});
const CourseMaterialManager = dynamic(() => import("@/components/CourseMaterialManager"), {
  loading: () => <div className="h-96 bg-gray-50 dark:bg-gray-900/50 animate-pulse rounded-3xl" />
});

export default function InstructorControlPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "live", label: "Live Sessions", icon: Video },
    { id: "materials", label: "Materials", icon: BarChart3 },
    { id: "students", label: "Student Progress", icon: Users },
    { id: "quizzes", label: "Quiz Analytics", icon: HelpCircle },
    { id: "performance", label: "System Health", icon: Activity },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white italic tracking-tight">Teaching Control Panel</h1>
          <p className="text-gray-500 font-medium mt-2">The central command center for your teaching activities and student performance.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-xs hover:bg-gray-50 transition-all flex items-center gap-2">
              <Settings size={18} /> Panel Settings
           </button>
           <button className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
              <Plus size={18} /> New Session
           </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-3xl w-fit">
         {tabs.map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === tab.id ? 'bg-white dark:bg-[#111] text-emerald-600 shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
               <tab.icon size={16} /> {tab.label}
            </button>
         ))}
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-[600px]">
         <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
               <motion.div 
                 key="overview"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="space-y-10"
               >
                  {/* Reuse existing summary cards or similar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {[
                       { label: "Total Students", value: "3,842", trend: "+12%", color: "text-blue-500" },
                       { label: "Active Today", value: "210", trend: "+5%", color: "text-emerald-500" },
                       { label: "Course Completion", value: "48%", trend: "+2%", color: "text-purple-500" },
                       { label: "Questions Asked", value: "24", trend: "-3%", color: "text-amber-500" }
                     ].map((stat, i) => (
                        <div key={i} className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                           <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">{stat.label}</p>
                           <div className="flex justify-between items-end">
                              <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
                              <span className="text-[10px] font-black bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-500">{stat.trend}</span>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                     <div className="xl:col-span-2 space-y-8">
                        <div className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                           <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Engagement Trends</h3>
                           <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-50 dark:border-gray-800 rounded-3xl text-gray-400 font-bold text-xs uppercase tracking-widest">
                              [ Engagement Chart Placeholder ]
                           </div>
                        </div>
                        <ErrorBoundary componentName="LiveClassMonitor">
                           <LiveClassMonitor />
                        </ErrorBoundary>
                     </div>
                     <div className="space-y-8">
                        <ErrorBoundary componentName="QuizAnalytics">
                           <QuizAnalytics />
                        </ErrorBoundary>
                        <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white">
                           <h3 className="text-xl font-black mb-4 italic">Next Teaching Goal</h3>
                           <p className="text-sm opacity-60 leading-relaxed mb-6">You've reached 85% completion in "Advanced Calculus". Schedule the final exam preparation session to boost student confidence!</p>
                           <button className="w-full py-4 bg-emerald-600 rounded-2xl font-black text-xs hover:bg-emerald-700 transition-all">
                              Set Goal Reminder
                           </button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'live' && (
               <motion.div 
                 key="live"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
               >
                  <ErrorBoundary componentName="LiveClassMonitor">
                     <LiveClassMonitor />
                  </ErrorBoundary>
               </motion.div>
            )}

            {activeTab === 'materials' && (
               <motion.div 
                 key="materials"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
               >
                  <ErrorBoundary componentName="CourseMaterialManager">
                     <CourseMaterialManager />
                  </ErrorBoundary>
               </motion.div>
            )}

            {activeTab === 'students' && (
               <motion.div 
                 key="students"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
               >
                  <ErrorBoundary componentName="StudentProgressTracker">
                     <StudentProgressTracker />
                  </ErrorBoundary>
               </motion.div>
            )}

            {activeTab === 'quizzes' && (
               <motion.div 
                 key="quizzes"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
               >
                  <ErrorBoundary componentName="QuizAnalytics">
                     <QuizAnalytics />
                  </ErrorBoundary>
               </motion.div>
            )}

            {activeTab === 'performance' && (
               <motion.div 
                 key="performance"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
               >
                  <ErrorBoundary componentName="PerformanceMonitor">
                     <PerformanceMonitor />
                  </ErrorBoundary>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
