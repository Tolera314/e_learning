"use client";

import { 
  Search, 
  MessageSquare, 
  MoreVertical, 
  TrendingUp, 
  Filter,
  ChevronRight,
  CheckCircle2,
  Video,
  HelpCircle,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import SlidePanel from "@/components/SlidePanel";



export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/instructor/students");
      setStudents(data);
      const uniqueCourses = Array.from(new Set(data.map((s: any) => s.course))) as string[];
      setCourses(uniqueCourses);
    } catch (err) {
      console.error("Failed to fetch students", err);
      toast.error("Failed to sync student data");
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                         s.course.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourse === "All" || s.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learner Insights</h1>
          <p className="text-gray-500 mt-2">Track real-time progress and academic milestones across your student base.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
          <TrendingUp size={16} /> {students.length} Active Learners
        </div>
      </header>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name..."
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
          />
        </div>
        <div className="relative group">
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="appearance-none px-10 py-3.5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 transition-colors outline-none cursor-pointer"
          >
            <option value="All">All Courses</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* STUDENT TABLE */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Student</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Enrolled Course</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Progress</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Quizzes</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Last Engagement</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((student) => (
                <tr key={student.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center font-bold text-emerald-600 text-sm overflow-hidden">
                        {student.avatar ? <img src={student.avatar} alt="" className="w-full h-full object-cover" /> : student.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-[10px] text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{student.course}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-28">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                        <span>{student.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${student.progress > 80 ? 'bg-emerald-500' : student.progress > 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-emerald-600">{student.quizzesDone} Done</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(student.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors"
                      >
                        Deep Dive <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-400">No students matching your selection.</div>
        )}
      </div>

      {/* STUDENT DETAIL SLIDE PANEL */}
      <SlidePanel
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.name || "Student Details"}
        subtitle={selectedStudent?.email}
      >
        {selectedStudent && (
          <div className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-2xl font-black overflow-hidden">
                {selectedStudent.avatar ? <img src={selectedStudent.avatar} alt="" className="w-full h-full object-cover" /> : selectedStudent.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">{selectedStudent.course}</span>
              </div>
            </div>

            <div className="p-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
              <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                <span>Overall Course Progress</span>
                <span className="text-emerald-600">{selectedStudent.progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${selectedStudent.progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Videos Watched", value: selectedStudent.videosWatched || 0, icon: Video },
                { label: "Quizzes Done", value: selectedStudent.quizzesDone || 0, icon: HelpCircle },
                { label: "Last Active", value: new Date(selectedStudent.lastActive).getDate() + " " + new Date(selectedStudent.lastActive).toLocaleString('default', { month: 'short' }), icon: Star }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="p-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-center">
                    <Icon size={18} className="mx-auto mb-2 text-emerald-500" />
                    <p className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Academic Milestones</h4>
              <div className="space-y-3">
                {(selectedStudent.milestones || []).map((m: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800/20 rounded-xl">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    {m}
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Send Guidance Message
            </button>
          </div>
        )}
      </SlidePanel>

      {loading && (
        <div className="fixed inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-50">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      )}
    </div>
  );
}


