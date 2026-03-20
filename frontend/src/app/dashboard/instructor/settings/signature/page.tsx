"use client";

import { useState, useEffect } from "react";
import SignatureUpload from "@/components/SignatureUpload";
import { Shield, CheckCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function InstructorSignaturePage() {
  const [initialUrl, setInitialUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const { data } = await api.get("/signatures/me");
        if (data?.signatureUrl) setInitialUrl(data.signatureUrl);
      } catch (error) {
        console.error("Failed to fetch signature", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSignature();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading signature settings...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">Signature Settings</h1>
        <p className="text-gray-500 mt-2">Manage your official digital signature for course certificates.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <SignatureUpload initialUrl={initialUrl} />
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
            <h3 className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2 mb-4">
              <Shield size={20} /> Security & Trust
            </h3>
            <ul className="space-y-3">
              {[
                "Only you can access this signature",
                "Encrypted storage on our secure servers",
                "Used exclusively on your certificates",
                "Can be updated or removed anytime"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle size={14} className="mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2 mb-4">
              <Info size={20} /> Certificate Usage
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When a student completes one of your courses, the system will automatically inject this signature into their PDF certificate along with the CEO's signature for official validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
