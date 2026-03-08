"use client";

import { motion } from "framer-motion";
import { 
  PlaySquare, 
  Video, 
  CheckCircle, 
  Download, 
  BarChart, 
  Award, 
  Users 
} from "lucide-react";

export default function Features() {
  const features = [
    { title: "Video Tutorials", icon: <PlaySquare className="w-6 h-6 text-emerald-500" /> },
    { title: "Live Classes", icon: <Video className="w-6 h-6 text-blue-500" /> },
    { title: "Assignments & Quizzes", icon: <CheckCircle className="w-6 h-6 text-orange-500" /> },
    { title: "Downloadable Materials", icon: <Download className="w-6 h-6 text-purple-500" /> },
    { title: "Progress Tracking", icon: <BarChart className="w-6 h-6 text-pink-500" /> },
    { title: "Certification System", icon: <Award className="w-6 h-6 text-yellow-500" /> },
    { title: "Instructor-Led Courses", icon: <Users className="w-6 h-6 text-indigo-500" /> },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4"
          >
            Everything You Need to Succeed
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            Our platform is packed with features designed to make learning engaging and effective.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-gray-50 dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 rounded-full bg-white dark:bg-[#1a1a1a] shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
            </motion.div>
          ))}
          
          {/* Decorative Last Span Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: features.length * 0.1, duration: 0.4 }}
            className="hidden lg:flex bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white flex-col items-center justify-center text-center shadow-lg shadow-emerald-500/20"
          >
            <h3 className="font-bold text-xl mb-2">And much more...</h3>
            <p className="text-emerald-50 text-sm">Join today to unlock all features.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
