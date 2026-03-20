'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Zap, Clock, Calculator } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface SubscriptionGuardProps {
  children: ReactNode;
}

const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const [isCheckLoading, setIsCheckLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [errorInfo, setErrorInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // We can call a specialized endpoint or just check the user profile
        // Here we'll call the courses list as a test, or a dedicated /subscription/status if it existed
        // For simplicity, we'll use the API error handling to detect lockouts
        await api.get('/courses/instructor'); // This is just a dummy authenticated call
        setHasAccess(true);
      } catch (error: any) {
        if (error.response?.status === 403 && error.response.data?.code === 'SUBSCRIPTION_EXPIRED') {
          setHasAccess(false);
          setErrorInfo(error.response.data);
        } else {
          // Other errors (401, etc.) handled by auth middleware
          setHasAccess(true); // Default to true and let auth handle 401
        }
      } finally {
        setIsCheckLoading(false);
      }
    };

    checkSubscription();
  }, []);

  if (isCheckLoading) {
    return (
      <div className="flex animate-pulse flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100">
        <div className="w-12 h-12 bg-slate-200 rounded-full mb-4" />
        <div className="h-4 w-48 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-12 text-center text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl mb-8">
            <Lock className="w-10 h-10 text-blue-400" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Your trial has expired</h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Protect your future and continue your learning journey. Choose a plan to unlock all lessons, 
            quizzes, and certificates.
          </p>

          <div className="grid grid-cols-1 w-full gap-4 mb-10">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl text-left">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-bold text-sm">Monthly Access</p>
                <p className="text-xs text-slate-500">From 100 ETB</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl text-left">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-bold text-sm">24/7 Mentorship</p>
                <p className="text-xs text-slate-500">Included in all plans</p>
              </div>
            </div>
          </div>

          <Link 
            href="/dashboard/student/subscription"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            Upgrade Now
          </Link>
          
          <p className="mt-6 text-xs text-slate-500 font-medium">
            Plans start at less than 3 ETB per day.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
