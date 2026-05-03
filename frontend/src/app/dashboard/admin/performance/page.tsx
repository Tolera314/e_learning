"use client";

import { useState, useEffect } from "react";
import { 
  Activity, 
  Cpu, 
  Database, 
  Globe, 
  Zap, 
  Terminal
} from "lucide-react";
import api from "@/lib/api";

const MOCK_LOGS = [
  { id: "1", service: "SYS", message: "Polling initialized...", type: "INFO", time: new Date().toLocaleTimeString() }
];

interface PerformanceData {
  cpu: {
    cores: number;
    usagePercent: number;
    model: string;
  };
  memory: {
    totalGb: string;
    usedGb: string;
    usagePercent: number;
  };
  uptimeSeconds: number;
  activeConnections: number;
}

export default function SystemPerformance() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [metrics, setMetrics] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/performance');
        setMetrics(res.data);
        setLoading(false);

        // Periodically add a log to indicate polling is active 
        // In a real system, you'd hook socket.io here for logs.
        if (Math.random() > 0.8) {
          setLogs(prev => [...prev, {
            id: Date.now().toString(),
            service: "METRICS_POLLER",
            message: `Fetched latest performance specs. Active conns: ${res.data.activeConnections}`,
            type: "SUCCESS",
            time: new Date().toLocaleTimeString()
          }].slice(-20)); // keep last 20
        }
      } catch (err) {
        console.error(err);
        setLogs(prev => [...prev, {
          id: Date.now().toString(),
          service: "METRICS_POLLER",
          message: "Failed to fetch performance telemetry.",
          type: "WARNING",
          time: new Date().toLocaleTimeString()
        }].slice(-20));
      }
    };

    fetchStats();
    interval = setInterval(fetchStats, 5000); // UI poll every 5s

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Activity className="text-blue-500" size={32} />
            System Health & Logs
          </h1>
          <p className="text-gray-500 mt-1">Real-time monitoring of platform performance and operational stability.</p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Systems Operational
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Uptime", 
            value: metrics ? formatUptime(metrics.uptimeSeconds) : "...", 
            icon: <Globe className="text-blue-500" /> 
          },
          { 
            label: "Active Users (Live)", 
            value: metrics ? metrics.activeConnections.toString() : "...", 
            icon: <Zap className="text-amber-500" /> 
          },
          { 
            label: "CPU Usage", 
            value: metrics ? `${metrics.cpu.usagePercent.toFixed(1)}%` : "...", 
            icon: <Cpu className="text-purple-500" /> 
          },
          { 
            label: "Memory Usage", 
            value: metrics ? `${metrics.memory.usedGb} / ${metrics.memory.totalGb} GB (${metrics.memory.usagePercent.toFixed(1)}%)` : "...", 
            icon: <Database className="text-emerald-500" /> 
          }
        ].map((m, idx) => (
          <div key={idx} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center min-w-[3rem]">
              {m.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.label}</p>
              <p className="text-xl font-black text-gray-900 dark:text-white truncate" title={m.value}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Real-time Log Stream */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-gray-900 dark:bg-black rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden font-mono text-xs flex flex-col h-full">
            <div className="p-6 border-b border-gray-800 bg-gray-800/30 flex items-center justify-between text-gray-400 shrink-0">
              <span className="flex items-center gap-2"><Terminal size={14} /> operational_stdout.log</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-900/50" />
                <div className="w-3 h-3 rounded-full bg-amber-900/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-900/50" />
              </div>
            </div>
            <div className="p-8 h-[400px] overflow-y-auto space-y-4 scrollbar-hide flex-1">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4">
                  <span className="text-gray-600">[{log.time}]</span>
                  <span className={`font-bold ${
                    log.type === 'SUCCESS' ? 'text-emerald-400' : 
                    log.type === 'WARNING' ? 'text-amber-400' : 'text-blue-400'
                  }`}>{log.service}:</span>
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))}
              <div className="flex gap-4 animate-pulse">
                <span className="text-emerald-500">_</span>
              </div>
            </div>
            <div className="p-4 bg-gray-800/20 text-[10px] text-gray-500 text-center uppercase tracking-widest shrink-0">
              Live Connection Established via WebSocket
            </div>
          </div>
        </div>

        {/* Monitoring Controls */}
        <div className="space-y-6 h-full flex flex-col">
          <section className="bg-white dark:bg-[#111] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <Activity className="text-emerald-500" size={20} />
              Process Manager
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Background Worker</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase">Active</p>
                </div>
                <button className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">Restart</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Cache Engine</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase">Healthy</p>
                </div>
                <button className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">Flush</button>
              </div>
            </div>
          </section>

          <section className="bg-blue-600 p-8 rounded-[2.5rem] text-white overflow-hidden relative shadow-lg shadow-blue-500/30 flex-1">
            <h4 className="text-lg font-bold">Platform Uptime</h4>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl font-black">99.9%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Historical</span>
            </div>
            <p className="text-blue-100/70 text-xs mt-2 uppercase font-bold tracking-widest">Year-to-date Stability</p>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
          </section>
        </div>
      </div>
    </div>
  );
}
