"use client";

import { useState, useEffect } from "react";
import { 
  Heart, 
  MessageSquare, 
  Users, 
  Share2,
  X,
  Send,
  Loader2,
  Gift,
  Star,
  Award,
  Zap,
  Layout,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import LivePoll from "@/components/LivePoll";

interface HeartAnimation {
  id: number;
  x: number;
}

export default function StudentLiveSession() {
  const { id } = useParams();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewerCount, setViewerCount] = useState(128);
  const [message, setMessage] = useState("");
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "polls">("chat");
  const [hearts, setHearts] = useState<HeartAnimation[]>([]);
  const [messages, setMessages] = useState([
    { id: 1, user: "System", text: "Welcome to the live session! Please be respectful.", isSystem: true },
    { id: 2, user: "Abebe", text: "Is this lesson about Calculus?", time: "10:25 AM" },
    { id: 3, user: "Instructor", text: "Yes Abebe, we are starting in a few minutes.", isInstructor: true }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), user: "You", text: message, time: "Just now" }]);
    setMessage("");
  };

  const addHeart = () => {
    const newHeart = { id: Date.now(), x: Math.random() * 80 - 40 };
    setHearts(prev => [...prev.slice(-20), newHeart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row h-screen overflow-hidden font-outfit">
      
      {/* FLOATING HEARTS CONTAINER */}
      <div className="absolute bottom-32 right-8 w-20 h-80 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {hearts.map(heart => (
            <motion.div
              key={heart.id}
              initial={{ y: 0, opacity: 1, scale: 0.5, x: heart.x }}
              animate={{ y: -400, opacity: 0, scale: 1.5, rotate: heart.x * 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute bottom-0 text-red-500"
            >
              <Heart fill="currentColor" size={24} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MAIN VIDEO AREA */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        
        {/* VIDEO PLACEHOLDER / STREAM */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-10 pointer-events-none"></div>
        
        {/* INTERACTIVE OVERLAY */}
        <div className="z-20 absolute top-8 left-8 flex items-center gap-4">
           <div className="flex items-center gap-2 bg-[#111]/60 backdrop-blur-xl border border-white/10 p-1 pr-4 rounded-full shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white/20 flex items-center justify-center font-bold text-sm">
                 I
              </div>
              <div>
                 <p className="text-xs font-bold leading-tight">Expert Instructor</p>
                 <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Live Now</span>
                 </div>
              </div>
              <button 
                 onClick={() => {
                    setIsFollowing(!isFollowing);
                    if(!isFollowing) toast.success("You are now following this instructor!");
                 }}
                 className={`ml-3 px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${isFollowing ? 'bg-white/10 text-white' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'}`}
              >
                 {isFollowing ? 'Following' : 'Follow'}
              </button>
           </div>
           
           <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-bold flex items-center gap-2 border border-white/5">
              <Users size={12} className="text-blue-400" /> {viewerCount} Viewing
           </div>
        </div>

        <div className="z-20 absolute top-8 right-8 flex items-center gap-3">
           <button 
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 active:scale-90 flex items-center justify-center group"
           >
              <Layout size={20} className={isTheaterMode ? "text-emerald-500" : "text-white group-hover:text-emerald-500 transition-colors"} />
           </button>
           
           <button 
              onClick={() => router.push("/dashboard/student")}
              className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-all border border-red-500/20 active:scale-90"
           >
              <X size={20} />
           </button>
        </div>

        {/* LOADING ANIMATION */}
        <div className="text-center z-0 relative">
           <div className="absolute inset-0 blur-3xl bg-emerald-500/20 rounded-full animate-pulse scale-150"></div>
           <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10 backdrop-blur-3xl relative">
              <Loader2 size={32} className="text-emerald-500 animate-spin" />
           </div>
           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] relative">Optimizing Stream Quality...</p>
        </div>

        {/* BOTTOM INFO */}
        <div className="absolute bottom-12 left-10 z-20 max-w-md">
           <h2 className="text-2xl font-bold font-outfit mb-3">Mastering Complex Derivatives</h2>
           <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400">#Calculus</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400">#STEM</span>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-500">Free Preview</span>
           </div>
        </div>
      </div>

      {/* INTERACTIVE CHAT PANEL */}
      <AnimatePresence>
        {!isTheaterMode && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full md:w-[450px] bg-[#0a0a0a] border-l border-white/5 flex flex-col h-full z-30 shadow-2xl origin-right absolute md:relative right-0"
          >
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

            <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
               {activeTab === "chat" ? (
                  messages.map((msg) => (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       key={msg.id} 
                       className="group"
                    >
                       <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.isInstructor ? 'text-emerald-500' : msg.isSystem ? 'text-blue-500' : 'text-gray-500'}`}>
                             {msg.user}
                          </span>
                          {msg.time && <span className="text-[8px] text-gray-700 font-bold">{msg.time}</span>}
                       </div>
                       <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                           msg.isInstructor ? 'bg-emerald-500/10 text-emerald-100 border border-emerald-500/20' : 
                           msg.isSystem ? 'bg-blue-500/5 text-blue-200 border border-blue-500/10 italic' :
                           'bg-white/[0.03] text-gray-300'
                       }`}>
                          {msg.text}
                       </div>
                    </motion.div>
                  ))
               ) : (
                  <LivePoll sessionId={id as string} />
               )}
            </div>

            {/* INPUT & REACTION AREA (Only show for Chat) */}
            {activeTab === "chat" && (
               <div className="p-6 bg-black flex flex-col gap-6 mt-auto">
           <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                 <form onSubmit={handleSendMessage}>
                    <input 
                       type="text" 
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       placeholder="Join the conversation..." 
                       className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] py-4 pl-6 pr-14 text-sm outline-none focus:border-emerald-500/50 transition-all font-outfit"
                    />
                    <button 
                       type="submit"
                       className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                       <Send size={20} />
                    </button>
                 </form>
              </div>
              <button 
                 onClick={addHeart}
                 className="w-14 h-14 bg-red-600/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-90"
              >
                 <Heart size={24} fill={hearts.length > 0 ? "currentColor" : "none"} />
              </button>
           </div>
           
           <div className="grid grid-cols-4 gap-3 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
              {[
                { icon: Star, color: "text-amber-500", label: "Star" },
                { icon: Award, color: "text-purple-500", label: "Prize" },
                { icon: Zap, color: "text-blue-500", label: "Boost" },
                { icon: Share2, color: "text-emerald-500", label: "Share" }
              ].map((item, i) => (
                <button key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/5 transition-all group">
                   <item.icon size={18} className={`${item.color} group-hover:scale-110 transition-transform`} />
                   <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
           </div>
        </div>
         )}
         </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
