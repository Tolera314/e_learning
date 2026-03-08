"use client";

import { motion } from "framer-motion";
import { BookOpen, Laptop, Globe, Clock } from "lucide-react";

export default function KeyBenefits() {
  const benefits = [
    {
      title: "Structured Learning",
      description: "Courses organized meticulously by grade level and subject.",
      icon: <BookOpen className="text-emerald-500 w-8 h-8" />,
      color: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Interactive Lessons",
      description: "Engaging quizzes, assignments, and live interactive sessions.",
      icon: <Laptop className="text-blue-500 w-8 h-8" />,
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Learn in Your Language",
      description: "Full support for English, Amharic, and Afaan Oromo.",
      icon: <Globe className="text-purple-500 w-8 h-8" />,
      color: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Flexible Learning",
      description: "Study anytime, anywhere from your phone, tablet, or computer.",
      icon: <Clock className="text-orange-500 w-8 h-8" />,
      color: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-gray-900 dark:text-white"
          >
            Why Choose Ethio-Digital-Academy?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-gray-600 dark:text-gray-400"
          >
            We provide the most comprehensive digital learning experience tailored specifically for Ethiopian students.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white dark:bg-[#1a1a1a] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group"
            >
              <div className={`w-16 h-16 rounded-xl ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
