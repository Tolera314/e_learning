"use client";

import { 
  Star, 
  MessageSquare, 
  Edit, 
  Trash2, 
  BookOpen,
  Search,
  Filter
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const REVIEWS = [
  { id: "1", course: "Advanced Calculus for G12", rating: 5, comment: "This course helped me score 95% on my entrance exam! The instructor explains complex concepts very clearly.", date: "Oct 20, 2026" },
  { id: "2", course: "Physics Fundamentals: Mechanics", rating: 4, comment: "Great content. I wish there were more practice problems for the kinematics section.", date: "Sept 15, 2026" },
];

export default function StudentReviews() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">My Course Reviews</h1>
          <p className="text-gray-500 mt-2">Manage the feedback you've shared with instructors and the community.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search my reviews..." className="pl-12 pr-4 py-3 bg-white dark:bg-[#111] shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm w-full md:w-64" />
           </div>
        </div>
      </header>

      {/* REVIEW LIST */}
      <div className="space-y-6">
         {REVIEWS.map((review) => (
            <motion.div 
               key={review.id}
               whileHover={{ y: -2 }}
               className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6"
            >
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                        <BookOpen size={24} />
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{review.course}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{review.date}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1">
                     {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={18} className={s <= review.rating ? "text-amber-500 fill-amber-500" : "text-gray-200 dark:text-gray-800"} />
                     ))}
                  </div>
               </div>

               <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl relative">
                  <MessageSquare className="absolute -top-3 -left-3 text-emerald-500/20" size={32} />
                  <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">"{review.comment}"</p>
               </div>

               <div className="flex items-center gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                  <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors">
                     <Edit size={16} /> Edit Review
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors">
                     <Trash2 size={16} /> Delete
                  </button>
               </div>
            </motion.div>
         ))}

         {REVIEWS.length === 0 && (
            <div className="p-20 text-center border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
               <Star size={48} className="mx-auto text-gray-200 mb-4" />
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">You haven't reviewed any courses yet</p>
            </div>
         )}
      </div>
    </div>
  );
}
