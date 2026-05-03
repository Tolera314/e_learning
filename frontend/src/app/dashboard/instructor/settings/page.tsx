"use client";
import React, { useState, useEffect } from "react";
import { User, Lock, Shield, CreditCard, Bell, Camera, Eye, EyeOff, CheckCircle2, Globe, Languages, Loader2, AlertCircle } from "lucide-react";
import SignatureUpload from "@/components/SignatureUpload";
import api from "@/lib/api";

export default function InstructorSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    title: "",
    bio: "",
    language: "English",
    avatar: ""
  });

  useEffect(() => {
    setLoading(true);
    api.get("/instructor/profile")
      .then(res => setForm(res.data))
      .catch(err => {
        console.error("Failed to fetch instructor profile:", err);
        setError("Could not load profile data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.patch("/instructor/profile", {
        name: form.name,
        phoneNumber: form.phoneNumber,
        title: form.title,
        bio: form.bio,
        language: form.language
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be under 5MB");
        return;
      }
      
      const formData = new FormData();
      formData.append("avatar", file);
      
      try {
        setSaving(true);
        const res = await api.post("/instructor/avatar", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setForm({ ...form, avatar: res.data.avatar });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        setError("Failed to upload avatar.");
      } finally {
        setSaving(false);
      }
    }
  };

  const TABS = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "signatures", label: "Certifications", icon: Shield },
    { id: "billing", label: "Payouts", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading instructor settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 mt-2">Manage your profile, security, and preferences.</p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-56 shrink-0 space-y-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <Icon size={17} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* PROFILE INFO */}
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Public Profile</h3>

              {/* Profile Photo */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {form.avatar ? (
                    <img src={form.avatar} alt="Profile" className="w-20 h-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-3xl font-black">
                      {form.name?.charAt(0) || "A"}
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <Camera size={12} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Profile Photo</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG accepted. Max 5MB.</p>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
                <div className="space-y-2 opacity-60">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                  <input type="email" value={form.email} readOnly className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expertise / Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Number</label>
                  <input type="tel" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Professional Bio</label>
                <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Globe size={12} /> Language</label>
                  <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none">
                    <option>English</option>
                    <option>Amharic</option>
                    <option>Afaan Oromo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Languages size={12} /> Teaching Language</label>
                  <select defaultValue="English" className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none">
                    <option>English</option>
                    <option>Amharic</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-colors shadow-lg disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle2 size={18} className="text-emerald-400" /> : null}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
              </button>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security Settings</h3>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Current Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder="Enter current password" className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">New Password</label>
                  <input type="password" placeholder="Min 8 characters" className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Confirm New Password</label>
                  <input type="password" placeholder="Re-enter new password" className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <button className="px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:bg-emerald-600 transition-colors">
                Update Password
              </button>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Authenticator App</p>
                    <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your instructor account.</p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors">Enable</button>
                </div>
              </div>
            </div>
          )}

          {/* SIGNATURES */}
          {activeTab === "signatures" && (
            <div className="space-y-8">
              <SignatureUpload role="INSTRUCTOR" />
              <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl h-fit"><Shield size={20} /></div>
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-100">Certification Compliance</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200/70 mt-1 leading-relaxed">Your digital signature will be embedded in all course completion certificates. Ensure it is high-resolution for professional presentation.</p>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
              {[
                { label: "New Student Enrollment", desc: "Get notified when a student joins your course", enabled: true },
                { label: "Assignment Submission", desc: "Get notified when a student submits work", enabled: true },
                { label: "New Review Posted", desc: "Get notified when a student leaves a review", enabled: false },
                { label: "Live Session Reminders", desc: "Get reminded 1 hour before your live class", enabled: true },
                { label: "Payment Received", desc: "Get notified on each successful payment", enabled: true },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{pref.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{pref.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={pref.enabled} className="w-5 h-5 accent-emerald-600" />
                </div>
              ))}
              <button className="px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:bg-emerald-600 transition-colors">
                Save Preferences
              </button>
            </div>
          )}

          {/* BILLING */}
          {activeTab === "billing" && (
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payout Settings</h3>
              <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">No payout method configured.</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Add your bank account or TeleBirr wallet to receive automatic payouts on the 15th of each month.</p>
              </div>
              <button className="px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
                + Connect Payout Method
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
