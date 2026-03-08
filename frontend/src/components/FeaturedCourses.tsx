"use client";

import { motion } from "framer-motion";
import { Star, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function FeaturedCourses() {
  const courses = [
    {
      id: "1",
      title: "Grade 12 Mathematics (Natural)",
      instructor: "Ato Dawit T.",
      rating: 4.8,
      duration: "45 Hours",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    },
    {
      id: "2",
      title: "Freshman Physics 101",
      instructor: "Dr. Aster K.",
      rating: 4.9,
      duration: "60 Hours",
      thumbnail: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80",
    },
    {
      id: "3",
      title: "Grade 8 English Preparatory",
      instructor: "Tr. Bethelhem Y.",
      rating: 4.7,
      duration: "30 Hours",
      thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4"
            >
              Featured Courses
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 dark:text-gray-400"
            >
              Join thousands of students learning from Ethiopia's top educators.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/courses" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-2">
              View All Courses <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="group bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image 
                  src={course.thumbnail} 
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  By {course.instructor}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={16} className="fill-current" />
                    <span className="font-semibold text-sm">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock size={16} />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <Link
                  href={`/courses/${course.id}`}
                  className="mt-6 w-full py-3 bg-gray-50 dark:bg-[#1a1a1a] hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-gray-900 dark:text-emerald-400 font-medium rounded-xl text-center transition-colors border border-gray-100 dark:border-gray-800"
                >
                  Enroll Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
