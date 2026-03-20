'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

const SubscriptionCancel = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100"
      >
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <XCircle className="w-10 h-10 text-rose-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Cancelled</h1>
        <p className="text-slate-500 mb-10 leading-relaxed">
          The transaction was not completed. No charges were made to your account.
        </p>

        <div className="space-y-4">
          <Link 
            href="/dashboard/student/subscription" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft className="w-5 h-5" /> Try Again
          </Link>
          <button 
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <LifeBuoy className="w-5 h-5" /> Contact Support
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionCancel;
