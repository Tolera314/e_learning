"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Flame,
  BarChart3,
  Play,
  ArrowRight,
  Bell,
  MessageSquare,
  FileText,
  HelpCircle,
  Loader2,
  Video,
  Award,
  Clock,
  AlertCircle,
  TrendingUp,
  Star,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import api from "@/lib/api";
import Link from "next/link";

interface Summary {
  studentName: string;
  studentAvatar: string | null;
  enrolledCourses: number;
  completedLessons: number;
  certificatesCount: number;
  overallProgress: string;
  loginStreak: number;
  pendingTasksCount: number;
  quizAvgScore: string;
  activeLive: { id: string; title: string; instructor: string; course: string; thumbnail: string }[];
}

interface Course {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  category: string;
  instructor: string;
  progress: number;
  isCompleted: boolean;
  totalLessons: number;
}

interface Recommendation {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  category: string;
  instructor: string;
  rating: number;
  price: number;
  level: string;
}

interface HomeMessage {
  id: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  time: string;
  isRead: boolean;
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  status: string;
  date: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  result: string;
  time: string;
}

export default function StudentDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [homeMessages, setHomeMessages] = useState<HomeMessage[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sumRes, coursesRes, recommendRes, messagesRes, assignRes, actRes] = await Promise.all([
          api.get("/student/dashboard/summary"),
          api.get("/student/courses"),
          api.get("/student/recommendations"),
          api.get("/student/home/messages"),
          api.get("/student/assignments"),
          api.get("/student/dashboard/activity"),
        ]);
        setSummary(sumRes.data);
        setCourses(coursesRes.data.slice(0, 3)); 
        setRecommendations(recommendRes.data);
        setHomeMessages(messagesRes.data);
        setAssignments(assignRes.data.slice(0, 3)); 
        setActivities(actRes.data.slice(0, 4));
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        console.error("AxiosError Details:", {
          url: err.config?.url,
          baseURL: err.config?.baseURL,
          status: err.response?.status,
          data: err.response?.data
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={40} className="text-emerald-500 animate-spin" />
    </div>
  );

  const dynamicMessage = summary?.pendingTasksCount
    ? `You have ${summary.pendingTasksCount} pending assignment${summary.pendingTasksCount > 1 ? "s" : ""} 📝`
    : summary?.loginStreak && summary.loginStreak > 1
    ? `You're on a ${summary.loginStreak}-day learning streak 🔥`
    : "Pick up where you left off and keep the momentum going.";

  const stats = [
    {
      label: "Enrolled Courses",
      value: summary?.enrolledCourses ?? 0,
      icon: <BookOpen className="text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-900/10",
    },
    {
      label: "Lessons Completed",
      value: summary?.completedLessons ?? 0,
      icon: <CheckCircle2 className="text-emerald-500" />,
      color: "bg-emerald-50 dark:bg-emerald-900/10",
    },
    {
      label: "Overall Progress",
      value: summary?.overallProgress ?? "0%",
      icon: <BarChart3 className="text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-900/10",
    },
    {
      label: "Certificates Earned",
      value: summary?.certificatesCount ?? 0,
      icon: <Award className="text-amber-500" />,
      color: "bg-amber-50 dark:bg-amber-900/10",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* ── GREETING SECTION ── */}
      <section className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-outfit tracking-tight">
          Hello, {summary?.studentName ?? "Student"} 👋
        </h1>
        <p className="text-gray-500 mt-2 font-medium">{dynamicMessage}</p>
      </section>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── MAIN COLUMN ── */}
        <div className="lg:col-span-2 space-y-12">

          {/* CONTINUE LEARNING */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Play size={20} className="text-emerald-600" /> Continue Learning
              </h2>
              <Link href="/dashboard/student/courses" className="text-xs font-bold text-emerald-600 hover:underline">
                View All
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-gray-400">
                <BookOpen size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="font-bold text-sm">No courses enrolled yet.</p>
                <Link href="/courses" className="text-xs text-emerald-600 font-bold hover:underline mt-1 inline-block">Browse Courses →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ x: 4 }}
                    className="bg-white dark:bg-[#111] p-5 sm:p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-5 items-center group cursor-pointer hover:border-emerald-500 transition-all"
                  >
                    <div className="w-full sm:w-36 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative shrink-0 flex items-center justify-center">
                      {course.thumbnailUrl ? (
                      <div className="relative w-full h-full">
                        <Image 
                          src={course.thumbnailUrl || "/images/course2.jpg"} 
                          alt={course.title} 
                          fill 
                          className="object-cover"
                          priority={i === 0}
                        />
                      </div>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 flex items-center justify-center">
                          <BookOpen className="text-white/30" size={36} />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-lg text-[8px] text-white font-bold uppercase tracking-wider">
                        {course.category}
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{course.instructor}</p>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600">{course.progress}% Complete</span>
                        <Link
                          href={`/dashboard/student/courses/${course.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold text-xs hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all"
                        >
                          Continue <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* RECOMMENDED FOR YOU */}
          {recommendations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" /> Recommended For You
                </h2>
                <Link href="/courses" className="text-xs font-bold text-emerald-600 hover:underline">
                  Browse All
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-[#111] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm group"
                  >
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4 relative">
                      {rec.thumbnailUrl ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={rec.thumbnailUrl || "/images/course3.jpg"} 
                            alt={rec.title} 
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        </div>
                      ) : (
                         <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-emerald-600/10 flex items-center justify-center">
                            <BookOpen size={32} className="text-gray-300" />
                         </div>
                      )}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-lg text-[9px] font-bold text-gray-900 dark:text-white uppercase tracking-widest border border-gray-100 dark:border-white/10">
                        {rec.category}
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1 line-clamp-1">{rec.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">{rec.rating}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600">{rec.price === 0 ? "FREE" : `${rec.price} ETB`}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* HAPPENING NOW / LIVE */}
          {summary?.activeLive && summary.activeLive.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Happening Now
              </h2>
              <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {summary.activeLive.map((live) => (
                  <motion.div
                    key={live.id}
                    whileHover={{ y: -5 }}
                    onClick={() => window.open(`/dashboard/student/live/${live.id}`, "_blank")}
                    className="min-w-[280px] bg-white dark:bg-[#111] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl cursor-pointer snap-start group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-emerald-500/20">
                        {live.instructor[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{live.title}</h3>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{live.instructor}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 text-[9px] font-bold rounded-lg uppercase tracking-wider">Live</span>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                        Join Now <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-10">

          {/* MESSAGES PREVIEW */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-purple-500" /> Messages
              </h2>
              <Link href="/dashboard/student/messages" className="text-xs font-bold text-emerald-600 hover:underline">
                Open Inbox
              </Link>
            </div>
            <div className="bg-white dark:bg-[#111] p-4 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
              {homeMessages.length === 0 ? (
                <p className="text-center text-[11px] text-gray-400 py-6">No recent messages.</p>
              ) : (
                homeMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer">
                    {msg.senderAvatar ? (
                    <div className="relative w-10 h-10 shrink-0">
                      <Image 
                        src={msg.senderAvatar || "/images/avatar1.jpg"} 
                        fill
                        className="rounded-xl object-cover" 
                        alt="" 
                      />
                    </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {msg.senderName[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{msg.senderName}</p>
                        {!msg.isRead && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* UPCOMING ASSIGNMENTS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-blue-500" /> Deadlines
              </h2>
              <Link href="/dashboard/student/assignments" className="text-xs font-bold text-emerald-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="bg-white dark:bg-[#111] p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              {assignments.length === 0 ? (
                <p className="text-center text-[11px] text-gray-400 py-6">No pending assignments 🎉</p>
              ) : (
                assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                    <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                      assignment.date === "Overdue"
                        ? "bg-red-50 text-red-500 dark:bg-red-900/20"
                        : assignment.status === "submitted"
                        ? "bg-blue-50 text-blue-500 dark:bg-blue-900/20"
                        : "bg-amber-50 text-amber-500 dark:bg-amber-900/20"
                    }`}>
                      {assignment.date === "Overdue" ? <AlertCircle size={14} /> : <Clock size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug truncate">{assignment.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{assignment.course}</p>
                      <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${
                        assignment.date === "Overdue" ? "text-red-500" : "text-amber-500"
                      }`}>{assignment.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MINI PERFORMANCE */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-500" /> Performance
            </h2>
            <div className="bg-white dark:bg-[#111] p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Quiz Avg</p>
                <span className="text-lg font-black text-emerald-600">{summary?.quizAvgScore ?? "0%"}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Overall Progress</p>
                <span className="text-lg font-black text-purple-600">{summary?.overallProgress ?? "0%"}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Certificates</p>
                <span className="text-lg font-black text-amber-500">{summary?.certificatesCount ?? 0}</span>
              </div>
              <Link href="/dashboard/student/progress" className="block w-full py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold text-center hover:bg-emerald-700 transition-all">
                Full Analytics →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
