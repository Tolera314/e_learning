'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Play, Clock, TrendingUp, AlertCircle, DollarSign, ArrowUpRight } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

const MonetizationPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/instructor/monetization/stats');
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to load monetization stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-10 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Instructor Monetization</h1>
        <p className="text-slate-500 mt-1">Track your progress and eligibility for platform payouts.</p>
      </header>

      {/* STATUS BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-3xl border ${
          stats?.isEligible 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
          : 'bg-amber-50 border-amber-100 text-amber-800'
        } flex items-center justify-between shadow-sm`}
      >
        <div className="flex items-center gap-4">
          {stats?.isEligible ? (
             <TrendingUp className="w-8 h-8 text-emerald-600" />
          ) : (
             <AlertCircle className="w-8 h-8 text-amber-600" />
          )}
          <div>
            <h3 className="font-bold text-lg">
              {stats?.isEligible ? 'Eligible for Payouts' : 'Road to Monetization'}
            </h3>
            <p className="text-sm opacity-90">
              {stats?.isEligible 
                ? 'Your account is ready for monetization. Payouts are processed monthly.' 
                : 'Complete the milestones below to start earning from your content.'}
            </p>
          </div>
        </div>
        {!stats?.isEligible && (
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Payouts Status</span>
            <p className="text-sm font-bold">Locked</p>
          </div>
        )}
      </motion.div>

      {/* CORE METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Followers', value: stats?.metrics.followers, target: stats?.thresholds.FOLLOWERS, icon: <Users className="text-blue-600" /> },
          { label: 'Watch Hours', value: stats?.metrics.watchHours, target: stats?.thresholds.WATCH_HOURS, icon: <Clock className="text-purple-600" /> },
          { label: 'Students', value: stats?.metrics.totalStudents, icon: <TrendingUp className="text-emerald-600" /> },
          { label: 'Live Sessions', value: stats?.metrics.liveSessionsCount, icon: <Play className="text-rose-600" /> },
        ].map((metric, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl">{metric.icon}</div>
              <ArrowUpRight className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium">{metric.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {metric.value}
              {metric.target && <span className="text-slate-400 text-sm font-normal"> / {metric.target}</span>}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* MILESTONE PROGRESS */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Eligibility Milestones</h3>
          <div className="space-y-10">
            {/* Followers Progress */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-bold text-slate-900">Community Size</p>
                  <p className="text-xs text-slate-500">Goal: 10,000 Followers</p>
                </div>
                <span className="text-sm font-bold text-blue-600">{stats?.progress.followers}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${stats?.progress.followers}%` }}
                   className="h-full bg-blue-600 rounded-full"
                />
              </div>
            </div>

            {/* Watch Time Progress */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-bold text-slate-900">Watch Engagement</p>
                  <p className="text-xs text-slate-500">Goal: 500 Hours</p>
                </div>
                <span className="text-sm font-bold text-purple-600">{stats?.progress.watchTime}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${stats?.progress.watchTime}%` }}
                   className="h-full bg-purple-600 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PAYOUT ESTIMATOR */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" /> Earning Potential
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center py-4 border-b border-white/10">
              <span className="text-slate-400">Est. Monthly Revenue</span>
              <span className="text-2xl font-bold text-emerald-400">ETB 0.00</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-white/10">
              <span className="text-slate-400">Revenue Share</span>
              <span className="font-bold">70%</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-slate-400">Next Payout Date</span>
              <span className="font-bold text-slate-300">Pending Eligibility</span>
            </div>

            <button className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all mt-4">
              View Payout History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonetizationPage;
