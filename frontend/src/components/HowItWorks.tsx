"use client";

import { motion } from "framer-motion";
import { UserPlus, Search, PlayCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "Create an Account",
      description: "Register easily and start your free 3-day trial immediately.",
      icon: <UserPlus className="w-8 h-8 text-white" />,
      color: "bg-emerald-500",
    },
    {
      title: "Choose a Course",
      description: "Browse extensively structured subjects and enroll in what fits you best.",
      icon: <Search className="w-8 h-8 text-white" />,
      color: "bg-blue-500",
    },
    {
      title: "Start Learning",
      description: "Watch high-quality lessons, complete quizzes, and track your progress daily.",
      icon: <PlayCircle className="w-8 h-8 text-white" />,
      color: "bg-purple-500",
    },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-[#111] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-gray-900 dark:text-white"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-gray-600 dark:text-gray-400"
          >
            Your path to educational excellence in 3 simple steps.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-200 via-blue-200 to-purple-200 dark:from-emerald-900 dark:via-blue-900 dark:to-purple-900 -translate-y-1/2 rounded-full" />
          
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="relative"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border-4 border-gray-50 dark:border-[#111] shadow-md flex items-center justify-center font-bold text-gray-900 dark:text-white z-20">
                  {index + 1}
                </div>
                
                {/* Icon Container */}
                <div className={`mx-auto w-24 h-24 rounded-3xl ${step.color} shadow-lg shadow-${step.color.split('-')[1]}-500/30 flex items-center justify-center mb-8 relative z-10 transform hover:-translate-y-2 transition-transform duration-300`}>
                  {step.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
