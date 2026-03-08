"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-emerald-600 dark:bg-emerald-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-yellow-300 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute -bottom-24 left-1/2 w-80 h-80 bg-blue-300 rounded-full blur-3xl -translate-x-1/2" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight"
        >
          Start Your Learning Journey Today
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-2xl mx-auto font-medium"
        >
          Join Ethiopia's fastest-growing digital academy and unlock your full potential with 3 days of free access.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="w-full sm:w-auto px-10 py-5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-full font-bold text-lg transition-transform transform hover:-translate-y-1 shadow-2xl flex items-center justify-center gap-2"
          >
            Start Free Trial
            <ArrowRight size={22} />
          </Link>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-emerald-200 text-sm font-medium"
        >
          No credit card required for trial. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}
