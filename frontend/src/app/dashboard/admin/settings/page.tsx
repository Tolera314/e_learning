"use client";

import { useState } from "react";
import { 
  Settings, 
  Globe, 
  Shield, 
  Zap, 
  Bell, 
  Database, 
  Save,
  RotateCcw,
  Eye,
  Lock,
  MessageCircle,
  Clock,
  LayoutDashboard,
  ArrowUpRight,
  Search
  
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function SystemSettings() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("System settings updated successfully!");
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="text-emerald-600" size={32} />
            System Configuration
          </h1>
          <p className="text-gray-500 mt-1">Manage global site behavior, security protocols, and branding.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all">
            <RotateCcw size={20} />
            Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {saving ? <RotateCcw className="animate-spin" size={20} /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: General & Branding */}
        <div className="xl:col-span-2 space-y-8">
          {/* General Branding */}
          <section className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <Globe className="text-blue-500" />
              General Branding
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Platform Name</label>
                <input 
                  type="text" 
                  defaultValue="Ethio-Digital-Academy"
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Support Email</label>
                <input 
                  type="email" 
                  defaultValue="support@ethiodigital.com"
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Default Language</label>
                <select className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium">
                  <option>Amharic (Ethiopia)</option>
                  <option>English (International)</option>
                  <option>Oromo (Ethiopia)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Feature Toggles */}
          <section className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <Zap className="text-amber-500" />
              Feature Toggles
            </h3>
            
            <div className="space-y-4">
              {[
                { label: "Maintenance Mode", desc: "Block student access while updating platform systems.", active: false },
                { label: "Free Trial Access", desc: "Allow new users to access premium content for 7 days.", active: true },
                { label: "Public Instructor Registration", desc: "Open the platform for new instructor applications.", active: true },
                { label: "Global Chat System", desc: "Enable community discussions across all courses.", active: true }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                  <div className="max-w-md">
                    <p className="font-bold text-gray-900 dark:text-white">{feature.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                  </div>
                  <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${feature.active ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${feature.active ? "translate-x-6" : ""}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Security & Advanced */}
        <div className="space-y-8">
          {/* Security Protocols */}
          <section className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <Shield className="text-red-500" />
              Security
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={12} /> Password Policy
                </label>
                <select className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none text-sm font-medium">
                  <option>Strict (8+ chars, symbols, case)</option>
                  <option>Moderate (8+ chars)</option>
                  <option>Basic (6+ chars)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} /> Session Timeout
                </label>
                <select className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none text-sm font-medium">
                  <option>30 Minutes</option>
                  <option>2 Hours</option>
                  <option>24 Hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Force 2FA (Admins)</span>
                <div className="w-10 h-6 bg-emerald-500 rounded-full p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-4" />
                </div>
              </div>
            </div>
          </section>

          {/* Infrastructure */}
          <section className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <Database className="text-purple-500" />
              Database
            </h3>
            <div className="space-y-4">
              <button className="w-full py-4 px-6 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl font-bold text-sm hover:bg-purple-100 transition-all flex items-center justify-between">
                <span>Database Backup</span>
                <ArrowUpRight size={18} />
              </button>
              <button className="w-full py-4 px-6 bg-gray-50 dark:bg-gray-800/50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-between">
                <span>Clear Cache</span>
                <RotateCcw size={18} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
