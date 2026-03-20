"use client";

import React from "react";
import { Shield, Settings, FileCheck, Info } from "lucide-react";
import SignatureUpload from "@/components/SignatureUpload";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
           <Shield size={14} /> System Administrator
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">System Configuration</h1>
        <p className="text-gray-500 mt-2 font-medium">Manage global credentials, platform signatures, and school standards.</p>
      </header>

      <section className="space-y-8">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg h-fit"><FileCheck size={20} /></div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Certification Authority</h2>
        </div>

        {/* CEO SIGNATURE UPLOAD */}
        <div className="space-y-6">
           <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex gap-4">
              <div className="p-2 bg-white dark:bg-gray-900 text-amber-500 rounded-xl shadow-sm"><Info size={20} /></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">As a System Administrator, you are responsible for maintaining the official **CEO digital signature**. This signature will be automatically embedded on every certificate issued across the Ethio-Digital Academy platform.</p>
           </div>
           
           <SignatureUpload role="CEO" />
        </div>
      </section>

      <section className="space-y-8 pt-12 border-t border-gray-100 dark:border-gray-800">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg h-fit"><Settings size={20} /></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Platform Settings</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[
               { title: "Verification API Status", value: "Operational", color: "text-emerald-500" },
               { title: "Storage Usage (Media)", value: "14.2 GB / 100 GB", color: "text-gray-500" },
               { title: "Active Instructors", value: "128 Verified", color: "text-gray-500" },
               { title: "System Uptime", value: "99.98%", color: "text-emerald-500" },
             ].map((stat, i) => (
               <div key={i} className="p-6 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center shadow-sm">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</span>
                  <span className={`text-sm font-black uppercase ${stat.color}`}>{stat.value}</span>
               </div>
             ))}
         </div>
      </section>
    </div>
  );
}
