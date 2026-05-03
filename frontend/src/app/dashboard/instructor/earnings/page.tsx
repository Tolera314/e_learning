"use client";

import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Download, 
  Wallet, 
  CreditCard,
  History,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/api";



export default function EarningsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/instructor/earnings");
      setData(data);
    } catch (err) {
      console.error("Failed to fetch earnings", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
          <p className="text-gray-500 font-medium font-outfit">Loading financial data...</p>
       </div>
    );
  }

  const icons = [<DollarSign key="1" />, <TrendingUp key="2" />, <Wallet key="3" />, <CreditCard key="4" />];
  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Earnings & Revenue</h1>
          <p className="text-gray-500 mt-2">Monitor your income, transaction history, and payouts.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all">
          <Download size={20} />
          Export Report
        </button>
      </header>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {data.summary.map((card: any, i: number) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
            >
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${card.color}`}>
                  {icons[i]}
               </div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{card.value}</h3>
               <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                  {card.sub.includes('+') && <ArrowUpRight size={10} className="text-emerald-500" />} {card.sub}
               </p>
            </motion.div>
          ))}
       </div>

      {/* TRANSACTION HISTORY */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
         <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <History size={20} className="text-emerald-600" /> Transaction History
            </h2>
            <button className="text-sm font-bold text-emerald-600 hover:dark:text-emerald-400">View All</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Date & ID</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Course / Student</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Total Pmt</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Your Share</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Status</th>
                  </tr>
               </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.transactions.map((tx: any) => (
                     <tr key={tx.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition-colors">
                        <td className="px-8 py-6 text-sm">
                           <p className="font-bold text-gray-900 dark:text-white">{tx.date}</p>
                           <p className="text-[10px] text-gray-500 mt-1">{tx.id}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-gray-900 dark:text-white text-sm">{tx.course}</p>
                           <p className="text-[10px] text-gray-500 mt-1">from {tx.student}</p>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-500 line-through decoration-red-400/30">
                           {tx.amount}
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-emerald-600">
                           {tx.share}
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-gray-50 text-gray-400'}`}>
                               {tx.status}
                           </span>
                        </td>
                     </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* PAYOUT SETTINGS CTA */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-500/20">
              <h3 className="text-xl font-bold mb-2">Automate Your Payouts</h3>
              <p className="text-emerald-100 text-sm mb-6">Link your bank account or TeleBirr to receive earnings automatically every week.</p>
              <button className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold shadow-lg shadow-black/10 hover:bg-emerald-50 transition-colors">Setup Payout Method</button>
           </div>
           <div className="bg-gray-900 dark:bg-white p-8 rounded-3xl text-white dark:text-gray-900">
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="opacity-70 text-sm mb-6">Have questions about your earnings or our commission structure? Check our finance FAQ.</p>
              <button className="px-6 py-3 bg-white/20 dark:bg-gray-900/10 rounded-xl font-bold hover:bg-white/30 dark:hover:bg-gray-900/20 transition-colors border border-white/20 dark:border-gray-900/10">Read Finance Policy</button>
           </div>
        </div>
    </div>
  );
}
