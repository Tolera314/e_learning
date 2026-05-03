"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  TrendingUp, 
  BookOpen, 
  Loader2,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  GraduationCap,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Enrollment {
  id: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  course: {
    title: string;
  };
}

export default function EnrollmentAnalytics() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/enrollments");
      setEnrollments(response.data);
    } catch (error) {
      toast.error("Failed to fetch enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter(e => 
    e.user.name.toLowerCase().includes(search.toLowerCase()) ||
    e.user.email.toLowerCase().includes(search.toLowerCase()) ||
    e.course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="text-emerald-600" size={32} />
            Enrollment Oversight
          </h1>
          <p className="text-gray-500 mt-1">Track student growth and course engagement platform-wide.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">+14.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by student or course..." 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
          <Filter size={20} />
          Filters
        </button>
      </div>

      {/* Enrollment Feed */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Intake</h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">Real-time</span>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
                <p className="text-gray-500 text-sm font-medium">Synchronizing enrollment data...</p>
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="p-20 text-center text-gray-500 italic">No recent enrollments found.</div>
            ) : (
              filteredEnrollments.map((en) => (
                <motion.div 
                  key={en.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{en.user.name}</p>
                      <p className="text-xs text-gray-500">{en.user.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 max-w-md">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <BookOpen size={14} className="text-emerald-600" />
                      {en.course.title}
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={12} /> {new Date(en.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-bold text-blue-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Active Enrollment
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
