"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { 
  BarChart3, 
  Search, 
  Banknote, 
  TrendingUp, 
  CheckCircle2, 
  Percent, 
  DollarSign, 
  ArrowUpRight, 
  Settings2,
  Download,
  Wallet
} from "lucide-react";
import { motion } from "framer-motion";

export default function CommissionManagement() {
  const [globalRate, setGlobalRate] = useState(20);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/commissions");
      setStats(data);
      setGlobalRate(data.globalRate);
    } catch (err) {
      toast.error("Failed to fetch commission economics");
    } finally {
      setLoading(false);
    }
  };

  const saveRate = async () => {
    try {
      await api.post("/admin/commissions/rate", { rate: globalRate });
      toast.success("Global commission rate updated to " + globalRate + "%");
    } catch (err) {
      toast.error("Failed to update commission rate");
    }
  };


  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Wallet className="text-emerald-600" size={32} />
            Economics & Commissions
          </h1>
          <p className="text-gray-500 mt-1">Manage platform revenue-share models and instructor payouts.</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all">
          <Download size={20} />
          Export Payout Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Config */}
        <div className="xl:col-span-2 space-y-8">
          <section className="bg-white dark:bg-[#111] p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-8">
              <Percent className="text-blue-500" />
              Global Commission Rate
            </h3>
            
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-full md:w-1/2 space-y-6">
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Revenue Share</span>
                    <span className="text-4xl font-black text-emerald-600">{globalRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={globalRate}
                    onChange={(e) => setGlobalRate(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-400 uppercase">
                    <span>5% (Min)</span>
                    <span>50% (Max)</span>
                  </div>
                </div>
                <button 
                  onClick={saveRate}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                  <Settings2 size={20} />
                  Update Global Rate
                </button>
              </div>

              <div className="w-full md:w-1/2 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Model Analysis</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  A {globalRate}% commission on current platform volume would generate approximately 
                  <span className="font-bold"> {((stats?.totalVolume || 0) * (globalRate/100)).toLocaleString()} ETB </span> in monthly operational revenue.
                </p>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl -mr-32 -mt-32" />
          </section>

          {/* Instructor Tiers */}
          <section className="bg-white dark:bg-[#111] p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-8">
              <TrendingUp className="text-emerald-500" />
              Instructor Performance Tiers
            </h3>
            
            <div className="space-y-4">
              {(stats?.tiers || [
                { label: "Elite (5k+ Students)", rate: "12%", color: "emerald", desc: "Top tier instructors with massive reach." },
                { label: "Pro (1k+ Students)", rate: "15%", color: "blue", desc: "Proven instructors with steady growth." },
                { label: "Standard (New)", rate: "20%", color: "gray", desc: "Default rate for rising talent." }
              ]).map((tier: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-3xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{tier.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{tier.desc}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{tier.rate}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Fee</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Financial Stat Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl">
            <DollarSign className="absolute -bottom-6 -right-6 text-white/10 w-32 h-32" />
            <h4 className="text-lg font-bold mb-6">Instructor Payouts</h4>
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Total Pending</p>
                <p className="text-3xl font-black">{(stats?.pendingPayouts || 0).toLocaleString()} ETB</p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Next Payout Date</p>
                <p className="text-xl font-bold">{stats?.nextPayoutDate || "Loading..."}</p>
              </div>
              <button className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-bold text-sm shadow-xl hover:bg-emerald-50 transition-all">
                Handle Payouts
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 size={16} /> Volume Analytics
            </h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Monthly GMV</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  {(stats?.totalVolume || 0).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Platform Fee Volume</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {((stats?.totalVolume || 0) * (globalRate/100)).toLocaleString()} ETB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      )}
    </div>

  );
}
