"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Video,
  Calendar,
  Clock,
  ChevronRight,
  PlayCircle,
  Search,
  Loader2,
  RefreshCw,
  Tv2,
  Bell,
  BellRing
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { toast } from "react-hot-toast";

interface LiveSession {
  id: string;
  title: string;
  course: string;
  instructor: string;
  startTime: string;
  endTime: string;
  isLive: boolean;
  streamUrl: string | null;
  isReminded?: boolean;
}

interface Recording {
  id: string;
  title: string;
  course: string;
  recordingUrl: string;
  date: string;
  duration: string;
}

function CountdownTimer({ startTime }: { startTime: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(startTime).getTime() - Date.now();
      if (diff <= 0) { setLabel("Starting now"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [startTime]);

  return <span className="tabular-nums font-black text-emerald-600">{label}</span>;
}

export default function StudentLiveClasses() {
  const [search, setSearch] = useState("");
  const [upcoming, setUpcoming] = useState<LiveSession[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [upRes, recRes] = await Promise.all([
        api.get("/student/live-classes/upcoming"),
        api.get("/student/live-classes/recordings"),
      ]);
      setUpcoming(upRes.data);
      setRecordings(recRes.data);
    } catch (err: any) {
      console.error("Failed to load live classes:", err);
      console.error("AxiosError Details:", {
        url: err.config?.url,
        baseURL: err.config?.baseURL,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleReminder = async (sessionId: string) => {
    try {
      const res = await api.post(`/student/live-classes/${sessionId}/reminder`);
      const isReminded = res.data.reminded;
      setUpcoming(prev => prev.map(s => s.id === sessionId ? { ...s, isReminded } : s));
      toast.success(isReminded ? "Reminder set!" : "Reminder removed");
    } catch (err) {
      toast.error("Failed to toggle reminder");
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredUpcoming = upcoming.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase())
  );
  const filteredRecordings = recordings.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Live Learning Board
          </h1>
          <p className="text-gray-500 mt-2">
            Join live interactive sessions and watch past class recordings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-emerald-600 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search sessions..."
              className="pl-12 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm w-full md:w-64"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={36} className="text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* UPCOMING / LIVE SESSIONS */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Scheduled Sessions
            </h2>

            {filteredUpcoming.length === 0 ? (
              <div className="p-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem]">
                <Tv2 size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                <p className="text-gray-400 font-bold text-sm">
                  No upcoming live sessions for your enrolled courses.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Check back later or enroll in more courses.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredUpcoming.map((session) => {
                  const isLiveNow = session.isLive;
                  const startsSoon =
                    !isLiveNow &&
                    new Date(session.startTime).getTime() - Date.now() < 30 * 60 * 1000;

                  return (
                    <motion.div
                      key={session.id}
                      whileHover={{ y: -4 }}
                      className={`p-8 rounded-[2.5rem] border relative overflow-hidden group ${
                        isLiveNow
                          ? "bg-emerald-600 border-none text-white shadow-2xl shadow-emerald-600/30"
                          : "bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800 shadow-sm"
                      }`}
                    >
                      <div className="relative z-10 flex flex-col h-full gap-4">
                        {/* Badge */}
                        <div className="flex items-center gap-2">
                          {isLiveNow ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                              </span>
                              Live Now
                            </span>
                          ) : startsSoon ? (
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 dark:bg-amber-900/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                              Starting Soon
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                              Upcoming
                            </span>
                          )}
                          
                          {!isLiveNow && (
                            <button 
                              onClick={() => handleToggleReminder(session.id)}
                              className={`ml-auto p-2 rounded-xl transition-all ${session.isReminded ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-400 hover:text-emerald-600'}`}
                            >
                              {session.isReminded ? <BellRing size={16} /> : <Bell size={16} />}
                            </button>
                          )}
                        </div>

                        {/* Title & Instructor */}
                        <div>
                          <h3
                            className={`text-lg font-bold leading-snug ${
                              isLiveNow ? "text-white" : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {session.title}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${
                              isLiveNow ? "text-emerald-100" : "text-gray-500"
                            }`}
                          >
                            {session.course} · {session.instructor}
                          </p>
                        </div>

                        {/* Time info */}
                        <div className="flex items-center gap-4 mt-auto">
                          <div
                            className={`flex items-center gap-1.5 text-xs font-bold ${
                              isLiveNow ? "text-white/80" : "text-gray-500"
                            }`}
                          >
                            <Calendar size={13} />
                            {format(new Date(session.startTime), "MMM d")}
                          </div>
                          <div
                            className={`flex items-center gap-1.5 text-xs font-bold ${
                              isLiveNow ? "text-white/80" : "text-gray-500"
                            }`}
                          >
                            <Clock size={13} />
                            {format(new Date(session.startTime), "h:mm a")}
                          </div>
                          {!isLiveNow && (
                            <div className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                              in <CountdownTimer startTime={session.startTime} />
                            </div>
                          )}
                        </div>

                        {/* Join Button */}
                        {isLiveNow && session.streamUrl && (
                          <a
                            href={session.streamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 px-6 py-3 bg-white text-emerald-700 rounded-2xl font-bold text-sm text-center hover:bg-emerald-50 shadow-lg transition-all"
                          >
                            Join Now →
                          </a>
                        )}
                        {!isLiveNow && (
                          <div className="mt-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl font-bold text-sm text-center cursor-not-allowed select-none">
                            Starts {format(new Date(session.startTime), "h:mm a")}
                          </div>
                        )}
                      </div>

                      {isLiveNow && (
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* PAST RECORDINGS */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Past Recordings
              </h2>
            </div>

            {filteredRecordings.length === 0 ? (
              <div className="p-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem]">
                <Video size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                <p className="text-gray-400 font-bold text-sm">
                  No recorded sessions available yet.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-50 dark:border-gray-800">
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">
                          Class Information
                        </th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400 hidden md:table-cell">
                          Date
                        </th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400 hidden md:table-cell">
                          Duration
                        </th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">
                          Watch
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {filteredRecordings.map((recording) => (
                        <tr
                          key={recording.id}
                          className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                                <PlayCircle size={22} className="text-emerald-500" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">
                                  {recording.title}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">
                                  {recording.course}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-gray-500 hidden md:table-cell">
                            {format(new Date(recording.date), "MMM d, yyyy")}
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-gray-500 hidden md:table-cell">
                            {recording.duration}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <a
                              href={recording.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-xl transition-all"
                            >
                              <ChevronRight size={20} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
