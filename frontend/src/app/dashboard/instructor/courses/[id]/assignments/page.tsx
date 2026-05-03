"use client";

import { useState, useEffect } from "react";
import { 
   ChevronLeft, 
   Plus,
   Calendar,
   FileText,
   CheckCircle2,
   Download,
   User,
   MessageSquare
} from "lucide-react";
import Link from "next/link";
import SlidePanel from "@/components/SlidePanel";
import { useParams } from "next/navigation";
import api from "@/lib/api";

export default function CourseAssignments() {
  const params = useParams();
  const courseId = params?.id;
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  useEffect(() => {
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/instructor/assignments/course/${courseId}`);
      setAssignments(data);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAssignment) {
      fetchSubmissions(activeAssignment.id);
    }
  }, [activeAssignment]);

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      setLoadingSubmissions(true);
      const { data } = await api.get(`/instructor/assignments/${assignmentId}/submissions`);
      setSubmissions(data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Panel States
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isGradePanelOpen, setIsGradePanelOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);

  // Forms
  const [form, setForm] = useState({ title: "", instructions: "", dueDate: "", lessonId: "" });
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });

  const handleCreateAssignment = () => {
    setForm({ title: "", instructions: "", dueDate: "", lessonId: "" });
    setIsCreatePanelOpen(true);
  };

  const handleSaveAssignment = async () => {
     if (!form.title || !form.lessonId) return alert("Title and Lesson are required");
     try {
       await api.post("/instructor/assignments", {
         lessonId: form.lessonId,
         instructions: form.instructions,
         deadline: form.dueDate,
         maxPoints: 100
       });
       fetchAssignments();
       setIsCreatePanelOpen(false);
     } catch (err) {
       alert("Failed to create assignment");
     }
  };

  const handleOpenGrading = (submission: any) => {
     setGradingSubmission(submission);
     setGradeForm({ grade: submission.grade?.toString() || "", feedback: submission.feedback || "" });
     setIsGradePanelOpen(true);
  };

  const handleSaveGrade = async () => {
     if (!gradeForm.grade) return alert("Grade is required");
     try {
       await api.patch(`/instructor/submissions/${gradingSubmission.id}/grade`, {
         grade: gradeForm.grade,
         feedback: gradeForm.feedback
       });
       fetchSubmissions(activeAssignment.id);
       setIsGradePanelOpen(false);
     } catch (err) {
       alert("Failed to save grade");
     }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 mt-10">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
           <Link href="/dashboard/instructor/courses" className="p-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 hover:text-emerald-600 transition-colors shadow-sm">
              <ChevronLeft size={20} />
           </Link>
           <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignment Management</h1>
             <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Course Assignments</span>
             </p>
           </div>
        </div>
        {!activeAssignment && (
          <button 
            onClick={handleCreateAssignment}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
          >
            <Plus size={20} /> Create Assignment
          </button>
        )}
      </header>

      {/* WORKSPACE */}
      {!activeAssignment ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
               <div key={assignment.id} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col hover:shadow-lg transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                     <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg ${assignment.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                        {assignment.status}
                     </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 line-clamp-2">{assignment.title}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6 mt-auto border-t border-gray-50 dark:border-gray-800/50 pt-6">
                     <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1.5"><Calendar size={12}/> Due Date</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'No deadline'}</p>
                     </div>
                     <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1.5"><FileText size={12}/> Submissions</p>
                        <p className="text-sm font-bold text-emerald-600">{assignment._count?.submissions || 0} received</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => setActiveAssignment(assignment)} 
                     className="w-full py-3.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-emerald-900/30 rounded-xl font-bold transition-colors"
                  >
                     View Submissions
                  </button>
               </div>
            ))}
         </div>
      ) : (
         <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden max-w-5xl mx-auto">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0a0a0a]/50">
               <button onClick={() => setActiveAssignment(null)} className="text-sm font-bold text-gray-400 hover:text-emerald-600 transition-colors mb-4 flex items-center gap-1">
                  <ChevronLeft size={16} /> Back to Assignments
               </button>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeAssignment.title}</h2>
               <div className="flex items-center gap-4 mt-4">
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <Calendar size={14} /> Due: {activeAssignment.deadline ? new Date(activeAssignment.deadline).toLocaleString() : 'N/A'}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={14} /> {submissions.filter(s => s.grade).length} / {submissions.length} Graded
                  </span>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Student</th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Submission Date</th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Files</th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Grade</th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                     {submissions.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                    {(sub.student?.name || "S").charAt(0)}
                                 </div>
                                 <span className="font-bold text-gray-900 dark:text-white">{sub.student?.name || "Student"}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                              {new Date(sub.submittedAt).toLocaleString()}
                           </td>
                           <td className="px-8 py-6">
                              <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors">
                                 <Download size={14} /> Download
                              </button>
                           </td>
                           <td className="px-8 py-6">
                              {sub.grade ? (
                                 <span className="font-bold text-emerald-600">{sub.grade} / 100</span>
                              ) : (
                                 <span className="text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">Needs Grading</span>
                              )}
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button 
                                 onClick={() => handleOpenGrading(sub)}
                                 className="px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-black rounded-lg text-sm font-bold hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-colors"
                              >
                                 {sub.grade ? "Edit Grade" : "Grade Now"}
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* PANELS */}
      <SlidePanel isOpen={isCreatePanelOpen} onClose={() => setIsCreatePanelOpen(false)} title="Create New Assignment">
         <div className="space-y-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Assignment Title *</label>
               <input 
                  type="text" 
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Instructions *</label>
               <textarea 
                  rows={4}
                  value={form.instructions}
                  onChange={(e) => setForm({...form, instructions: e.target.value})}
                  className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white resize-none"
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Due Date & Time *</label>
               <input 
                  type="datetime-local" 
                  value={form.dueDate}
                  onChange={(e) => setForm({...form, dueDate: e.target.value})}
                  className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
               />
            </div>
            <button onClick={handleSaveAssignment} className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors">
               Publish Assignment
            </button>
         </div>
      </SlidePanel>

      <SlidePanel isOpen={isGradePanelOpen} onClose={() => setIsGradePanelOpen(false)} title="Grade Submission">
         {gradingSubmission && (
           <div className="space-y-8">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                 <User size={20} className="text-blue-600 dark:text-blue-500" />
                 <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{gradingSubmission.student?.name || "Student"}</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Submitted on {new Date(gradingSubmission.submittedAt).toLocaleString()}</p>
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Score (out of 100) *</label>
                 <input 
                    type="number" 
                    value={gradeForm.grade}
                    max={100}
                    onChange={(e) => setGradeForm({...gradeForm, grade: e.target.value})}
                    className="w-full p-6 text-3xl font-black bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-600 text-center"
                 />
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <MessageSquare size={16} /> Feedback
                 </label>
                 <textarea 
                    rows={6}
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                    className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white resize-none"
                 />
              </div>

              <button onClick={handleSaveGrade} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors">
                 Save Grade
              </button>
           </div>
         )}
      </SlidePanel>
    </div>
  );
}
