"use client";

import { 
  Search, 
  HelpCircle, 
  PlayCircle, 
  FileText, 
  MessageCircle, 
  Mail, 
  Video,
  ExternalLink,
  ChevronRight
} from "lucide-react";

const HELP_CATEGORIES = [
  { title: "Getting Started", icon: <PlayCircle className="text-emerald-500" />, items: ["Creating your first course", "Instructor dashboard overview", "Payment setup guide"] },
  { title: "Course Creation", icon: <Video className="text-blue-500" />, items: ["Video upload requirements", "Structuring your curriculum", "Creating quizzes & assignments"] },
  { title: "Policies & Finance", icon: <FileText className="text-amber-500" />, items: ["Revenue share model", "Payout schedule", "Copyright guidelines"] },
];

export default function SupportCenter() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How can we help you today?</h1>
        <p className="text-gray-500 max-w-2xl mx-auto mb-10">Access our knowledge base, watch tutorials, or get in touch with our instructor success team.</p>
        
        <div className="max-w-2xl mx-auto relative px-4">
           <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <input 
             type="text" 
             placeholder="Search for articles, guides, or tutorials..." 
             className="w-full pl-14 pr-6 py-5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/20 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
           />
        </div>
      </header>

      {/* HELP CATEGORIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
         {HELP_CATEGORIES.map((cat, i) => (
            <div key={i} className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
               <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
                  {cat.icon}
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{cat.title}</h3>
               <ul className="space-y-4">
                  {cat.items.map((item, j) => (
                     <li key={j}>
                        <a href="#" className="flex items-center justify-between group text-sm text-gray-500 hover:text-emerald-600 transition-all font-medium">
                           {item}
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </a>
                     </li>
                  ))}
               </ul>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
         {/* VIDEO TUTORIALS */}
         <div className="bg-gray-900 dark:bg-emerald-950 p-10 rounded-3xl text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
               <Video className="text-emerald-400" /> Video Tutorials
            </h2>
            <p className="text-emerald-100/70 mb-8 border-l-2 border-emerald-500/30 pl-4">Watch our bite-sized videos to become an expert instructor on Ethio-Digital-Academy.</p>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-colors">
               Explore Video Library <ExternalLink size={16} />
            </button>
         </div>

         {/* CONTACT CARDS */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
               <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle size={24} />
               </div>
               <h4 className="font-bold text-gray-900 dark:text-white mb-2">Live Chat</h4>
               <p className="text-xs text-gray-500 mb-6 font-medium">Chat with our team directly from your dashboard.</p>
               <button className="w-full py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 transition-all">Start Chat</button>
            </div>
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
               <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Mail size={24} />
               </div>
               <h4 className="font-bold text-gray-900 dark:text-white mb-2">Email Support</h4>
               <p className="text-xs text-gray-500 mb-6 font-medium">Response time: Usually within 24 hours.</p>
               <button className="w-full py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-purple-50 hover:text-purple-600 transition-all">Send Email</button>
            </div>
         </div>
      </div>
      
      {/* FAQ CTA */}
      <div className="mt-16 text-center">
         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">More Resources</p>
         <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors border-b border-gray-100 dark:border-gray-800 pb-1">Privacy Policy</a>
            <a href="#" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors border-b border-gray-100 dark:border-gray-800 pb-1">Instructor Agreement</a>
            <a href="#" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors border-b border-gray-100 dark:border-gray-800 pb-1">Community Guidelines</a>
         </div>
      </div>
    </div>
  );
}
