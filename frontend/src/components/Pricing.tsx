"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4"
          >
            Affordable Learning for Every Student
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            Start your journey today. Cancel anytime.
          </motion.p>
        </div>

        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 lg:p-12 border border-emerald-100 dark:border-emerald-900 shadow-xl shadow-emerald-500/10 relative"
          >
            {/* Ribbon */}
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Most Popular
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Monthly Subscription
            </h3>
            
            <div className="my-6">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white">500</span>
              <span className="text-xl font-medium text-gray-500 dark:text-gray-400 ml-2">ETB / month</span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
              Includes a complete <span className="font-bold text-emerald-600 dark:text-emerald-400">3-Day Free Trial</span>. You won't be charged until the trial ends.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                "Unlimited access to all courses",
                "HD video streaming & downloads",
                "Quizzes, assignments & mock exams",
                "Official certificates of completion",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition-transform hover:-translate-y-1 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight size={20} />
            </Link>

            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Accepted</div>
              <div className="flex gap-4 items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                {/* Text placeholders for supported payments */}
                <div className="font-bold italic text-[#0f2142] dark:text-blue-200">Telebirr</div>
                <div className="font-bold text-purple-900 dark:text-purple-300">CBE Birr</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
