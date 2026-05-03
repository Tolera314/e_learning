"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Calendar,
  Zap,
  ShieldCheck,
  Bell,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface Stats {
  totalUsers: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  growth: string;
  activeNow: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-gray-500 font-medium tracking-widest uppercase text-xs">Synchronizing Platform Data...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats?.totalUsers || 0, icon: <Users />, color: "bg-blue-500", trend: "+12%" },
    { label: "Revenue (ETB)", value: stats?.totalRevenue?.toLocaleString() || 0, icon: <DollarSign />, color: "bg-emerald-500", trend: "+8.2%" },
    { label: "Active Instructors", value: stats?.totalInstructors || 0, icon: <GraduationCap />, color: "bg-purple-500", trend: "+3" },
    { label: "Total Courses", value: stats?.totalCourses || 0, icon: <BookOpen />, color: "bg-amber-500", trend: "+14" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* ── WELCOME SECTION ── */}
      <section className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white font-outfit tracking-tight">
          Admin Control Center
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Real-time oversight of the Ethio-Digital-Academy ecosystem.</p>
        
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <div className="px-4 py-2.5 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-2">
            <Calendar size={18} className="text-emerald-600" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">March 20, 2026</span>
          </div>
          <button className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
            <Zap size={20} />
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                <ArrowUpRight size={14} /> {stat.trend}
              </div>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Now Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2rem] text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                Live Network Status
              </div>
              <h3 className="text-4xl font-black">Platform Engagement</h3>
              <p className="text-gray-400 mt-2 max-w-md">System performance is optimal. {stats?.activeNow} users are currently interacting with the platform across all segments.</p>
            </div>
            
            <div className="mt-12 flex flex-wrap gap-8">
              <div className="flex flex-col">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Current Connections</span>
                <span className="text-3xl font-bold">{stats?.activeNow}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">API Response Time</span>
                <span className="text-3xl font-bold">142ms</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Server Health</span>
                <span className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
                  <ShieldCheck /> 99.9%
                </span>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] -ml-24 -mb-24" />
        </div>

        {/* Action Center / Quick Logs */}
        <div className="bg-white dark:bg-[#111] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Activity className="text-emerald-600" />
            System Activity
          </h4>
          <div className="space-y-6">
            {[
              { type: 'enrollment', user: 'Abenezer K.', action: 'enrolled in Python Mastery', time: '2m ago' },
              { type: 'payment', user: 'Hirut T.', action: 'completed subscription', time: '14m ago' },
              { type: 'instructor', user: 'Dawit S.', action: 'uploaded 4 new lessons', time: '1h ago' },
              { type: 'system', user: 'Security Bot', action: 'blocked suspicious IP', time: '3h ago' }
            ].map((log, idx) => (
              <div key={idx} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                <div className={`w-2 h-10 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-bold">{log.user}</span> {log.action}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-xs font-bold text-emerald-600 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all">
            View All Audit Logs
          </button>
        </div>
      </div>

      {/* Search & Intelligence Insights */}
      <div className="bg-white dark:bg-[#111] p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Search className="text-blue-500" size={28} />
              Platform Search Intel
            </h3>
            <p className="text-gray-500 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Learning Demand & Intent Analytics</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-bold rounded-xl text-gray-500">Last 24h</button>
            <button className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-xs font-bold rounded-xl text-blue-600">Last 7 Days</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Trending Now</h4>
            <div className="space-y-4">
              {[
                { term: "Web Development", count: 1240, trend: "up" },
                { term: "Amharic Grammar", count: 850, trend: "up" },
                { term: "Python for Beginners", count: 720, trend: "down" },
                { term: "University Entrance", count: 640, trend: "up" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.term}</span>
                  <span className={`text-[10px] font-bold ${item.trend === 'up' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.count} searches</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-8 rounded-[2rem] flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={16} /> User-Driven UI Recommendations
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Based on rising searches for <span className="text-blue-600 font-bold">"Web Development"</span> (up 42% this week), 
                the AI recommends promoting <span className="underline decoration-blue-500/30 cursor-pointer hover:text-blue-600">Full-Stack Bootcamp</span> to the primary marketplace banner.
              </p>
            </div>
            
            <div className="mt-8 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <button className="whitespace-nowrap px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                Auto-Optimize UI
              </button>
              <button className="whitespace-nowrap px-6 py-3 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/30 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all">
                View Search Heatmap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
