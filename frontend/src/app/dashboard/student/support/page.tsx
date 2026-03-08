"use client";

import { 
  Search, 
  HelpCircle, 
  PlayCircle, 
  FileText, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

const HELP_CATEGORIES = [
  { title: "Getting Started", icon: <PlayCircle className="text-emerald-500" />, items: ["How to enroll in a course", "Using the mobile app", "Taking your first quiz"] },
  { title: "Learning Guide", icon: <BookOpen className="text-blue-500" />, items: ["Joining live classes", "Downloading resources", "Contacting your instructor"] },
  { title: "Account & Payout", icon: <ShieldAlert className="text-amber-500" />, items: ["Managing your subscription", "Telebirr payment guide", "Certificate verification"] },
];

export default function StudentSupport() {
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-10">
      <header className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-outfit">How can we help your learning?</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">Search through our guides or reach out to our support team for any assistance with your academic journey.</p>
        
        <div className="max-w-2xl mx-auto relative px-4">
           <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <input 
             type="text" 
             placeholder="Search for answers, guides, or tutorials..." 
             className="w-full pl-16 pr-8 py-5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl shadow-gray-200/20 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
           />
        </div>
      </header>

      {/* QUICK LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {HELP_CATEGORIES.map((cat, i) => (
            <div key={i} className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
               <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                  {cat.icon}
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">{cat.title}</h3>
               <ul className="space-y-6">
                  {cat.items.map((item, j) => (
                     <li key={j}>
                        <a href="#" className="flex items-center justify-between group text-sm text-gray-500 hover:text-emerald-600 transition-all font-medium">
                           {item}
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </a>
                     </li>
                  ))}
               </ul>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full opacity-50 group-hover:scale-150 transition-transform" />
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
         {/* CONTACT CARD */}
         <div className="bg-gray-900 dark:bg-emerald-950 p-12 rounded-[3.5rem] text-white flex flex-col justify-between">
            <div>
               <h2 className="text-3xl font-bold mb-4 flex items-center gap-4 font-outfit">
                  <MessageCircle className="text-emerald-400" size={32} /> Still have questions?
               </h2>
               <p className="text-emerald-100/70 text-lg mb-10 max-w-md border-l-4 border-emerald-500/30 pl-6">Our student success team is here to help you 24/7. Don't hesitate to reach out!</p>
            </div>
            <div className="flex flex-wrap gap-4">
               <button className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all">
                  Chat with Support <ArrowRight size={18} />
               </button>
               <button className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl font-bold text-white border border-white/20 hover:bg-white/20 transition-all">
                  Email us Help
               </button>
            </div>
         </div>

         {/* FAQ CALLOUT */}
         <div className="bg-emerald-50 dark:bg-[#111] p-12 rounded-[3.5rem] border border-emerald-100 dark:border-gray-800 flex flex-col justify-between relative overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10">Popular FAQs</h2>
            <div className="space-y-6">
               <details className="group">
                  <summary className="list-none cursor-pointer flex items-center justify-between font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors">
                     Can I learn on my mobile phone?
                     <Plus size={18} className="group-open:rotate-45 transition-transform" />
                  </summary>
                  <p className="mt-4 text-sm text-gray-500 leading-relaxed pl-2">Yes! Ethio-Digital-Academy is fully mobile-responsive and optimized for low data speeds.</p>
               </details>
               <div className="h-px bg-emerald-100 dark:bg-gray-800 w-full" />
               <details className="group">
                  <summary className="list-none cursor-pointer flex items-center justify-between font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors">
                     Which payment methods do you support?
                     <Plus size={18} className="group-open:rotate-45 transition-transform" />
                  </summary>
                  <p className="mt-4 text-sm text-gray-500 leading-relaxed pl-2">We support Telebirr, CBE Birr, and standard bank transfers within Ethiopia.</p>
               </details>
            </div>
            <div className="absolute top-0 right-0 p-8">
               <HelpCircle size={100} className="text-emerald-500/5 -rotate-12" />
            </div>
         </div>
      </div>
    </div>
  );
}

import { ArrowRight, Plus } from "lucide-react";
