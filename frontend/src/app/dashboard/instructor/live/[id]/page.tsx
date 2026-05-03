"use client";

import { useState, useEffect } from "react";
import { 
  Video, 
  Mic, 
  MessageSquare, 
  Users, 
  StopCircle,
  Loader2,
  Share2,
  Settings,
  Monitor,
  Layout,
  Volume2,
  Layers,
  ChevronRight,
  Send,
  UserPlus,
  BarChart2,
  PieChart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import PollCreator from "@/components/PollCreator";

const AudioVisualizer = () => (
  <div className="flex items-center gap-1 h-8">
     {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <motion.div 
           key={i}
           animate={{ height: ["20%", "70%", "30%", "100%", "50%"] }}
           transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
           className="w-1 bg-emerald-500 rounded-full"
        />
     ))}
  </div>
);

export default function InstructorLiveSession() {
  const { id } = useParams();
  const router = useRouter();
  const [isEnding, setIsEnding] = useState(false);
  const [viewerCount, setViewerCount] = useState(42);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "polls">("chat");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { id: 1, user: "Abebe", text: "Excited for this session!", time: "10:25 AM" },
    { id: 2, user: "Almaz", text: "Can we see the last chapter again?", time: "10:26 AM" }
  ]);

  const handleEndLive = async () => {
    if (!confirm("Are you sure you want to end this live session?")) return;
    try {
      setIsEnding(true);
      await api.post(`/instructor/end-live/${id}`);
      toast.success("Live session ended successfully.");
      router.push("/dashboard/instructor");
    } catch (error) {
      toast.error("Failed to end live session.");
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col h-screen overflow-hidden font-outfit">
      
      {/* PROFESSIONAL NAVBAR */}
      <nav className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl z-50 shrink-0">
         <div className="flex items-center gap-6">
            <div className="bg-red-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-red-500/20 flex items-center gap-2 border border-red-400/30">
               <span className="w-2 h-2 bg-white rounded-full animate-ping"></span> Live Broadcast
            </div>
            <div>
               <h1 className="text-xl font-bold tracking-tight">Direct Teaching Mode</h1>
               <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Stream Key:</span>
                  <span className="text-[10px] text-emerald-500 font-mono tracking-tighter opacity-60">EDA-90-PRO-STREAM</span>
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 text-gray-400">
               <Users size={18} className="text-blue-400" />
               <span className="font-bold text-sm tracking-tight">{viewerCount} Active</span>
            </div>
            
            <button 
               onClick={handleEndLive}
               className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-red-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
               {isEnding ? <Loader2 size={18} className="animate-spin" /> : <StopCircle size={18} />}
               Stop Broadcast
            </button>
         </div>
      </nav>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
         
         {/* MAIN VIEWPORT */}
         <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="flex-1 relative bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden group">
               {/* VIDEO FEED PLACEHOLDER */}
               <div className="absolute inset-0 flex items-center justify-center">
                  {!camOn ? (
                    <div className="text-center">
                       <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                          <Video size={48} className="text-gray-700" />
                       </div>
                       <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Camera Offline</p>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/20 via-gray-900 to-blue-900/20 flex items-center justify-center">
                        <div className="relative">
                           <div className="absolute inset-0 blur-3xl bg-emerald-500/10 rounded-full animate-pulse"></div>
                           <Loader2 size={40} className="text-emerald-500/50 animate-spin relative" />
                        </div>
                    </div>
                  )}
               </div>

               {/* STREAM OVERLAYS */}
               <div className="absolute top-8 left-8 flex flex-col gap-3 pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
                     <Volume2 size={16} className="text-emerald-500" />
                     <AudioVisualizer />
                  </div>
               </div>

               {/* EXPERT TOOLBAR */}
               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <div className="flex gap-2 pr-3 border-r border-white/10">
                     <button 
                        onClick={() => setMicOn(!micOn)}
                        className={`p-4 rounded-2xl transition-all ${micOn ? 'bg-emerald-600 text-white' : 'bg-red-600/20 text-red-500'}`}
                     >
                        <Mic size={22} />
                     </button>
                     <button 
                        onClick={() => setCamOn(!camOn)}
                        className={`p-4 rounded-2xl transition-all ${camOn ? 'bg-emerald-600 text-white' : 'bg-red-600/20 text-red-500'}`}
                     >
                        <Video size={22} />
                     </button>
                  </div>
                  
                  <div className="flex gap-2 px-3 border-r border-white/10">
                     <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-300">
                        <Monitor size={22} />
                     </button>
                     <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-300">
                        <Layout size={22} />
                     </button>
                  </div>

                  <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-300">
                     <Settings size={22} />
                  </button>
               </div>
            </div>

            {/* QUICK STATS & TIPS */}
            <div className="h-32 grid grid-cols-3 gap-6 shrink-0">
               {[
                 { label: "Connection Strength", val: "Excellent", col: "text-emerald-500" },
                 { label: "Stream Quality", val: "1080p / 60fps", col: "text-blue-500" },
                 { label: "Bitrate", val: "6.5 Mbps", col: "text-purple-500" }
               ].map((s, i) => (
                 <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
                    <p className={`text-lg font-bold mt-1 ${s.col}`}>{s.val}</p>
                 </div>
               ))}
            </div>
         </div>

         {/* SIDEBAR: INTERACTION */}
         <div className="w-[450px] flex flex-col gap-6 shrink-0 h-full overflow-hidden">
            
            {/* CHAT PANEL */}
             <div className="flex-1 bg-[#111] rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-white/5 flex items-center bg-black/20">
                   <div className="flex w-full bg-white/5 p-1 rounded-xl">
                      <button 
                         onClick={() => setActiveTab("chat")}
                         className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === "chat" ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                         <MessageSquare size={14} />
                         Chat
                      </button>
                      <button 
                         onClick={() => setActiveTab("polls")}
                         className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === "polls" ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                         <BarChart2 size={14} />
                         Polls
                      </button>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                   {activeTab === "chat" ? (
                      messages.map((m) => (
                        <motion.div 
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           key={m.id} 
                           className="group"
                        >
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-gray-400 capitalize">{m.user}</span>
                              <span className="text-[9px] font-bold text-gray-600">{m.time}</span>
                           </div>
                           <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                 {m.user[0]}
                              </div>
                              <div className="flex-1 bg-white/[0.03] p-4 rounded-2xl rounded-tl-none border border-white/5 group-hover:border-emerald-500/20 transition-all">
                                 <p className="text-sm text-gray-300 leading-relaxed font-outfit">{m.text}</p>
                              </div>
                           </div>
                        </motion.div>
                      ))
                   ) : (
                      <PollCreator sessionId={id as string} />
                   )}
                </div>

                {/* CHAT INPUT (Only for Chat Tab) */}
                {activeTab === "chat" && (
                   <div className="p-6 bg-[#0a0a0a] border-t border-white/5">
                  <div className="relative">
                     <input 
                        type="text" 
                        placeholder="Type here to speak to class..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-6 pr-14 text-sm outline-none focus:border-emerald-500/50 transition-all"
                     />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                         <Send size={18} />
                      </button>
                   </div>
                </div>
                )}
             </div>

            {/* PARTICIPANTS & ACTIONS */}
            <div className="h-64 bg-[#111] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl overflow-hidden">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-sm tracking-tight">Active Participants</h3>
                  <button className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:underline">Manage All</button>
               </div>
               <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center relative group cursor-pointer hover:border-emerald-500 transition-all">
                       <span className="font-bold text-xs text-gray-500">U{i}</span>
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111]"></div>
                    </div>
                  ))}
                  <button className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                     <UserPlus size={18} />
                  </button>
               </div>
               
               <div className="mt-8">
                  <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center gap-2">
                     <Layers size={14} className="text-blue-500" />
                     Share Streaming Link
                  </button>
               </div>
            </div>

         </div>

      </div>
      
    </div>
  );
}
