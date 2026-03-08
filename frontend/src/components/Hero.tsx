"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium text-sm mb-6 border border-emerald-200 dark:border-emerald-800/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Empowering Ethiopia&apos;s Digital Future
            </div>
            
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative lg:h-[600px] flex items-center justify-center hidden md:flex"
          >
            {/* We will use a stylistic generic representation since we don't have images yet */}
            <div className="relative w-full max-w-lg aspect-square">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 border-2 border-emerald-100 dark:border-emerald-900 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-4 border border-dashed border-emerald-200 dark:border-emerald-800 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
              
              {/* Core graphic */}
              <div className="absolute inset-8 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full shadow-2xl flex items-center justify-center overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
                  alt="Students learning"
                  fill
                  priority
                  className="object-cover mix-blend-overlay opacity-60"
                />
                
                {/* Overlay Dashboard Mockup element */}
                <div className="absolute right-0 bottom-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">98%</div>
                    <div>
                      <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mb-1"></div>
                      <div className="h-2 w-12 bg-gray-100 dark:bg-gray-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">Exam Ready</div>
                </div>
              </div>

              {/* Decorative nodes */}
              <div className="absolute top-0 right-1/4 w-16 h-16 bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center -translate-y-1/2">
                <BookOpen className="text-emerald-500" size={24} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
