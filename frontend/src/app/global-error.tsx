"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fatal System Error</h2>
          <p className="text-gray-500 font-medium mb-6">{error.message || "Something went horribly wrong."}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 flex items-center gap-2"
          >
            <RefreshCcw size={18} />
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
