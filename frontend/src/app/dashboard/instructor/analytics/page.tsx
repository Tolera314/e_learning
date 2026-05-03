"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, BookOpen, CheckCircle2, BarChart3, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

const TIMEFRAMES = ["7 Days", "30 Days", "3 Months", "All Time"];

// Simple inline bar chart component
const BarChart = ({ data, color = "bg-emerald-500" }: { data: number[], color?: string }) => {
  const max = Math.max(...data);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((val, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-2">
          <div className="w-full flex-1 flex flex-col justify-end">
            <div className={`${color} rounded-t-lg opacity-80 hover:opacity-100 transition-opacity`} style={{ height: `${(val / max) * 100}%` }} />
          </div>
          <span className="text-[9px] text-gray-400 font-medium">{days[i]}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState("30 Days");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/instructor/dashboard-analytics")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Analytics...</div>;

  const { stats, courseStats, charts } = data || { stats: [], courseStats: [], charts: { dailyEnrolments: [], revenueGrowth: [] } };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teaching Analytics</h1>
          <p className="text-gray-500 mt-2">Track your teaching performance, student engagement, and revenue trends.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
          {TIMEFRAMES.map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeframe === t ? 'bg-white dark:bg-[#111] text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((card: any, i: number) => (
          <motion.div key={i} whileHover={{ y: -4 }} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{card.label}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mb-2">{card.value}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${card.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {card.change} this period
            </span>
          </motion.div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users size={18} className="text-blue-500" /> Daily Enrolments</h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">{timeframe}</span>
          </div>
          <BarChart data={charts.dailyEnrolments} color="bg-blue-400" />
        </div>

        <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500" /> Revenue (ETB)</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">{timeframe}</span>
          </div>
          <BarChart data={charts.revenueGrowth} color="bg-emerald-400" />
        </div>
      </div>

      {/* COURSE PERFORMANCE TABLE */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><BarChart3 size={18} className="text-purple-500" /> Course-Level Performance</h3>
          <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors">
            <Filter size={14} /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/50">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Course</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Students</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Completion</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {courseStats.map((c: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <BookOpen size={14} className="text-purple-600" />
                      </div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-700 dark:text-gray-300">{c.students.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3 w-32">
                      <div className="h-1.5 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.completion}%` }} />
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{c.completion}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-bold text-gray-900 dark:text-white">{c.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
