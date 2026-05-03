"use client";

import { useState, useEffect } from "react";
import { Star, Search, Filter, MessageSquare, ChevronRight, ThumbsUp } from "lucide-react";
import SlidePanel from "@/components/SlidePanel";
import api from "@/lib/api";



const StarRating = ({ value }: { value: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={14} className={s <= value ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"} />
    ))}
  </div>
);

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/instructor/reviews");
      setReviews(data);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReply = (review: any) => {
    setReplyingTo(review);
    setReplyText(review.reply || "");
  };

  const handleSaveReply = async () => {
    if (!replyText.trim()) return;
    try {
      await api.post(`/instructor/reviews/${replyingTo.id}/reply`, { reply: replyText });
      setReviews(reviews.map(r => r.id === replyingTo.id ? { ...r, reply: replyText } : r));
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to save reply", err);
      alert("Error saving reply. Please try again.");
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "5.0";

  return (
    <div className="max-w-5xl mx-auto">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Reviews</h1>
          <p className="text-gray-500 mt-2">Manage and respond to student feedback across your courses.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-center">
            <p className="text-3xl font-black text-amber-500">{avgRating}</p>
            <StarRating value={Math.round(Number(avgRating))} />
            <p className="text-[10px] text-gray-400 font-medium mt-1">{reviews.length} reviews</p>
          </div>
        </div>
      </header>

      {/* SEARCH */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search reviews..." className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white" />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-colors">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* REVIEW CARDS */}
      <div className="space-y-5">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center font-bold text-emerald-600 overflow-hidden">
                  {review.student?.avatar ? <img src={review.student.avatar} alt="" className="w-full h-full object-cover" /> : (review.student?.name?.[0] || "?")}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{review.student?.name || "Anonymous"}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{review.course?.title} · {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <StarRating value={review.rating} />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{review.comment}</p>

            {review.reply ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 mb-4">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Your Reply</p>
                <p className="text-sm text-emerald-800 dark:text-emerald-300">{review.reply}</p>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenReply(review)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
              >
                <MessageSquare size={14} /> {review.reply ? "Edit Reply" : "Reply"}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors">
                <ThumbsUp size={14} /> Helpful
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* REPLY SLIDE PANEL */}
      <SlidePanel isOpen={!!replyingTo} onClose={() => setReplyingTo(null)} title="Reply to Review" subtitle={`Responding to ${replyingTo?.student}`}>
        {replyingTo && (
          <div className="space-y-6">
            <div className="p-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 italic">
              <StarRating value={replyingTo.rating} />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">"{replyingTo.comment}"</p>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">— {replyingTo.student?.name}, {replyingTo.course?.title}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Your Response</label>
              <textarea
                rows={6}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a professional and helpful response..."
                className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-2">You can only reply once. Be professional and grateful.</p>
            </div>

            <button onClick={handleSaveReply} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors">
              Publish Reply
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
