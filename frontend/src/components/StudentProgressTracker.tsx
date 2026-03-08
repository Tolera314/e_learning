"use client";

import {
   Search,
   Filter,
   MoreVertical,
   Mail,
   MessageSquare,
   TrendingDown,
   CheckCircle2,
   Clock,
   ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useEffect, useState } from "react";

interface StudentProgress {
   id: string;
   name: string;
   email: string;
   progress: number;
   lessonsCompleted: string;
   videosWatched: string;
   avgQuizScore: number;
   status: 'active' | 'drifting' | 'at-risk';
}

export default function StudentProgressTracker() {
   const [students, setStudents] = useState<StudentProgress[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchStudents = async () => {
         try {
            const response = await api.get('/instructor/student-progress');
            setStudents(response.data);
         } catch (err) {
            console.error('Failed to fetch student progress:', err);
         } finally {
            setLoading(false);
         }
      };
      fetchStudents();
   }, []);

   if (loading) return <div className="h-96 bg-gray-50 dark:bg-gray-900/50 animate-pulse rounded-[3rem]" />;

   return (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
            <div className="relative flex-1 w-full max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                  type="text"
                  placeholder="Search students..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-emerald-500/20"
               />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button className="flex-1 md:flex-none px-6 py-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                  <Filter size={16} /> Filters
               </button>
               <button className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-emerald-500/20">
                  Export Report
               </button>
            </div>
         </div>

         <div className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-none">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Student</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Progress</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Lesson Stats</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Quiz Avg.</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                     {students.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center font-black">
                                    {student.name[0]}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{student.name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold">{student.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="flex-1 w-24">
                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                       <div className={`h-full ${student.progress > 70 ? 'bg-emerald-500' : student.progress > 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${student.progress}%` }} />
                                    </div>
                                 </div>
                                 <span className="text-xs font-black text-gray-900 dark:text-gray-300">{student.progress}%</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="space-y-1">
                                 <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> {student.lessonsCompleted}</p>
                                 <p className="text-[10px] text-gray-500 flex items-center gap-2"><Clock size={12} /> {student.videosWatched} Videos</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <span className={`text-sm font-black ${student.avgQuizScore >= 80 ? 'text-emerald-600' : student.avgQuizScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {student.avgQuizScore}%
                                 </span>
                                 {student.avgQuizScore < 60 && <TrendingDown size={14} className="text-red-500" />}
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${student.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' :
                                    student.status === 'drifting' ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-600' :
                                       'bg-red-50 dark:bg-red-900/10 text-red-600'
                                 }`}>
                                 {student.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"><Mail size={16} /></button>
                                 <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"><ArrowUpRight size={16} /></button>
                                 <button className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg"><MoreVertical size={16} /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="p-8 bg-gray-900 dark:bg-emerald-950/20 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
               <h4 className="text-xl font-black mb-2 italic">Automated Intervention</h4>
               <p className="text-sm opacity-60 leading-relaxed max-w-xl">We found 12 students that haven't logged in for 3+ days. Would you like to send a "Catch-up" notification with the latest lesson materials?</p>
            </div>
            <button className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs whitespace-nowrap hover:scale-[1.05] transition-all">
               Send Engagement Alert
            </button>
         </div>
      </div>
   );
}
