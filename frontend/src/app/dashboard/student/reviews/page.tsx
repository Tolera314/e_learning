"use client";

import { Star, MessageSquare, Edit, Trash2, BookOpen, Plus, Lock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SlidePanel from "@/components/SlidePanel";
import api from "@/lib/api";

const THRESHOLD = 50;

interface Course { id: string; title: string; progress: number; isCompleted: boolean; }
interface Review { id: string; courseId: string; course: string; rating: number; comment: string; date: string; }

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map(s => (
      <button key={s} onClick={() => onChange(s)} type="button">
        <Star size={28} className={`transition-colors ${s <= value ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700 hover:text-amber-300"}`} />
      </button>
    ))}
  </div>
);

export default function StudentReviews() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Review | null>(null);
  const [targetCourse, setTargetCourse] = useState<Course | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/student/courses"),
      api.get("/student/reviews"),
    ]).then(([coursesRes, reviewsRes]) => {
      setCourses(coursesRes.data);
      setReviews(reviewsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const openWrite = (course: Course) => {
    setTargetCourse(course);
    setEditing(null);
    setForm({ rating: 5, comment: "" });
    setIsPanelOpen(true);
  };

  const openEdit = (review: Review) => {
    setEditing(review);
    setTargetCourse({ id: review.courseId, title: review.course, progress: 100, isCompleted: false });
    setForm({ rating: review.rating, comment: review.comment });
    setIsPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.comment.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post("/student/reviews", {
        courseId: targetCourse?.id,
        rating: form.rating,
        comment: form.comment,
      });
      if (editing) {
        setReviews(reviews.map(r => r.id === editing.id ? { ...r, ...form } : r));
      } else {
        setReviews([{ ...data, course: targetCourse?.title ?? "", date: new Date().toISOString() }, ...reviews]);
      }
      setIsPanelOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save review.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => setReviews(reviews.filter(r => r.id !== id));

  const reviewedIds = new Set(reviews.map(r => r.courseId));

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Reviews</h1>
        <p className="text-gray-500 mt-2">Rate and review the courses you've been learning from.</p>
      </header>

      {/* AVAILABLE TO REVIEW */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Available to Review</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({length:4}).map((_,i)=><div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl"/>)}
          </div>
        ) : courses.length === 0 ? (
          <p className="text-gray-400 font-medium">Enroll in courses to start reviewing them here.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map(course => {
              const canReview = course.progress >= THRESHOLD;
              const alreadyReviewed = reviewedIds.has(course.id);
              return (
                <div key={course.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${canReview ? "bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800 hover:border-emerald-300" : "bg-gray-50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800 opacity-70"}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${canReview ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                      {canReview ? <BookOpen size={18} /> : <Lock size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{course.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-1 w-20 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${course.progress}%` }} />
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold">{course.progress}%</span>
                      </div>
                    </div>
                  </div>
                  {!canReview ? (
                    <span className="text-[9px] text-gray-400 font-bold shrink-0 ml-2">50% required</span>
                  ) : alreadyReviewed ? (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg shrink-0">Reviewed ✓</span>
                  ) : (
                    <button onClick={() => openWrite(course)} className="shrink-0 ml-2 flex items-center gap-1 px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-colors">
                      <Plus size={12} /> Review
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MY REVIEWS */}
      {reviews.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">My Submitted Reviews</h2>
          <div className="space-y-5">
            {reviews.map(review => (
              <motion.div key={review.id} whileHover={{ y: -2 }} className="bg-white dark:bg-[#111] p-7 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600"><BookOpen size={18} /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{review.course}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"} />)}
                  </div>
                </div>
                <div className="p-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl mb-4">
                  <MessageSquare size={16} className="text-emerald-400 mb-2 opacity-50" />
                  <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed text-sm">"{review.comment}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => openEdit(review)} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors"><Edit size={14} /> Edit</button>
                  <button onClick={() => handleDelete(review.id)} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={14} /> Delete</button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {!loading && reviews.length === 0 && courses.length > 0 && (
        <div className="p-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
          <Star size={40} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold">No reviews yet. Complete 50% of a course to write your first review!</p>
        </div>
      )}

      {/* SLIDE PANEL */}
      <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={editing ? "Edit Your Review" : "Write a Review"} subtitle={targetCourse?.title}>
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Your Rating *</label>
            <StarPicker value={form.rating} onChange={n => setForm({ ...form, rating: n })} />
            <p className="text-xs text-gray-400 mt-3 font-medium">{["","Poor","Fair","Good","Great","Excellent!"][form.rating]}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Your Review *</label>
            <textarea rows={6} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Share what you loved or what could be improved..." className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white resize-none" />
          </div>
          <button onClick={handleSave} disabled={saving || !form.comment.trim()} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : editing ? "Update Review" : "Publish Review"}
          </button>
        </div>
      </SlidePanel>
    </div>
  );
}
