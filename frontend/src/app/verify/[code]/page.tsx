"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Award, ShieldCheck, User, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";

export default function CertificateVerificationPage() {
  const params = useParams();
  const code = params?.code as string;
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (code) {
      verify();
    }
  }, [code]);

  const verify = async () => {
    try {
      const { data } = await api.get(`/certificates/verify/${code}`);
      setCertificate(data);
    } catch (err) {
      setError("This certificate verification code is invalid or has been revoked.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Verifying Credential...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
             <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Invalid Credential</h1>
          <p className="text-gray-500">{error}</p>
          <Link href="/" className="inline-block px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:opacity-90 transition-all">
            Back to Academy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-[0.2em]">
             <ShieldCheck size={16} /> Verified Authenticity
          </div>
          <h1 className="text-5xl font-black text-gray-900 font-outfit uppercase tracking-tighter">Credential Verification</h1>
          <p className="text-gray-500 max-w-lg mx-auto italic">This secure portal verifies the legitimacy of certifications issued by Ethio-Digital Academy.</p>
        </div>

        {/* VERIFICATION CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-gray-100 relative overflow-hidden"
        >
          {/* WATERMARK */}
          <div className="absolute top-10 right-10 opacity-5 -rotate-12 pointer-events-none">
             <Award size={300} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-10">
               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Recipient</p>
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                        {certificate.student.avatar ? <img src={certificate.student.avatar} className="w-full h-full object-cover rounded-2xl" /> : <User size={30} />}
                     </div>
                     <div>
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">{certificate.student.name}</h2>
                        <p className="text-emerald-600 font-bold text-sm">Verified Student</p>
                     </div>
                  </div>
               </div>

               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Qualification</p>
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BookOpen size={24} /></div>
                     <div>
                        <h3 className="text-2xl font-bold text-gray-900">{certificate.course.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">Instructor: {certificate.course.instructor.name}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-10 border-t md:border-t-0 md:border-l border-gray-100 pt-10 md:pt-0 md:pl-12">
               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
                  <div className="flex items-center gap-2 text-emerald-600">
                     <CheckCircle2 size={24} />
                     <span className="text-xl font-black uppercase tracking-tighter">Active & Valid</span>
                  </div>
               </div>

               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Issued On</p>
                  <p className="text-xl font-bold text-gray-900">{format(new Date(certificate.issueDate), 'MMMM dd, yyyy')}</p>
               </div>

               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Verification ID</p>
                  <p className="text-xl font-mono font-black text-gray-900 bg-gray-50 inline-block px-3 py-1 rounded-lg border border-gray-100">{certificate.verificationCode}</p>
               </div>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <ShieldCheck size={16} className="text-emerald-500" />
                Issued strictly according to EDA's Academic Excellence Charter.
             </div>
             <Link href={`/dashboard/student/certificates`} className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 group">
                Download PDF <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </motion.div>

        <footer className="text-center text-gray-400 text-sm">
           &copy; {new Date().getFullYear()} Ethio-Digital Academy. All rights reserved. 
           <div className="flex justify-center gap-6 mt-4">
              <a href="#" className="hover:text-emerald-600 transition-colors uppercase font-bold tracking-widest text-[10px]">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-600 transition-colors uppercase font-bold tracking-widest text-[10px]">Verification Protocol</a>
           </div>
        </footer>
      </div>
    </div>
  );
}
