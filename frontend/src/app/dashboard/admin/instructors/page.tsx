"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Eye, 
  FileText, 
  Users, 
  TrendingUp, 
  Loader2,
  MoreVertical,
  Clock,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Instructor {
  id: string;
  userId: string;
  isApproved: boolean;
  followerCount: number;
  totalWatchMinutes: number;
  highestEducation: string | null;
  teachingExperience: number | null;
  bio: string | null;
  degreeUrl: string | null;
  user: {
    name: string;
    email: string | null;
    phoneNumber: string;
    avatar: string | null;
    isBanned: boolean;
  };
  _count?: {
    followers: number;
  };
}

export default function InstructorManagement() {
  const [activeTab, setActiveTab] = useState<"approved" | "pending">("approved");
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "approved" ? "/admin/instructors" : "/admin/instructors/applications";
      const response = await api.get(endpoint);
      setInstructors(response.data);
    } catch (error) {
      toast.error(`Failed to fetch ${activeTab} instructors`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const approveInstructor = async (profileId: string) => {
    try {
      await api.post(`/admin/instructors/${profileId}/approve`);
      toast.success("Instructor approved successfully!");
      setInstructors(instructors.filter(i => i.id !== profileId));
    } catch (error) {
      toast.error("Approval failed");
    }
  };

  const filteredInstructors = instructors.filter(i => 
    i.user.name.toLowerCase().includes(search.toLowerCase()) ||
    i.user.email?.toLowerCase().includes(search.toLowerCase()) ||
    i.user.phoneNumber.includes(search)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <GraduationCap className="text-emerald-600" size={32} />
            Instructor Management
          </h1>
          <p className="text-gray-500 mt-1">Manage instructor lifecycle, approvals, and performance.</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800/40 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "approved" ? "bg-white dark:bg-gray-900 text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Active Instructors
          </button>
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "pending" ? "bg-white dark:bg-gray-900 text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Approval Queue
            {activeTab === "approved" && instructors.length > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder={`Search ${activeTab} instructors...`} 
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-emerald-600" size={48} />
              <p className="text-gray-500 font-medium">Loading instructor data...</p>
            </div>
          ) : filteredInstructors.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 italic">No instructors found matching your search.</p>
            </div>
          ) : (
            filteredInstructors.map((instructor) => (
              <motion.div 
                key={instructor.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6"
              >
                {/* Profile Header */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center font-bold text-3xl shadow-inner">
                    {instructor.user.name[0]}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${instructor.isApproved ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30"}`}>
                    {instructor.isApproved ? "Approved" : "Pending"}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{instructor.user.name}</h3>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1.5"><FileText size={14} /> {instructor.highestEducation || "Self-taught"}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {instructor.teachingExperience || 0} yrs exp</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                    {instructor.bio || "No bio provided."}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Followers</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        {instructor.followerCount || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Watch Time</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-500" />
                        {Math.floor(instructor.totalWatchMinutes / 60)} hrs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-2">
                      {instructor.degreeUrl && (
                        <a 
                          href={instructor.degreeUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                        >
                          <Eye size={14} /> Credentials
                        </a>
                      )}
                    </div>

                    {!instructor.isApproved ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => approveInstructor(instructor.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                        >
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all">
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <ShieldCheck size={16} /> Verified Instructor
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
