"use client";

import React, { useEffect, useState } from "react";
import { 
  Trophy, 
  Award, 
  Download, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  Search,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { format } from "date-fns";
import CertificateRenderer from "@/components/CertificateRenderer";

const CertificateCard = ({ cert, onView }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={() => onView(cert)}
    className="bg-white dark:bg-[#111] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-8 items-center group cursor-pointer hover:border-emerald-500 transition-all"
  >
     <div className="w-full sm:w-48 aspect-[1.4/1] bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-100 dark:border-gray-700 shrink-0 relative overflow-hidden group-hover:border-emerald-500 transition-colors">
        <Award size={48} className="text-amber-500 relative z-10" />
        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-3 relative z-10">Verified Credential</span>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-emerald-500/5" />
     </div>
     
     <div className="flex-1 space-y-4 text-center sm:text-left">
        <div>
           <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full">Completed</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 <Calendar size={12} /> {format(new Date(cert.issueDate), 'MMM dd, yyyy')}
              </div>
           </div>
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{cert.course.title}</h3>
           <p className="text-sm text-gray-500 mt-2 font-medium flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck size={16} className="text-emerald-500" /> Verify ID: <span className="font-mono text-xs">{cert.verificationCode}</span>
           </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
           <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all">
              <Download size={18} /> View & Download
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); window.open(`/verify/${cert.verificationCode}`, '_blank'); }}
             className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all"
           >
              <ExternalLink size={18} /> Public Link
           </button>
        </div>
     </div>
  </motion.div>
);

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [signatures, setSignatures] = useState<any>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await api.get("/certificates/my");
      setCertificates(data);
      
      // Also fetch signatures needed for rendering
      const sigRes = await api.get("/signatures/certificate-data");
      setSignatures(sigRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
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

      {loading ? (
        <div className="py-20 text-center animate-pulse space-y-4">
           <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto" />
           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading credentials...</p>
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
           {certificates.map((cert: any) => (
             <CertificateCard key={cert.id} cert={cert} onView={setSelectedCert} />
           ))}
        </div>
      ) : (
        <div className="p-20 text-center border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
           <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
           <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Complete more courses to earn certificates</p>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      <AnimatePresence>
        {selectedCert && signatures && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto"
          >
            <button 
              onClick={() => setSelectedCert(null)}
              className="absolute top-10 right-10 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[60]"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-[1100px]"
            >
              <CertificateRenderer 
                studentName={selectedCert.student.name}
                courseTitle={selectedCert.course.title}
                courseId={selectedCert.courseId}
                onClose={() => setSelectedCert(null)}
                verificationCode={selectedCert.verificationCode}
                issueDate={new Date(selectedCert.issueDate)}
                instructorName={selectedCert.course.instructor.name}
                ceoName={signatures.ceo?.name || "Executive Director"}
                instructorSignatureUrl={selectedCert.course.instructor.signature?.signatureUrl}
                ceoSignatureUrl={signatures.ceo?.signatureUrl}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
