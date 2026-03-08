"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";

export default function LanguageSupport() {
  const languages = [
    { name: "English", native: "English", color: "bg-blue-500" },
    { name: "Amharic", native: "አማርኛ", color: "bg-emerald-500" },
    { name: "Afaan Oromo", native: "Afaan Oromoo", color: "bg-orange-500" },
  ];

  return (
    <section className="py-16 bg-white dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 dark:bg-[#111] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-6 md:w-1/2"
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a1a] shadow-sm flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
              <Languages className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Learn in your preferred language
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We bridge the language gap to make education truly accessible. Switch languages instantly.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-4 justify-center md:justify-end md:w-1/2"
          >
            {languages.map((lang, index) => (
              <div 
                key={index} 
                className="px-6 py-3 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all cursor-default"
              >
                <span className="font-bold text-gray-900 dark:text-white text-lg">{lang.native}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</span>
              </div>
            ))}
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
