"use client";

import { motion } from "framer-motion";
import { Baby, GraduationCap, School } from "lucide-react";
import Link from "next/link";

const segments = [
  {
    id: "kg-g5",
    title: "KG – Grade 5",
    description: "Foundational learning support with visual, structured video lessons.",
    icon: Baby,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
    features: ["Structured video lessons", "Downloadable practice PDFs", "Parent progress dashboard"],
  },
  {
    id: "g6-g12",
    title: "Grade 6 – 12",
    description: "Interactive academic reinforcement & robust national exam preparation.",
    icon: School,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 dark:bg-emerald-900/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
    features: ["Full course library", "Interactive quizzes & assignments", "Live session participation"],
  },
  {
    id: "university",
    title: "University / College",
    description: "Advanced academic resources and formal certification programs.",
    icon: GraduationCap,
    color: "bg-purple-500",
    lightColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
    features: ["Formal certification system", "Advanced instructor feedback", "Performance grading"],
  },
];

export default function Segments() {
  return (
    <section id="segments" className="py-24 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Structured Learning for Every Stage
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Our curriculum-aligned content is specifically tailored to guide Ethiopian students from their foundational years through to advanced university certifications.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {segments.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl transition-all hover:-translate-y-2 overflow-hidden flex flex-col h-full"
              >
                {/* Decorative background glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 -z-10 transition-opacity group-hover:opacity-40 ${segment.color}`} />
                
                <div className={`w-14 h-14 rounded-2xl ${segment.lightColor} flex items-center justify-center mb-6`}>
                  <Icon className={`w-7 h-7 ${segment.textColor}`} />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {segment.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-8 flex-grow">
                  {segment.description}
                </p>

                <Link
                  href={`/courses`}
                  className="mt-auto block py-3 px-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-center rounded-xl text-sm font-semibold text-gray-900 dark:text-emerald-400 transition-colors border border-gray-100 dark:border-gray-800"
                >
                  Explore Courses
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
