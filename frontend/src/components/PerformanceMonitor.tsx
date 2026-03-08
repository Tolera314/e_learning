"use client";

import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  HardDrive,
  BarChart,
  Wifi,
  AlertTriangle,
  Server
} from "lucide-react";
import { motion } from "framer-motion";

export default function PerformanceMonitor() {
  return (
    <div className="space-y-8">
      {/* REAL-TIME SYSTEM HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
            <div className="flex justify-between items-center mb-6">
               <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center text-emerald-500">
                  <Activity size={24} />
               </div>
               <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse">Stable</span>
            </div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">System Health</h4>
            <p className="text-3xl font-black text-emerald-600">99.8%</p>
         </div>

         <div className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
               <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <Wifi size={24} />
               </div>
               <span className="text-[10px] font-black text-blue-500">82ms Latency</span>
            </div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">Live Connection</h4>
            <p className="text-3xl font-black text-blue-600 italic">Excellent</p>
         </div>

         <div className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
               <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/10 rounded-2xl flex items-center justify-center text-purple-500">
                  <Zap size={24} />
               </div>
               <span className="text-[10px] font-black text-purple-500">Fast Response</span>
            </div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">API Response</h4>
            <p className="text-3xl font-black text-purple-600">124ms</p>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         {/* VIDEO STREAMING METRICS */}
         <div className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-10">
               <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-900 dark:text-white">
                  <BarChart size={20} />
               </div>
               <h4 className="text-xl font-black text-gray-900 dark:text-white">Video Streaming Health</h4>
            </div>

            <div className="space-y-8">
               {[
                 { label: "Avg. Buffering Rate", value: "1.2%", status: "Good", color: "bg-emerald-500" },
                 { label: "Playback Error Rate", value: "0.04%", status: "Excellent", color: "bg-emerald-500" },
                 { label: "HD Content Delivery", value: "98.5%", status: "High", color: "bg-blue-500" }
               ].map((metric, i) => (
                  <div key={i}>
                     <div className="flex justify-between items-end mb-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{metric.label}</p>
                        <div className="text-right">
                           <span className="text-lg font-black text-gray-900 dark:text-white">{metric.value}</span>
                           <span className="block text-[9px] font-black text-emerald-500 uppercase">{metric.status}</span>
                        </div>
                     </div>
                     <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: metric.value === '0.04%' ? '4%' : metric.value }}
                          className={`h-full ${metric.color}`}
                        />
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* RECENT SYSTEM LOGS */}
         <div className="p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-900 dark:text-white">
                     <Server size={20} />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white">Recent System Logs</h4>
               </div>
               <button className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Clear Logs</button>
            </div>

            <div className="space-y-4 max-h-[280px] overflow-y-auto custom-scrollbar pr-4">
               {[
                 { type: "INFO", msg: "CDN Cache hit successfully for Video Module 2", time: "1 min ago" },
                 { type: "WARN", msg: "High latency detected for 2 students in Addis Ababa", time: "15 mins ago" },
                 { type: "INFO", msg: "Quiz submission processed for Student #124", time: "22 mins ago" },
                 { type: "INFO", msg: "New Live Session initialized: Quantum Mechanics", time: "1 hour ago" },
               ].map((log, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-800/50 flex flex-col gap-1">
                     <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${log.type === 'WARN' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                           {log.type}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold">{log.time}</span>
                     </div>
                     <p className="text-[11px] text-gray-700 dark:text-gray-300 font-bold">{log.msg}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-500/10 rounded-[2.5rem] flex items-center gap-6">
         <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20 animate-pulse">
            <AlertTriangle size={24} />
         </div>
         <div className="flex-1">
            <h4 className="text-lg font-black text-amber-800 dark:text-amber-400 italic">Critical Performance Alert</h4>
            <p className="text-sm text-amber-700/80 dark:text-amber-400/60 font-medium leading-relaxed">System load is increasing as several live sessions are starting simultaneously. The auto-scaling engine has initialized 2 new server pods to ensure stability for all students.</p>
         </div>
      </div>
    </div>
  );
}
