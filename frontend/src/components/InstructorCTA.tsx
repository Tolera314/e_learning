"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function InstructorCTA() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-emerald-600 to-teal-800 dark:from-emerald-900/80 dark:to-[#0a1f16] border border-emerald-500/20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
          
          <div className="relative grid lg:grid-cols-2 gap-12 items-center p-12 md:p-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left text-white"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
                Teach on <span className="text-yellow-400">Ethio-Digital-Academy</span>
              </h2>
              <p className="text-lg md:text-xl text-emerald-50 mb-8 max-w-xl mx-auto lg:mx-0">
                Share your knowledge, reach thousands of Ethiopian students nationwide, and earn a sustainable income by teaching online.
              </p>
              <Link
                href="/instructors/apply"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-emerald-700 rounded-full font-bold text-lg transition-transform hover:-translate-y-1 shadow-xl"
              >
                Become an Instructor
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
