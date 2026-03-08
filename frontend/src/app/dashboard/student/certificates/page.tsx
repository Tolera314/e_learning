"use client";

import { 
  Trophy, 
  Award, 
  Download, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  Search
} from "lucide-react";
import { motion } from "framer-motion";

const CERTIFICATES = [
  { id: "CERT-1024", title: "Advanced Calculus Masterclass", date: "Oct 24, 2026", grade: "A+", verifyId: "EDA-AC-1092-2026" },
  { id: "CERT-0912", title: "Physics: Fundamentals of Mechanics", date: "Sept 12, 2026", grade: "A", verifyId: "EDA-PH-0842-2026" },
];

const CertificateCard = ({ cert }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-[#111] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-8 items-center group cursor-pointer hover:border-emerald-500 transition-all"
  >
     <div className="w-full sm:w-48 aspect-[1.4/1] bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-100 dark:border-gray-700 shrink-0 relative overflow-hidden group-hover:border-emerald-500 transition-colors">
        <Award size={48} className="text-amber-500 relative z-10" />
        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-3 relative z-10">Verification Pending</span>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-emerald-500/5" />
     </div>
     
     <div className="flex-1 space-y-4 text-center sm:text-left">
        <div>
           <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px] font-bold uppercase tracking-widest rounded-full">University Course</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 <Calendar size={12} /> {cert.date}
              </div>
           </div>
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{cert.title}</h3>
           <p className="text-sm text-gray-500 mt-2 font-medium flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck size={16} className="text-emerald-500" /> Verify ID: <span className="font-mono text-xs">{cert.verifyId}</span>
           </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
           <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all">
              <Download size={18} /> Download PDF
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all">
              <ExternalLink size={18} /> Verify
           </button>
        </div>
     </div>
  </motion.div>
);

export default function StudentCertificates() {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Certificates & Achievements</h1>
          <p className="text-gray-500 mt-2">Showcase your verified academic milestones and accomplishments.</p>
        </div>
        <div className="relative">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
           <input type="text" placeholder="Search certificates..." className="pl-12 pr-6 py-3.5 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm w-full md:w-64" />
        </div>
      </header>

      {/* HIGHLIGHT BOX */}
      <div className="bg-emerald-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-500/20">
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center text-4xl shrink-0">
               🏆
            </div>
            <div>
               <h2 className="text-2xl font-bold mb-2">Academic Excellence Badge</h2>
               <p className="text-emerald-100 max-w-md">You've reached the top 5% of active students this month. Keep up the high engagement to earn your master badge!</p>
            </div>
            <button className="md:ml-auto px-10 py-4 bg-white text-emerald-700 rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-emerald-50 transition-colors">Share Achievement</button>
         </div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* LIST */}
      <div className="space-y-6 pb-20">
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Your Verified Certificates</h3>
         {CERTIFICATES.map(cert => <CertificateCard key={cert.id} cert={cert} />)}
         
         <div className="p-16 text-center border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
            <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Complete more courses to earn certificates</p>
         </div>
      </div>
    </div>
  );
}
