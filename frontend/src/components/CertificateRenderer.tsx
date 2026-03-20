"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, CheckCircle, Award, ShieldCheck, X, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface CertificateRendererProps {
  studentName: string;
  courseTitle: string;
  courseId: string;
  onClose: () => void;
  verificationCode?: string;
  issueDate?: Date;
  instructorName?: string;
  ceoName?: string;
  instructorSignatureUrl?: string;
  ceoSignatureUrl?: string;
}

export default function CertificateRenderer({ 
  studentName, 
  courseTitle, 
  courseId, 
  onClose,
  verificationCode,
  issueDate,
  instructorName,
  ceoName,
  instructorSignatureUrl,
  ceoSignatureUrl
}: CertificateRendererProps) {
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatures, setSignatures] = useState<any>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [certificateData, setCertificateData] = useState<any>(null);

  // Fetch signatures and certificate metadata
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [sigRes, certRes] = await Promise.all([
          api.get(`/signatures/course/${courseId}`),
          api.post("/certificates/generate", { courseId })
        ]);
        setSignatures(sigRes.data);
        setCertificateData(certRes.data);
      } catch (error) {
        console.error("Failed to fetch certificate data:", error);
        toast.error("Error preparing certificate");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, onClose]);

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // High DPI for printing
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`Certificate_${studentName.replace(/\s+/g, "_")}.pdf`);
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("PDF Generation failed:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md">
       <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-emerald-500 animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs tracking-widest">Preparing Your Achievement...</p>
       </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-5xl"
      >
        <div className="flex justify-between items-center mb-6 text-white text-left">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                 <Award size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-bold">Certificate Preview</h2>
                 <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Official Digital Credential</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={downloadPDF} 
                disabled={isGenerating}
                className="px-8 py-3 bg-white text-gray-900 rounded-2xl font-bold text-sm shadow-xl hover:bg-emerald-50 transition-all flex items-center gap-2 group disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />}
                Download PDF
              </button>
              <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
                 <X size={20} />
              </button>
           </div>
        </div>

        {/* THE CERTIFICATE TEMPLATE (Landscape A4 Ratio) */}
        <div className="overflow-hidden rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
           <div 
             ref={certificateRef}
             className="aspect-[1.414/1] bg-white text-slate-900 p-20 relative select-none"
             style={{ backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f9fafb)' }}
           >
              {/* ORNAMENTAL BORDERS */}
              <div className="absolute inset-8 border-[20px] border-emerald-900/5 pointer-events-none" />
              <div className="absolute inset-12 border-[2px] border-emerald-600/20 pointer-events-none" />
              
              {/* CORNER ACCENTS */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

              {/* LOGO & INSTITUTION */}
              <div className="text-center space-y-4 mb-16 relative z-10">
                 <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-emerald-700 p-4 rounded-3xl rotate-12 shadow-xl flex items-center justify-center">
                       <Award size={48} className="text-white -rotate-12" />
                    </div>
                 </div>
                 <h3 className="text-emerald-800 text-3xl font-extrabold uppercase tracking-[0.3em]">Ethio-Digital Academy</h3>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Excellence in Digital Education</p>
              </div>

              {/* CONTENT */}
              <div className="text-center space-y-12 relative z-10">
                 <div className="space-y-4">
                    <p className="italic text-2xl text-slate-500">This is to certify that</p>
                    <h1 className="text-7xl font-bold text-slate-900 underline decoration-emerald-500/30 underline-offset-8">
                       {studentName}
                    </h1>
                 </div>
                 
                 <div className="space-y-4">
                    <p className="italic text-2xl text-slate-500">has successfully completed the course</p>
                    <h2 className="text-4xl font-extrabold text-emerald-900 max-w-2xl mx-auto leading-tight">
                       {courseTitle}
                    </h2>
                 </div>

                 <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
                    Demonstrating exceptional proficiency, commitment, and mastery of the core concepts 
                    outlined within the curriculum verified by the academy's academic board.
                 </p>
              </div>

              {/* SIGNATURES & VERIFICATION */}
              <div className="mt-24 grid grid-cols-3 items-end relative z-10">
                 {/* CEO SIGNATURE */}
                 <div className="text-center space-y-4">
                    <div className="h-16 flex items-center justify-center mb-2">
                       {(signatures?.ceo?.signatureUrl || ceoSignatureUrl) && (
                          <img src={signatures?.ceo?.signatureUrl || ceoSignatureUrl} alt="CEO" className="max-h-full object-contain filter contrast-125 select-none" />
                       )}
                    </div>
                    <div className="w-48 mx-auto border-t border-slate-200 pt-4">
                       <p className="font-bold text-slate-900 text-sm">{signatures?.ceo?.user?.name || ceoName || "CEO Signature"}</p>
                       <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Chief Executive Officer</p>
                    </div>
                 </div>

                 {/* GOLD SEAL */}
                 <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-emerald-50 border-4 border-emerald-600/20 flex items-center justify-center relative scale-110">
                       <div className="absolute inset-2 border-2 border-dashed border-emerald-600/30 rounded-full animate-spin-slow" />
                       <ShieldCheck size={48} className="text-emerald-600" />
                    </div>
                 </div>

                 {/* INSTRUCTOR SIGNATURE */}
                 <div className="text-center space-y-4">
                    <div className="h-16 flex items-center justify-center mb-2">
                       {(signatures?.instructor?.signatureUrl || instructorSignatureUrl) && (
                          <img src={signatures?.instructor?.signatureUrl || instructorSignatureUrl} alt="Instructor" className="max-h-full object-contain filter contrast-125 select-none" />
                       )}
                    </div>
                    <div className="w-48 mx-auto border-t border-slate-200 pt-4">
                       <p className="font-bold text-slate-900 text-sm">{signatures?.instructor?.user?.name || instructorName || "Instructor Signature"}</p>
                       <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Authorized Instructor</p>
                    </div>
                 </div>
              </div>

              {/* VERIFICATION ID */}
              <div className="absolute bottom-12 left-20 flex items-center gap-2 text-left">
                 <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle size={16} />
                 </div>
                 <div>
                    <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Verified Certificate ID</p>
                    <p className="text-[10px] font-mono font-bold text-slate-600">{certificateData?.verificationCode || verificationCode || "EDA-LOADING"}</p>
                 </div>
              </div>

              <div className="absolute bottom-12 right-20 text-right">
                 <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Date of Issue</p>
                 <p className="text-[10px] font-bold text-slate-600">{(issueDate || new Date()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
           </div>
        </div>

        <p className="text-center mt-8 text-white/40 text-xs flex items-center justify-center gap-2">
           <ShieldCheck size={14} /> This certificate is cryptographically signed and stored on the Ethio-Digital-Academy ledger.
        </p>
      </motion.div>
    </div>
  );
}
