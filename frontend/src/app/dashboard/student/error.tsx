"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-amber-500/10">
        <AlertTriangle size={40} />
      </div>

      <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
        Something went wrong
      </h1>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 leading-relaxed font-medium">
        An unexpected error occurred while loading your dashboard. Our team has been notified and we're working to fix it.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <RotateCcw size={16} /> Try Again
        </button>

        <Link
          href="/dashboard/student/support"
          className="flex items-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
        >
          <HelpCircle size={16} /> Contact Support
        </Link>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 w-full max-w-xs">
        <Link href="/dashboard/student" className="text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors uppercase tracking-widest">
           <ArrowLeft size={12} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
