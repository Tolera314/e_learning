"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Upload,
    Clock,
    CheckCircle,
    AlertCircle,
    X,
    FileCheck,
    Loader2,
    Trash2,
    MoreVertical,
    Download
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Assignment {
    id: string;
    instructions: string;
    deadline: string | null;
    maxPoints: number;
    allowedFileTypes: string[];
    submissions: {
        id: string;
        fileUrl: string;
        originalName: string;
        status: string;
        grade: number | null;
        feedback: string | null;
        submittedAt: string;
    }[];
}

interface StudentAssignmentViewProps {
    courseId: string;
}

export default function StudentAssignmentView({ courseId }: StudentAssignmentViewProps) {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, [courseId]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/student/courses/${courseId}/assignments`);
            setAssignments(response.data);
        } catch (error) {
            console.error("Failed to fetch assignments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedAssignment) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("submission", file);

        try {
            await api.post(`/student/assignments/${selectedAssignment.id}/submit`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Assignment submitted successfully!");
            setFile(null);
            setSelectedAssignment(null);
            fetchAssignments();
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Submission failed. Check file type and size.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <Loader2 size={32} className="text-emerald-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Assignments</h2>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{assignments.length} Total</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {assignments.length === 0 ? (
                    <div className="bg-gray-50/50 dark:bg-white/5 p-10 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800 text-center">
                        <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No assignments posted for this course yet.</p>
                    </div>
                ) : (
                    assignments.map((assignment) => {
                        const latestSubmission = assignment.submissions[0];
                        const isDeadlinePassed = assignment.deadline && new Date() > new Date(assignment.deadline);

                        return (
                            <div
                                key={assignment.id}
                                className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:border-emerald-500/20 transition-all"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${latestSubmission?.status === 'GRADED' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                    }`}>
                                    <FileText size={24} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Assignment Task</h3>
                                        {latestSubmission && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${latestSubmission.status === 'GRADED' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                                                }`}>
                                                {latestSubmission.status}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{assignment.instructions}</p>

                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <Clock size={12} className={isDeadlinePassed ? "text-red-500" : "text-emerald-500"} />
                                            Due: {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : "No Deadline"}
                                        </div>
                                        {latestSubmission?.grade && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                                <CheckCircle size={12} />
                                                Score: {latestSubmission.grade} / {assignment.maxPoints}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedAssignment(assignment)}
                                        disabled={Boolean(isDeadlinePassed) && !latestSubmission}
                                        className="px-6 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all transform active:scale-95"
                                    >
                                        {latestSubmission ? "Update / View" : "Submit Now"}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* SUBMISSION MODAL */}
            <AnimatePresence>
                {selectedAssignment && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAssignment(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-50 dark:border-gray-800/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-outfit">Assignment Details</h3>
                                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Submit your work</p>
                                </div>
                                <button onClick={() => setSelectedAssignment(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Instructions</h4>
                                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {selectedAssignment.instructions}
                                    </div>
                                </div>

                                {selectedAssignment.submissions[0] && (
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Submission</h4>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500 text-white rounded-lg">
                                                    <FileCheck size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">{selectedAssignment.submissions[0].originalName}</p>
                                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-600">Submitted on {new Date(selectedAssignment.submissions[0].submittedAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL}${selectedAssignment.submissions[0].fileUrl}`}
                                                target="_blank"
                                                className="p-2 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                                            >
                                                <Download size={18} />
                                            </a>
                                        </div>
                                        {selectedAssignment.submissions[0].feedback && (
                                            <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                                <p className="text-xs font-bold text-blue-900 dark:text-blue-400 uppercase mb-2">Instructor Feedback</p>
                                                <p className="text-sm text-blue-800 dark:text-blue-300 italic">"{selectedAssignment.submissions[0].feedback}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upload Submission</h4>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="file-upload"
                                            accept={selectedAssignment.allowedFileTypes.map(t => `.${t}`).join(",")}
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-emerald-50/5 cursor-pointer transition-all group"
                                        >
                                            {file ? (
                                                <div className="flex items-center gap-3">
                                                    <FileText size={32} className="text-emerald-500" />
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{file.name}</p>
                                                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                    <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">
                                                        <Upload size={32} />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Click to upload or drag & drop</p>
                                                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                                                        Allowed: {selectedAssignment.allowedFileTypes.join(", ")} (Max 10MB)
                                                    </p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-gray-50 dark:border-gray-800/50">
                                <button
                                    disabled={!file || uploading}
                                    onClick={handleFileUpload}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Uploading Submission...
                                        </>
                                    ) : (
                                        <>
                                            <FileCheck size={18} />
                                            {selectedAssignment.submissions[0] ? "Resubmit Assignment" : "Confirm Submission"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
