"use client";

import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  History, 
  ArrowUpRight, 
  Zap,
  Smartphone,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const TRANSACTIONS = [
  { id: "TX-5421", plan: "Quarterly Pro Plan", amount: "450 ETB", date: "Oct 24, 2026", method: "Telebirr", status: "SUCCESS" },
  { id: "TX-3298", plan: "Course: Advanced Calculus", amount: "1,200 ETB", date: "Sept 12, 2026", method: "CBE Birr", status: "SUCCESS" },
];

export default function StudentSubscription() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription & Billing</h1>
        <p className="text-gray-500 mt-2">Manage your learning plans and view your payment history.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* CURRENT PLAN */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-emerald-900/40 dark:to-blue-900/40 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
                        <Zap size={24} className="text-amber-400" />
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Current Active Plan</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                     <div>
                        <h2 className="text-4xl font-bold mb-2">Annual Premium</h2>
                        <p className="text-emerald-100/70 text-sm">Full access to all courses, live sessions, and certificates.</p>
                     </div>
                     <div className="text-right">
                        <p className="text-4xl font-bold">1,800 <span className="text-sm font-medium opacity-70">ETB/year</span></p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">Saves 40% vs Monthly</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/10">
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Status</p>
                        <div className="flex items-center gap-2 text-sm font-bold">
                           <CheckCircle2 size={16} className="text-emerald-400" /> Active
                        </div>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Next Billing</p>
                        <p className="text-sm font-bold">Oct 24, 2027</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Trial Status</p>
                        <p className="text-sm font-bold text-amber-400">Ended</p>
                     </div>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* PAYMENT METHODS (PHILLIPS) */}
            <div className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Preferred Payment Methods</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl border-2 border-emerald-500 bg-emerald-50/10 flex items-center gap-4 group cursor-pointer">
                     <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Smartphone size={24} />
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Telebirr Wallet</p>
                        <p className="text-xs text-emerald-600 font-medium italic">Primary Method</p>
                     </div>
                     <CheckCircle2 size={20} className="text-emerald-600" />
                  </div>
                  <div className="p-6 rounded-3xl border-2 border-gray-100 dark:border-gray-800 flex items-center gap-4 group cursor-pointer hover:border-emerald-200 transition-all">
                     <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-600">
                        <ShieldCheck size={24} />
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">CBE Birr</p>
                        <p className="text-xs text-gray-500 font-medium">Added Sept 2026</p>
                     </div>
                  </div>
               </div>
               <button className="w-full mt-8 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-xs font-bold text-gray-500 hover:text-emerald-600 transition-all">Add New Payment System</button>
            </div>
         </div>

         {/* TRANSACTION HISTORY */}
         <div className="bg-white dark:bg-[#111] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
               <History size={20} className="text-emerald-600" /> Billing History
            </h3>
            <div className="space-y-8 flex-1">
               {TRANSACTIONS.map((tx, i) => (
                  <div key={i} className="flex gap-4 group">
                     <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                        <ArrowUpRight size={18} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{tx.plan}</p>
                           <p className="text-sm font-bold text-emerald-600 shrink-0">{tx.amount}</p>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">{tx.date} • {tx.method}</p>
                     </div>
                  </div>
               ))}
            </div>
            <button className="w-full mt-10 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-all">Download All Invoices</button>
         </div>
      </div>
    </div>
  );
}
