"use client";

import React, { useState } from "react";
import { User, Mail, Lock, Shield, CreditCard, Bell } from "lucide-react";
import SignatureUpload from "@/components/SignatureUpload";

export default function InstructorSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 mt-2">Manage your profile, security, and digital signatures.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-64 space-y-2">
          {[
            { id: "profile", label: "Profile Info", icon: <User size={18} /> },
            { id: "security", label: "Security", icon: <Lock size={18} /> },
            { id: "signatures", label: "Certifications", icon: <Shield size={18} /> },
            { id: "billing", label: "Payouts", icon: <CreditCard size={18} /> },
            { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 space-y-8">
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Public Profile</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                     <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none" defaultValue="Dr. Abraham Tadesse" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                     <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none" defaultValue="instructor@eda.edu.et" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Professional Bio</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none resize-none" defaultValue="Expert in Advanced Calculus and Physics with over 15 years of experience in higher education in Ethiopia." />
               </div>
               <button className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity">Save Changes</button>
            </div>
          )}

          {activeTab === 'signatures' && (
            <div className="space-y-8">
               <SignatureUpload role="INSTRUCTOR" />
               <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg h-fit"><Shield size={20} /></div>
                  <div>
                     <h4 className="font-bold text-blue-900 dark:text-blue-100">Certification Compliance</h4>
                     <p className="text-sm text-blue-800 dark:text-blue-200/70 mt-1 leading-relaxed">Your digital signature will be embedded in all course completion certificates issued by you. Ensure it is high-resolution for professional presentation.</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'security' && <div className="p-20 text-center text-gray-400 font-bold">Security Settings (2FA, Password)</div>}
        </div>
      </div>
    </div>
  );
}
