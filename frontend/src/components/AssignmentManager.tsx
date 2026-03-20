"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    FileText,
    Users,
    Calendar,
    Clock,
    Search,
    Filter,
    ChevronRight,
    MoreVertical,
    CheckCircle,
    AlertCircle,
    Clock3,
    Loader2,
    ExternalLink,
    GraduationCap,
    BookOpen
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Course {
    id: string;
    title: string;
    modules: {
        id: string;
        title: string;
        lessons: {
            id: string;
            title: string;
            assignment?: any;
        }[];
    }[];
}

interface Submission {
    id: string;
    assignmentId: string;
    student: {
        name: string;
        email: string;
    };
    fileUrl: string;
    originalName: string;
    status: string;
    grade: number | null;
    submittedAt: string;
}

export default function AssignmentManager() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<string>("");
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"create" | "grade">("create");

    const [assignmentForm, setAssignmentForm] = useState({
        instructions: "",
        deadline: "",
        maxPoints: 100,
        allowedFileTypes: ["pdf", "docx", "zip"]
    });

    const [gradingForm, setGradingForm] = useState({
        submissionId: "",
        grade: "",
        feedback: ""
    });

    useEffect(() => {
        fetchInstructorData();
    }, []);

    const fetchInstructorData = async () => {
        setLoading(true);
        try {
            const response = await api.get("/instructor/courses");
            setCourses(response.data);
            if (response.data.length > 0) {
                setSelectedCourse(response.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (assignmentId: string) => {
        try {
            const response = await api.get(`/instructor/assignments/${assignmentId}/submissions`);
            setSubmissions(response.data);
            setActiveTab("grade");
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/instructor/assignments", {
                ...assignmentForm,
                lessonId: selectedLessonId
            });
            toast.success("Assignment created successfully!");
            fetchInstructorData();
        } catch (error) {
            console.error("Failed to create assignment:", error);
            toast.error("Failed to create assignment");
        }
    };

    const handleGradeSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch(`/instructor/submissions/${gradingForm.submissionId}/grade`, {
                grade: gradingForm.grade,
                feedback: gradingForm.feedback
            });
            toast.success("Submission graded successfully!");
            // Refresh submissions
            const sub = submissions.find(s => s.id === gradingForm.submissionId);
            if (sub) fetchSubmissions(sub.assignmentId);
            setGradingForm({ submissionId: "", grade: "", feedback: "" });
        } catch (error) {
            console.error("Failed to grade submission:", error);
            toast.error("Failed to grade submission");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 size={40} className="text-emerald-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">Assignment Management</h1>
                <p className="text-gray-500 mt-2">Create assessments and review student submissions across your courses.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* COURSE LIST */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Your Courses</h2>
                    <div className="space-y-2">
                        {courses.map((course) => (
                            <button
                                key={course.id}
                                onClick={() => setSelectedCourse(course)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedCourse?.id === course.id
                                        ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/50 text-emerald-600 shadow-sm"
                                        : "bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800 text-gray-600 hover:border-emerald-500/30"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${selectedCourse?.id === course.id ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>
                                        <BookOpen size={18} />
                                    </div>
                                    <span className="text-sm font-bold truncate">{course.title}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* MAIN AREA */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center gap-4 bg-white dark:bg-[#111] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 w-fit">
                        <button
                            onClick={() => setActiveTab("create")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'create' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-gray-500 hover:text-emerald-600"}`}
                        >
                            Assignments
                        </button>
                        <button
                            onClick={() => setActiveTab("grade")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'grade' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-gray-500 hover:text-emerald-600"}`}
                        >
                            Submissions
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "create" ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Assignment</h2>
                                    <form onSubmit={handleCreateAssignment} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Select Lesson</label>
                                                <select
                                                    required
                                                    value={selectedLessonId}
                                                    onChange={(e) => setSelectedLessonId(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select a lesson</option>
                                                    {selectedCourse?.modules.map(module => (
                                                        <optgroup key={module.id} label={module.title}>
                                                            {module.lessons.map(lesson => (
                                                                <option key={lesson.id} value={lesson.id}>
                                                                    {lesson.title} {lesson.assignment ? "(Already has assignment)" : ""}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Deadline</label>
                                                <input
                                                    type="datetime-local"
                                                    value={assignmentForm.deadline}
                                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Instructions</label>
                                            <textarea
                                                required
                                                rows={4}
                                                placeholder="Detail the requirements, file formatting, and evaluation criteria..."
                                                value={assignmentForm.instructions}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Max Points</label>
                                                <input
                                                    type="number"
                                                    value={assignmentForm.maxPoints}
                                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: parseInt(e.target.value) })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Allowed Formats</label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {["pdf", "docx", "zip", "jpg", "png"].map(ext => (
                                                        <button
                                                            key={ext}
                                                            type="button"
                                                            onClick={() => {
                                                                const newTypes = assignmentForm.allowedFileTypes.includes(ext)
                                                                    ? assignmentForm.allowedFileTypes.filter(t => t !== ext)
                                                                    : [...assignmentForm.allowedFileTypes, ext];
                                                                setAssignmentForm({ ...assignmentForm, allowedFileTypes: newTypes });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${assignmentForm.allowedFileTypes.includes(ext)
                                                                    ? "bg-emerald-500 text-white"
                                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                                                }`}
                                                        >
                                                            .{ext.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <button className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[1.5rem] font-bold shadow-xl hover:shadow-emerald-500/10 transition-all mt-4 transform active:scale-95">
                                            Create Assignment
                                        </button>
                                    </form>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Active Assignments</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedCourse?.modules.flatMap(m => m.lessons).filter(l => l.assignment).map(lesson => (
                                            <div key={lesson.id} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group">
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-600 mb-1">{lesson.title}</p>
                                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">Evaluation #1</h4>
                                                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {lesson.assignment.deadline ? new Date(lesson.assignment.deadline).toLocaleDateString() : "No deadline"}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => fetchSubmissions(lesson.assignment.id)}
                                                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {submissions.length === 0 ? (
                                    <div className="bg-white dark:bg-[#111] p-12 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800 text-center">
                                        <FileText size={48} className="text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">No submissions to review for this assignment.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {submissions.map((sub) => (
                                            <div key={sub.id} className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
                                                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center font-bold text-lg">
                                                    {sub.student.name[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{sub.student.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{sub.originalName}</p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${sub.status === 'GRADED' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20"
                                                            }`}>
                                                            {sub.status}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{new Date(sub.submittedAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_API_URL}${sub.fileUrl}`}
                                                        target="_blank"
                                                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                                                    >
                                                        <ExternalLink size={14} /> View File
                                                    </a>
                                                    <button
                                                        onClick={() => setGradingForm({
                                                            submissionId: sub.id,
                                                            grade: sub.grade?.toString() || "",
                                                            feedback: ""
                                                        })}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                                                    >
                                                        Grade
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* GRADING MODAL (SIMPLE OVERLAY) */}
                                {gradingForm.submissionId && (
                                    <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Grading Submission</h3>
                                            <button onClick={() => setGradingForm({ submissionId: "", grade: "", feedback: "" })} className="text-gray-400 hover:text-red-500 transition-colors">
                                                Close
                                            </button>
                                        </div>
                                        <form onSubmit={handleGradeSubmission} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Grade (0-100)</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        max={100}
                                                        min={0}
                                                        value={gradingForm.grade}
                                                        onChange={(e) => setGradingForm({ ...gradingForm, grade: e.target.value })}
                                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Feedback</label>
                                                <textarea
                                                    required
                                                    rows={3}
                                                    value={gradingForm.feedback}
                                                    onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                                                />
                                            </div>
                                            <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/10 hover:bg-emerald-700 transition-all">
                                                Submit Grade
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
