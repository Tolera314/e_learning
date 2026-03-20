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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={40} className="text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, Instructor!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Here's what's happening with your courses today.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all">
              <Plus size={20} />
              Create Course
           </button>
           <button className="p-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors">
              <Calendar size={20} />
           </button>
        </div>
      </header>

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
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
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

            {/* UPCOMING SESSIONS */}
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Live Classes</h2>
                 <button className="text-sm font-bold text-emerald-600 hover:dark:text-emerald-400">Schedule New</button>
              </div>
              <div className="space-y-4">
                 {[
                   { title: "Advanced Calculus Q&A", time: "Tomorrow, 4:00 PM", course: "Grade 12 Mathematics" },
                   { title: "Exam Prep: Physics Paper 1", time: "Oct 12, 10:00 AM", course: "Grade 12 Physics" }
                 ].map((session, i) => (
                   <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <div className="hidden sm:flex flex-col items-center justify-center bg-white dark:bg-gray-900 w-16 h-16 rounded-xl border border-gray-200 dark:border-gray-800">
                         <Calendar size={20} className="text-emerald-600 mb-1" />
                         <span className="text-[10px] font-bold uppercase">{session.time.split(',')[0]}</span>
                      </div>
                      <div className="flex-1">
                         <h3 className="font-bold text-gray-900 dark:text-white">{session.title}</h3>
                         <p className="text-xs text-gray-500 mt-1">{session.course} • {session.time}</p>
                      </div>
                      <button className="px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-black rounded-lg text-xs font-bold hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-black transition-colors">
                         Join Link
                      </button>
                   </div>
                 ))}
              </div>
            </div>
         </div>

         {/* QUICK ACTIONS & STATS */}
         <div className="space-y-8">
            <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
                  <Video size={200} />
               </div>
               <h2 className="text-2xl font-bold mb-4">Start Teaching</h2>
               <p className="text-emerald-100 text-sm mb-6 leading-relaxed">Ready to share your knowledge? Upload your latest lesson or start a live session.</p>
               <div className="space-y-3 relative z-10">
                  <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold transition-all border border-white/20">
                     Upload Video Lesson <ChevronRight size={18} />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold transition-all border border-white/20">
                     Create Assignment <ChevronRight size={18} />
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
               <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Current Progress</h2>
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        <span>Verified Status</span>
                        <span className="text-emerald-600">Active</span>
                     </div>
                     <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[100%]" />
                     </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                     <CheckCircle2 className="text-blue-600" size={24} />
                     <div className="flex-1">
                        <p className="text-xs font-bold text-blue-900 dark:text-blue-400 uppercase tracking-tighter">Profile 100% Complete</p>
                        <p className="text-[10px] text-blue-700 dark:text-blue-500 font-medium">Verified for Teaching.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
