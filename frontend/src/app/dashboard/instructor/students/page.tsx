"use client";

import { 
  Search, 
  MessageSquare, 
  MoreVertical, 
  TrendingUp, 
  Filter
} from "lucide-react";

const STUDENTS = [
  { id: "1", name: "Abebe Kebede", email: "abebe@example.com", course: "Advanced Calculus", progress: 85, score: "92%", date: "Oct 2026" },
  { id: "2", name: "Sara Tesfaye", email: "sara@example.com", course: "Physics Fundamentals", progress: 40, score: "88%", date: "Sept 2026" },
  { id: "3", name: "Dawit Haile", email: "dawit@example.com", course: "Advanced Calculus", progress: 95, score: "95%", date: "Oct 2026" },
  { id: "4", name: "Tigist Bekele", email: "tigist@example.com", course: "Chemistry G11", progress: 12, score: "78%", date: "Nov 2026" },
  { id: "5", name: "Samuel Girma", email: "samuel@example.com", course: "Maths G10", progress: 60, score: "84%", date: "Oct 2026" },
];

export default function StudentManagement() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
        <p className="text-gray-500 mt-2">Track student progress, view performance, and send feedback.</p>
      </header>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search students by name or course..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
            />
         </div>
         <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-600 dark:text-gray-300 font-bold">
            <Filter size={18} /> Filter
         </button>
      </div>

      {/* STUDENT TABLE */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Student Name</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Enrolled Course</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Progress</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Avg. Score</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {STUDENTS.map((student) => (
                     <tr key={student.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center font-bold text-emerald-600">
                                 {student.name[0]}
                              </div>
                              <div>
                                 <p className="font-bold text-gray-900 dark:text-white">{student.name}</p>
                                 <p className="text-[10px] text-gray-500">{student.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{student.course}</span>
                           <p className="text-[10px] text-gray-500 mt-1">Since {student.date}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="w-32">
                              <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                 <span>{student.progress}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                 <div className={`h-full ${student.progress > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${student.progress}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <TrendingUp size={14} className="text-emerald-500" />
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{student.score}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors" title="Message Student">
                                 <MessageSquare size={18} />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                 <MoreVertical size={18} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
