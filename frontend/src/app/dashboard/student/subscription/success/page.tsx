'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';

const SubscriptionSuccess = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
        <p className="text-slate-500 mb-10 leading-relaxed">
          Your subscription is now active. You have full access to all premium features and course content.
        </p>

        <div className="space-y-4">
          <Link 
            href="/dashboard/student/courses" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            Start Learning <PlayCircle className="w-5 h-5" />
          </Link>
          <Link 
            href="/dashboard/student" 
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionSuccess;
