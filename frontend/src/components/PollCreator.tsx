"use client";

import React, { useState } from "react";
import { Plus, X, Send, Loader2, BarChart2, Trash2, Power } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface PollCreatorProps {
  sessionId: string;
  onPollCreated?: (poll: any) => void;
}

export default function PollCreator({ sessionId, onPollCreated }: PollCreatorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [activePoll, setActivePoll] = useState<any>(null);

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleLaunch = async () => {
    if (!question.trim()) return toast.error("Please enter a question");
    if (options.some(opt => !opt.trim())) return toast.error("All options must be filled");

    setIsLaunching(true);
    try {
      const { data } = await api.post("/polls", {
        liveSessionId: sessionId,
        question,
        options: options.filter(o => o.trim())
      });
      setActivePoll(data);
      toast.success("Poll launched successfully!");
      setQuestion("");
      setOptions(["", ""]);
      if (onPollCreated) onPollCreated(data);
    } catch (err) {
      toast.error("Failed to launch poll");
    } finally {
      setIsLaunching(false);
    }
  };

  const closePoll = async () => {
    if (!activePoll) return;
    try {
      await api.patch(`/polls/${activePoll.id}/close`);
      setActivePoll(null);
      toast.success("Poll closed. Results are now final.");
    } catch (err) {
      toast.error("Failed to close poll");
    }
  };

  return (
    <div className="space-y-6">
      {/* ACTIVE POLL CARD */}
      <AnimatePresence>
        {activePoll && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-emerald-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Poll is Live</span>
              </div>
              <button 
                onClick={closePoll}
                className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-red-500/20"
              >
                <Power size={12} /> Close Poll
              </button>
            </div>
            <p className="text-sm font-bold text-white mb-2">{activePoll.question}</p>
            <p className="text-[10px] opacity-60 font-medium">Taking live responses from students...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATOR FORM */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center">
            <BarChart2 size={22} />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white">Create Quick Poll</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Interaction Booster</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Do you understand the concept of higher-order functions?"
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-sm text-gray-200 outline-none focus:border-blue-500/50 transition-all resize-none h-24"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Options (Max 4)</label>
            <div className="grid gap-3">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-xs text-gray-300 outline-none focus:border-blue-500/50 transition-all"
                    />
                    {options.length > 2 && (
                      <button 
                        onClick={() => removeOption(i)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {options.length < 4 && (
                <button
                  onClick={addOption}
                  className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 flex items-center justify-center gap-2 hover:border-blue-500/30 hover:text-blue-400 transition-all text-xs font-bold"
                >
                  <Plus size={16} /> Add Option
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleLaunch}
            disabled={isLaunching || activePoll}
            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
              activePoll 
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {isLaunching ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Send size={18} /> Launch Poll
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
