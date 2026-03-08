"use client";

import {
   User,
   Mail,
   Smartphone,
   Globe,
   Lock,
   Upload,
   Save,
   Bell,
   Languages,
   BookOpen
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function StudentSettings() {
   const [formData, setFormData] = useState({
      name: "Abebe Kebede",
      email: "abebe@example.com",
      phone: "+251 911 223344",
      language: "Amharic",
      education: "University (Year 2)",
      interests: ["Mathematics", "Physics", "Computer Science"]
   });

   return (
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">Account Settings</h1>
               <p className="text-gray-500 mt-2">Personalize your profile and manage your preferences.</p>
            </div>
            <button className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all">
               <Save size={18} /> Save Changes
            </button>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* SIDEBAR SETTINGS NAVIGATION (MOCK) */}
            <div className="space-y-2">
               {[
                  { icon: <User size={18} />, label: "Personal Information", active: true },
                  { icon: <Lock size={18} />, label: "Security & Password" },
                  { icon: <Bell size={18} />, label: "Notification Settings" },
                  { icon: <Languages size={18} />, label: "Regional & Language" },
               ].map((item, i) => (
                  <button
                     key={i}
                     className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm text-left ${item.active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                     {item.icon} {item.label}
                  </button>
               ))}
            </div>

            {/* MAIN SETTINGS FORM */}
            <div className="lg:col-span-2 space-y-10">
               {/* PROFILE PHOTO */}
               <section className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                     <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center text-4xl font-bold relative group">
                        A
                        <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                           <Upload size={24} className="text-white" />
                        </div>
                     </div>
                     <div className="text-center sm:text-left">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Photo</h3>
                        <p className="text-sm text-gray-500 mb-6">Upload a professional photo to help instructors identify you.</p>
                        <div className="flex items-center justify-center sm:justify-start gap-4">
                           <button className="px-6 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold shadow-lg shadow-black/10">Upload Image</button>
                           <button className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">Remove Photo</button>
                        </div>
                     </div>
                  </div>
               </section>

               {/* GENERAL INFO */}
               <section className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><User size={14} /> Full Name</label>
                        <input type="text" value={formData.name} readOnly className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-gray-900 dark:text-white" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Mail size={14} /> Email Address</label>
                        <input type="email" value={formData.email} readOnly className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-gray-900 dark:text-white" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Smartphone size={14} /> Phone Number</label>
                        <input type="tel" value={formData.phone} readOnly className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-gray-900 dark:text-white" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} /> Education Level</label>
                        <select value={formData.education} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-gray-900 dark:text-white appearance-none">
                           <option>Primary (G1-G6)</option>
                           <option>Secondary (G7-G12)</option>
                           <option>University (Year 1)</option>
                           <option>University (Year 2)</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-800">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Globe size={14} /> Language Preference</label>
                     <div className="flex flex-wrap gap-4">
                        {["English", "Amharic", "Afaan Oromo", "Tigrinya"].map((lang) => (
                           <button
                              key={lang}
                              className={`px-6 py-3 rounded-2xl text-xs font-bold border transition-all ${lang === formData.language ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-500/20' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:border-emerald-300'}`}
                           >
                              {lang}
                           </button>
                        ))}
                     </div>
                  </div>
               </section>
            </div>
         </div>
      </div>
   );
}
