"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Shield, Users, CreditCard, Activity, Search } from "lucide-react";

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Shield className="text-emerald-600" size={32} />
              Admin Control Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Manage platform-wide configurations, users, and financials.</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users or transactions..." 
              className="pl-12 pr-6 py-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-80 shadow-sm"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-500/30">
             <div className="flex items-center justify-between mb-4">
                <Users size={24} />
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest">+12%</span>
             </div>
             <p className="text-emerald-100 text-sm">Total Active Users</p>
             <p className="text-3xl font-bold mt-1">15,420</p>
          </div>

          <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
             <div className="flex items-center justify-between mb-4 text-emerald-600">
                <CreditCard size={24} />
             </div>
             <p className="text-gray-500 dark:text-gray-400 text-sm">Monthly Revenue</p>
             <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">825K ETB</p>
          </div>

          <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
             <div className="flex items-center justify-between mb-4 text-orange-600">
                <Activity size={24} />
             </div>
             <p className="text-gray-500 dark:text-gray-400 text-sm">Server Load</p>
             <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">24%</p>
          </div>

          <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
             <div className="flex items-center justify-between mb-4 text-purple-600">
                <Users size={24} />
             </div>
             <p className="text-gray-500 dark:text-gray-400 text-sm">Instructor Applications</p>
             <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">12</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
           <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Critical Systems Status</h2>
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                All Systems Operational
              </span>
           </div>
           <div className="p-8">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase font-bold tracking-widest">
                    <th className="pb-4">Service</th>
                    <th className="pb-4">Endpoint</th>
                    <th className="pb-4">Latency</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { name: "Auth Service", endpoint: "/api/auth", latency: "24ms", status: "Online" },
                    { name: "Database Cluster", endpoint: "PostgreSQL Primary", latency: "12ms", status: "Online" },
                    { name: "Media API", endpoint: "/api/lessons/media", latency: "145ms", status: "Online" },
                    { name: "Payment Gateway", endpoint: "Chapa/TeleBirr", latency: "380ms", status: "Online" },
                  ].map((sys, idx) => (
                    <tr key={idx} className="border-b border-gray-50 dark:border-gray-900 last:border-0">
                      <td className="py-4 font-bold text-gray-900 dark:text-white">{sys.name}</td>
                      <td className="py-4 text-gray-500 font-mono">{sys.endpoint}</td>
                      <td className="py-4 text-gray-500">{sys.latency}</td>
                      <td className="py-4 text-emerald-600 font-bold">{sys.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
