"use client";

import { useState } from "react";
import { 
  Award, 
  Search, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  CheckCircle2,
  MoreVertical,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const MOCK_CERTIFICATES = [
  { id: "1", code: "EDA-742-XP", student: "Abenezer K.", course: "Python Mastery", date: "2026-03-18" },
  { id: "2", code: "EDA-911-BB", student: "Hirut T.", course: "Amharic Grammar", date: "2026-03-19" },
  { id: "3", code: "EDA-101-ZM", student: "Dawit S.", course: "Quantum Physics", date: "2026-03-20" }
];

export default function CertificateManagement() {
  const [certs, setCerts] = useState(MOCK_CERTIFICATES);
  const [search, setSearch] = useState("");

  const verifyCode = () => {
    toast.success("Verification Code Valid: Authenticated by EDA Authority.");
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Award className="text-amber-500" size={32} />
            Academic Certification
          </h1>
          <p className="text-gray-500 mt-1">Manage credential templates and audit system-issued certificates.</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
          <Plus size={20} />
          Add Template
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Verification Hub */}
        <div className="xl:col-span-1 space-y-6">
          <section className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm border-t-4 border-t-amber-500">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-6">
              <ShieldCheck className="text-amber-500" size={20} />
              Quick Verification
            </h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Enter Certificate Code (e.g. EDA-XXX)" 
                className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm uppercase"
              />
              <button 
                onClick={verifyCode}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                Validate Authentic Code
              </button>
            </div>
          </section>

          <section className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-500/20">
            <h4 className="text-lg font-bold">Volume Analytics</h4>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl font-black">2,842</span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-100">Issued</span>
            </div>
            <p className="text-amber-100/70 text-xs mt-2 uppercase font-bold tracking-[0.1em]">Academic Year 2026</p>
          </section>
        </div>

        {/* Issued Certificates Ledger */}
        <div className="xl:col-span-2 bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Digital Credential Ledger</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search ledger..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="p-6">Credential Code</th>
                  <th className="p-6">Recipient</th>
                  <th className="p-6">Program</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {certs.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                    <td className="p-6 font-mono text-xs font-bold text-amber-600">{cert.code}</td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{cert.student}</p>
                      <p className="text-[10px] text-gray-400">Awarded {cert.date}</p>
                    </td>
                    <td className="p-6 text-xs text-gray-700 dark:text-gray-300 font-medium">{cert.course}</td>
                    <td className="p-6">
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 text-gray-400 hover:text-emerald-500 rounded-xl transition-all">
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="w-full py-5 text-xs font-bold text-gray-400 hover:text-amber-500 bg-gray-50/30 dark:bg-gray-800/10 transition-colors tracking-widest uppercase border-t border-gray-100 dark:border-gray-800">
            Audit Complete Registry (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
