"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      text: "Ethio-Digital-Academy helped me prepare for my national exams entirely from home. The video lessons are incredibly clear.",
      author: "Meron A.",
      role: "Grade 12 Student",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1bfa82?w=400&h=400&fit=crop&q=80",
    },
    {
      text: "The language support is amazing. Being able to switch between Amharic and English made catching up on Math so much easier.",
      author: "Yonas G.",
      role: "Grade 8 Student",
      image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&q=80",
    },
    {
      text: "As a parent, the progress tracking feature gives me peace of mind knowing exactly what areas my child needs help with.",
      author: "Abebech T.",
      role: "Parent of KG student",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&q=80",
    },
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
            Trusted by Ethiopian Students
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            Don't just take our word for it—hear from the students who learn with us every day.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="bg-gray-50 dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 relative"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-gray-200 dark:text-gray-800 -z-0" />
              
              <div className="relative z-10">
                <div className="flex text-amber-500 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-8 italic">
                  "{item.text}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 border-2 border-white dark:border-gray-700">
                    <img src={item.image} alt={item.author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.author}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
