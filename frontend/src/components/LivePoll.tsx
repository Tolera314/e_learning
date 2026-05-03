"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, CheckCircle2, Clock, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { socketService } from "@/lib/socket";

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  id: string;
  question: string;
  isOpen: boolean;
  totalVotes: number;
  options: PollOption[];
  userHasVoted?: boolean;
  userOptionId?: string;
}

export default function LivePoll({ sessionId }: { sessionId: string }) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPolls();

    const socket = socketService.getSocket();
    if (socket) {
      socket.on("poll:new", (newPoll: Poll) => {
        setPolls((prev) => [newPoll, ...prev]);
      });

      socket.on("poll:results", (results: { pollId: string; totalVotes: number; options: any[] }) => {
        setPolls((prev) =>
          prev.map((poll) =>
            poll.id === results.pollId
              ? { ...poll, totalVotes: results.totalVotes, options: results.options }
              : poll
          )
        );
      });

      socket.on("poll:closed", ({ pollId }: { pollId: string }) => {
        setPolls((prev) =>
          prev.map((poll) =>
            poll.id === pollId ? { ...poll, isOpen: false } : poll
          )
        );
      });

      return () => {
        socket.off("poll:new");
        socket.off("poll:results");
        socket.off("poll:closed");
      };
    }
  }, [sessionId]);

  const fetchPolls = async () => {
    try {
      const { data } = await api.get(`/polls/session/${sessionId}`);
      setPolls(data);
    } catch (err) {
      console.error("Failed to fetch polls", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (votingId) return;
    setVotingId(optionId);
    try {
      await api.post(`/polls/${pollId}/vote`, { optionId });
      setPolls((prev) =>
        prev.map((poll) =>
          poll.id === pollId ? { ...poll, userHasVoted: true, userOptionId: optionId } : poll
        )
      );
    } catch (err) {
      console.error("Failed to vote", err);
    } finally {
      setVotingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
        <BarChart2 className="mx-auto text-gray-600 mb-3" size={32} />
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No active polls</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {polls.map((poll) => (
          <motion.div
            key={poll.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-6 rounded-[2rem] border transition-all ${
              poll.isOpen
                ? "bg-white dark:bg-[#111] border-gray-100 dark:border-white/10 shadow-lg"
                : "bg-gray-50 dark:bg-white/[0.02] border-transparent opacity-80"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full ${
                  poll.isOpen
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-gray-500/10 text-gray-500"
                }`}
              >
                {poll.isOpen ? "Live Poll" : "Poll Results"}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                <Clock size={10} />
                {poll.totalVotes} votes
              </div>
            </div>

            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
              {poll.question}
            </h4>

            <div className="space-y-3">
              {poll.options.map((opt) => {
                const isSelected = poll.userOptionId === opt.id;
                const showResults = poll.userHasVoted || !poll.isOpen;

                return (
                  <button
                    key={opt.id}
                    disabled={!poll.isOpen || poll.userHasVoted}
                    onClick={() => handleVote(poll.id, opt.id)}
                    className="w-full relative group"
                  >
                    <div
                      className={`relative z-10 w-full p-4 rounded-2xl border transition-all flex items-center justify-between overflow-hidden ${
                        isSelected
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-transparent bg-gray-50 dark:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      {/* Progress Bar (Behind) */}
                      {showResults && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${opt.percentage}%` }}
                          className={`absolute inset-0 z-0 transition-colors ${
                            isSelected ? "bg-emerald-500/10" : "bg-white/5"
                          }`}
                        />
                      )}

                      <div className="relative z-20 flex items-center gap-3">
                        {isSelected && (
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        )}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {opt.text}
                        </span>
                      </div>

                      {showResults && (
                        <span className="relative z-20 text-[10px] font-black text-gray-500">
                          {opt.percentage}%
                        </span>
                      )}

                      {votingId === opt.id && (
                        <Loader2 className="animate-spin text-emerald-500 absolute right-4" size={16} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {!poll.userHasVoted && poll.isOpen && (
              <p className="mt-4 text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest italic">
                Select an option to cast your vote
              </p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
