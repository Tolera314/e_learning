"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught an error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl shadow-xl max-w-xl w-full border border-gray-100 dark:border-gray-800 flex flex-col items-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Something went wrong!</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
          {error.message || "An unexpected error occurred while communicating with our servers."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 py-4 px-6 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center hover:bg-red-700 transition-colors gap-2"
          >
            <RefreshCcw size={18} />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-4 px-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors gap-2"
          >
            <Home size={18} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
