"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  imagePosition?: "left" | "right";
  imageUrl: string;
  imageQuote: string;
  imageAuthor: string;
}

export default function AuthLayout({
  children,
  imagePosition = "left",
  imageUrl,
  imageQuote,
  imageAuthor,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex">
      {/* Form Section */}
      <div 
        className={`flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative ${
          imagePosition === "left" ? "order-2" : "order-1"
        }`}
      >
        {/* Background decorations for mobile (hidden on lg where image exists) */}
        <div className="lg:hidden absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl -z-10" />
        <div className="lg:hidden absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl -z-10" />

        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          <Link href="/" className="flex items-center gap-2 mb-10 w-fit group">
            <div className="bg-emerald-600 p-2 rounded-lg text-white group-hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-500/20">
              <BookOpen size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              Ethio<span className="text-emerald-600">Digital</span>Academy
            </span>
          </Link>

          {children}
        </div>
      </div>

      {/* Image Section */}
      <div 
        className={`hidden lg:flex flex-1 relative ${
          imagePosition === "left" ? "order-1" : "order-2"
        }`}
      >
        <div className="absolute inset-0 bg-gray-900">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-overlay"
            src={imageUrl}
            alt="Educational background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </div>
        
        <div className="relative w-full flex flex-col justify-end p-16 text-white text-shadow-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-xl"
          >
            <blockquote className="text-3xl font-bold mb-6 leading-tight">
              "{imageQuote}"
            </blockquote>
            <p className="text-lg text-gray-300 font-medium">{imageAuthor}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
