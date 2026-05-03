"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Download, 
  Loader2,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function PaymentManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/transactions");
      setTransactions(response.data);
    } catch (error) {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalRevenue = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter(t => 
    t.user.name.toLowerCase().includes(search.toLowerCase()) ||
    t.user.email.toLowerCase().includes(search.toLowerCase()) ||
    t.id.includes(search)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <DollarSign className="text-emerald-600" size={32} />
            Financial Operations
          </h1>
          <p className="text-gray-500 mt-1">Monitor revenue, manage subscriptions, and audit transactions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Revenue</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{totalRevenue.toLocaleString()} ETB</p>
            </div>
          </div>
          <button className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, email, or transaction ID..." 
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-emerald-600" size={32} />
                        <p className="text-gray-500 text-sm font-medium">Loading ledger...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-gray-500 italic">No transactions found.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <motion.tr 
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {tx.user.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{tx.user.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{tx.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 font-bold text-gray-900 dark:text-white">
                        {tx.amount.toLocaleString()} {tx.currency.toUpperCase()}
                      </td>
                      <td className="p-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                          tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                          tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30'
                        }`}>
                          {tx.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : tx.status === 'PENDING' ? <Clock size={12} /> : <XCircle size={12} />}
                          {tx.status}
                        </div>
                      </td>
                      <td className="p-6 text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-right">
                        <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-all">
                          Details
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
