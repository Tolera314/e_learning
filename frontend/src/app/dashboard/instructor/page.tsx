"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  Star, 
  DollarSign, 
  Plus, 
  Video, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import Link from "next/link";

const StatsCard = ({ icon, label, value, color, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col gap-4 shadow-sm"
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg flex items-center gap-1">
          <TrendingUp size={10} /> {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  </motion.div>
);

const ActivityItem = ({ title, type, time, user }: any) => (
  <div className="flex items-center gap-4 py-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-emerald-600">
      {user[0]}
    </div>
    <div className="flex-1">
      <p className="text-sm font-bold text-gray-900 dark:text-white">
        <span className="text-emerald-600">{user}</span> {title}
      </p>
      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
        <Clock size={12} /> {time}
      </p>
    </div>
    <div className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {type}
    </div>
  </div>
);

export default function InstructorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGoingLive, setIsGoingLive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get("/instructor/dashboard/stats"),
          api.get("/instructor/dashboard/activity")
        ]);
        setStats(statsRes.data);
        setActivities(activityRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGoLive = async () => {
    try {
      setIsGoingLive(true);
      const { data } = await api.post("/instructor/go-live");
      toast.success(data.message || "You are now LIVE!");
      // Redirect to the live session or open it in a new tab
      window.open(`/dashboard/instructor/live/${data.liveSessionId}`, "_blank");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start live session");
    } finally {
      setIsGoingLive(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={40} className="text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <section className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-outfit tracking-tight">
          Welcome back, {stats?.instructorName || "Instructor"}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Keep track of your courses and student engagement.</p>
        
        <div className="flex flex-wrap items-center gap-3 mt-6">
           {stats?.isLive ? (
              <button 
                onClick={() => window.open(`/dashboard/instructor/live/${stats.activeLiveSessionId}`, "_blank")}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all animate-pulse text-xs"
              >
                 <Video size={18} />
                 Currently Live
              </button>
           ) : (
              <button 
                onClick={handleGoLive}
                disabled={isGoingLive}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all disabled:opacity-50 text-xs"
              >
                 {isGoingLive ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
                 Go Live Now
              </button>
           )}
           <Link href="/dashboard/instructor/courses/create" className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all text-xs">
              <Plus size={18} />
              Create Course
           </Link>
           <button className="p-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors shadow-sm">
              <Calendar size={18} />
           </button>
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          icon={<BookOpen className="text-blue-600" />} 
          label="Total Courses" 
          value={stats?.totalCourses || "0"} 
          color="bg-blue-50 dark:bg-blue-900/20"
          trend={stats?.courseTrend}
        />
        <StatsCard 
          icon={<Users className="text-emerald-600" />} 
          label="Total Students" 
          value={stats?.totalStudents?.toLocaleString() || "0"} 
          color="bg-emerald-50 dark:bg-emerald-900/20"
          trend={stats?.studentTrend}
        />
        <StatsCard 
          icon={<DollarSign className="text-amber-600" />} 
          label="Total Revenue" 
          value={`${stats?.totalRevenue || "0.00"} ETB`} 
          color="bg-amber-50 dark:bg-amber-900/20"
          trend={stats?.revenueTrend}
        />
        <StatsCard 
          icon={<Star className="text-purple-600" />} 
          label="Avg. Rating" 
          value={`${stats?.avgRating || "5.0"} / 5.0`} 
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* RECENT ACTIVITY */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                 <button className="text-sm font-bold text-emerald-600 hover:dark:text-emerald-400">View All</button>
              </div>
              <div className="space-y-2">
                 {activities.length === 0 ? (
                   <div className="text-center py-10 text-gray-400 text-sm italic">
                     No recent activity found.
                   </div>
                 ) : (
                   activities.map((act) => (
                     <ActivityItem 
                       key={act.id}
                       user={act.user} 
                       title={act.title} 
                       type={act.type} 
                       time={new Date(act.time).toLocaleDateString() === new Date().toLocaleDateString() ? "Today" : new Date(act.time).toLocaleDateString()} 
                     />
                   ))
                 )}
              </div>
            </div>
         </div>

         {/* UPCOMING SESSIONS */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 h-full">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Live Sessions</h2>
                 <button className="text-sm font-bold text-emerald-600 hover:dark:text-emerald-400">Schedule</button>
              </div>
              <div className="space-y-4">
                 {stats?.upcomingSessions && stats.upcomingSessions.length > 0 ? (
                    stats.upcomingSessions.map((session: any, i: number) => (
                      <div key={i} className="flex flex-col gap-3 p-5 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                         <div className="flex items-center gap-4">
                           <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 w-14 h-14 rounded-2xl border border-gray-200 dark:border-gray-800 shrink-0">
                              <Calendar size={18} className="text-emerald-600 mb-1" />
                              <span className="text-[9px] font-bold uppercase">{new Date(session.time).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{session.title}</h3>
                              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mt-1">{session.course}</p>
                           </div>
                         </div>
                         <button className="w-full mt-2 py-3 bg-gray-900 text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-black transition-colors">
                            Prepare Session
                         </button>
                      </div>
                    ))
                 ) : (
                    <div className="mt-4 p-10 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center">
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No Scheduled Lives</p>
                       <p className="text-[10px] text-gray-400 mt-2">Your calendar is currently clear.</p>
                    </div>
                 )}
                 
                 <div className="mt-4 p-5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-gray-400 font-medium mb-2">No more sessions this week.</p>
                 </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
