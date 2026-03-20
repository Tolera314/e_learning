"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, BookOpen, Layers, CheckCircle } from "lucide-react";
import api from "@/lib/api";

interface Course {
    id: string;
    title: string;
    modules: { id: string; title: string }[];
}

interface ScheduleSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ScheduleSessionModal({ isOpen, onClose, onSuccess }: ScheduleSessionModalProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        courseId: "",
        moduleId: "",
        startTime: "",
        duration: "60",
    });

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get("/instructor/courses");
            setCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/instructor/live-sessions", {
                ...formData,
                durationSeconds: parseInt(formData.duration) * 60,
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSuccess();
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Failed to schedule session:", error);
            alert("Error scheduling session. Please check your inputs.");
        } finally {
            setSubmitting(false);
        }
    };

    const selectedCourse = courses.find((c) => c.id === formData.courseId);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-xl bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
                    >
                        {success ? (
                            <div className="p-12 text-center flex flex-col items-center gap-6">
                                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center">
                                    <CheckCircle size={40} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session Scheduled!</h2>
                                    <p className="text-gray-500 mt-2">Your live class has been added to the calendar.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center p-8 border-b border-gray-50 dark:border-gray-800/50">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Live Session</h2>
                                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Instructor Control</p>
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Session Title</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g. Advanced Derivatives Q&A"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Course</label>
                                                <select
                                                    required
                                                    value={formData.courseId}
                                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value, moduleId: "" })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select Course</option>
                                                    {courses.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Module</label>
                                                <select
                                                    required
                                                    value={formData.moduleId}
                                                    onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                                                    disabled={!formData.courseId}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all appearance-none disabled:opacity-50"
                                                >
                                                    <option value="">Select Module</option>
                                                    {selectedCourse?.modules.map((m) => (
                                                        <option key={m.id} value={m.id}>{m.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Start Time</label>
                                                <input
                                                    required
                                                    type="datetime-local"
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Duration (mins)</label>
                                                <select
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                                                >
                                                    <option value="30">30 Minutes</option>
                                                    <option value="45">45 Minutes</option>
                                                    <option value="60">1 Hour</option>
                                                    <option value="90">1.5 Hours</option>
                                                    <option value="120">2 Hours</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        disabled={submitting}
                                        className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                                    >
                                        {submitting ? "Scheduling..." : "Create Live Session"}
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
