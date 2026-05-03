"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

export default function Hero() {
  const [stats, setStats] = useState({
    totalCourses: 500,
    averageRating: "4.9",
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/dashboard/public-stats");
        setStats({
          totalCourses: data.totalCourses > 0 ? data.totalCourses : 500,
          averageRating: data.averageRating ? Number(data.averageRating).toFixed(1) : "4.9",
          loading: false
        });
      } catch (err) {
        setStats(s => ({ ...s, loading: false }));
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-white dark:from-[#0a1f16] dark:to-[#0a0a0a] -z-10" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-yellow-400/10 dark:bg-yellow-600/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          > 
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
              Quality Education, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">
                Accessible Anywhere.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              The premier digital learning platform built for Ethiopia. Structured curriculum-aligned content from KG to University, optimized for local bandwidth and tailored for your success.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-all transform hover:-translate-y-1 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                Start Free 3-Day Trial
                <ArrowRight size={20} />
              </Link>
              <button
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-full font-semibold transition-all flex items-center justify-center gap-2 group"
              >
                <PlayCircle className="text-emerald-500 group-hover:scale-110 transition-transform" size={20} />
                Watch Demo
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Telebirr / CBE Supported
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Low Bandwidth Ready
              </div>
            </div>
          </motion.div>

          {/* Image/Mockup Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative lg:h-[600px] flex items-center justify-center hidden md:flex"
          >
            {/* Background Decorative Element */}
            <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-600/5 rounded-full blur-[100px] -z-10" />
            
            <div className="relative w-full">
              {/* Main Laptop Mockup */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-full aspect-[16/10] bg-gray-900 rounded-2xl p-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-gray-800"
              >
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-950">
                  <Image 
                    src="/images/dashboard-mockup.png" 
                    alt="LMS Dashboard Mockup"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </motion.div>

              {/* Mobile Mockup Overlay */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="absolute -right-10 -bottom-10 z-20 w-1/3 aspect-[9/19] bg-gray-950 rounded-[2.5rem] p-2 shadow-2xl border-4 border-gray-800"
              >
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                  <Image 
                    src="/images/mobile-mockup.png" 
                    alt="Mobile App Mockup"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>

              {/* Floating Success Stats */}
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-12 top-1/4 z-30 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats.loading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500" /> : `${stats.totalCourses}+`}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Expert Lessons</div>
                </div>
              </motion.div>

              {/* Floating Rating */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute right-1/4 -top-12 z-30 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-3"
              >
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img src={`/images/avatar${(i % 4) + 1}.jpg`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-sm font-bold">
                      {stats.loading ? "..." : stats.averageRating}
                    </span>
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Trust Score</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
