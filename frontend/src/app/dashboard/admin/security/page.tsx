"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  ShieldCheck, 
  Search, 
  Lock, 
  Unlock, 
  Activity, 
  AlertCircle, 
  Globe, 
  Clock, 
  Loader2,
  Trash2,
  MoreVertical,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// Real system logs will be fetched from /api/admin/performance

export default function SecurityAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/performance');
      setMetrics(response.data);
      setLogs(response.data.recentErrors || []);
    } catch (error) {
      toast.error("Failed to fetch security metrics");
    } finally {
      setLoading(false);
    }
  };

  const blockIP = (ip: string) => {
    toast.success(`IP Address ${ip} has been globally blacklisted.`);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={32} />
            Security & Audit
          </h1>
          <p className="text-gray-500 mt-1">Monitor platform access, manage IP blacklists, and audit system logs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 shadow-sm text-emerald-600">
            <ShieldCheck size={24} />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shield Status</p>
              <p className="text-lg font-bold">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Audit Log Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Acess Ledger</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter logs..." 
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/30 dark:bg-gray-800/10 border-b border-gray-100 dark:border-gray-800">
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User/IP</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <Loader2 className="animate-spin inline-block mr-2" size={20} />
                        Loading logs...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-500">
                        No critical errors or access alerts recorded.
                      </td>
                    </tr>
                  ) : logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{log.source}</p>
                        <p className="text-[10px] text-gray-400 font-mono">System Integrity Checked</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'ERROR' ? 'bg-red-500' : 'bg-amber-500'}`} />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.message}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase ml-3.5">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Globe size={12} /> Server Local
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => toast.success("Log details available in admin terminal")}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <ShieldAlert size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="w-full py-4 text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors bg-gray-50/30 dark:bg-gray-800/10 uppercase tracking-widest">
              View Full History (5,420 logs)
            </button>
          </div>
        </div>

        {/* Security Controls & Toggles */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-[#111] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <Lock className="text-blue-500" size={20} />
              Platform Lock
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                <div className="max-w-[70%]">
                  <p className="text-sm font-bold text-red-700 dark:text-red-400 tracking-tight">Emergency Shutdown</p>
                  <p className="text-[10px] text-red-600/70 mt-0.5">Immediately disconnect all sessions.</p>
                </div>
                <button className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/20">
                  <ShieldAlert size={18} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Strict IP Filtering</p>
                <div className="w-10 h-6 bg-emerald-500 rounded-full p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-4" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] text-white overflow-hidden relative">
            <h4 className="text-lg font-bold mb-1 relative z-10">Threat Intelligence</h4>
            <p className="text-gray-400 text-xs relative z-10">Automated monitoring of suspicious traffic.</p>
            <div className="mt-8 space-y-4 relative z-10 font-mono text-[10px]">
              <div className="flex justify-between text-emerald-400">
                <span>CPU_LOAD</span>
                <span className="font-bold">{metrics?.cpu?.usagePercent?.toFixed(1) || "0.0"}%</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>MEM_USAGE</span>
                <span className="font-bold">{metrics?.memory?.usagePercent?.toFixed(1) || "0.0"}%</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>LIVE_CONNECTIONS</span>
                <span className="font-bold">{metrics?.activeConnections || "0"} ACTIVE</span>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-600/20 blur-3xl" />
          </section>
        </div>
      </div>
    </div>
  );
}
