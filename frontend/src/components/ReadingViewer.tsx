"use client";

import { useState } from "react";
import { 
  FileText, 
  Highlighter, 
  MessageSquare, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  User,
  Settings,
  MoreVertical,
  X,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReadingViewer() {
  const [activeTool, setActiveTool] = useState<"hand" | "highlight" | "comment">("hand");
  const [showDiscussion, setShowDiscussion] = useState(true);
  const [annotations, setAnnotations] = useState([
     { id: "a1", text: "Important: Limit definition of the derivative.", color: "bg-yellow-200/50" }
  ]);

  return (
    <div className="flex h-full bg-gray-100 dark:bg-black/40 rounded-[2.5rem] overflow-hidden border-8 border-white dark:border-white/5 shadow-2xl">
      {/* TOOLBAR */}
      <div className="w-16 bg-white dark:bg-[#111] border-r border-gray-100 dark:border-gray-800 flex flex-col items-center py-6 gap-6">
        <div className="flex flex-col gap-2">
           {[
             { id: "hand", icon: User }, // Pointer
             { id: "highlight", icon: Highlighter },
             { id: "comment", icon: MessageSquare }
           ].map(tool => (
             <button
               key={tool.id}
               onClick={() => setActiveTool(tool.id as any)}
               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                 activeTool === tool.id 
                 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                 : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
               }`}
             >
                <tool.icon size={20} />
             </button>
           ))}
        </div>
        <div className="mt-auto flex flex-col gap-4">
           <button className="text-gray-400 hover:text-emerald-600 transition-colors"><Download size={20} /></button>
           <button className="text-gray-400 hover:text-emerald-600 transition-colors"><Settings size={20} /></button>
        </div>
      </div>

      {/* DOCUMENT VIEWER */}
      <div className="flex-1 flex flex-col bg-white/50 dark:bg-transparent overflow-hidden">
        {/* VIEW CONTROLS */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#111]">
           <div className="flex items-center gap-3">
              <FileText className="text-emerald-500" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">Chapter 2.2 - Rules of Differentiation.pdf</span>
           </div>
           <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-emerald-600"><ChevronLeft size={18} /></button>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Page 1 of 12</span>
              <button className="p-2 text-gray-400 hover:text-emerald-600"><ChevronRight size={18} /></button>
           </div>
           <button 
             onClick={() => setShowDiscussion(!showDiscussion)}
             className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${showDiscussion ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
           >
              Discussion
           </button>
        </div>

        {/* PAGE RENDERER */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-gray-50 dark:bg-transparent">
           <div className="max-w-3xl mx-auto bg-white dark:bg-[#111] shadow-2xl rounded-2xl p-16 min-h-[1200px] relative">
              <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">2.2 Rules of Differentiation</h1>
              <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                 <p>In calculus, the rules of differentiation allow us to find the derivative of a function without using the limit definition every time. These rules are essential for efficient problem-solving in physics, engineering, and data science.</p>
                 
                 <div className="p-10 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-3xl border-2 border-emerald-500/20 my-10 relative">
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">The Power Rule</span>
                    <p className="text-xl font-bold text-gray-900 dark:text-white italic">"If f(x) = x^n, then f'(x) = nx^(n-1) for any real number n."</p>
                    {/* Mock Highlight */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-yellow-200/20 mix-blend-multiply dark:mix-blend-overlay pointer-events-none rounded-3xl"
                    />
                 </div>

                 <p>For example, if f(x) = x³, then applying the power rule gives f'(x) = 3x². This simple rule covers a vast range of polynomial functions.</p>
                 
                 <h2 className="text-xl font-black text-gray-900 dark:text-white mt-12 mb-4">The Constant Rule</h2>
                 <p>The derivative of any constant function is always zero. This makes physical sense because a constant value has a zero rate of change.</p>
              </div>

              {/* Float Comment Bubble */}
              <div className="absolute top-[40%] -right-4 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-all border-4 border-white dark:border-[#111]">
                 <MessageSquare size={16} />
              </div>
           </div>
        </div>
      </div>

      {/* DISCUSSION SIDEBAR */}
      <AnimatePresence>
        {showDiscussion && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 350 }}
            exit={{ width: 0 }}
            className="flex flex-col bg-white dark:bg-[#111] border-l border-gray-100 dark:border-gray-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
               <h3 className="font-bold text-gray-900 dark:text-white">Group Discussion</h3>
               <button onClick={() => setShowDiscussion(false)} className="text-gray-400 hover:text-gray-900"><X size={18} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
               {[
                 { user: "Abebe B.", text: "Can someone explain why the derivative of a constant is zero again?", time: "2m ago" },
                 { user: "Sarah K.", text: "Think of it as the slope of a flat horizontal line. The slope is 0!", time: "1m ago", isReply: true }
               ].map((c, i) => (
                 <div key={i} className={`flex gap-3 ${c.isReply ? 'ml-8' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                       {c.user.split(' ')[0][0]}
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-gray-900 dark:text-white">{c.user}</span>
                          <span className="text-[10px] text-gray-400">{c.time}</span>
                       </div>
                       <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl rounded-tl-none">
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">{c.text}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
               <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask a question..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 border-none"
                  />
                  <button className="absolute right-2 top-1.5 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
                     <Send size={14} />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
