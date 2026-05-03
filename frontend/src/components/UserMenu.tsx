"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Shield, 
  CreditCard,
  LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserMenuProps {
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string | null;
  };
}

import { useAuth } from "@/context/AuthContext";

export default function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const roleColor = user.role === "ADMIN" 
    ? "text-rose-600 bg-rose-50 dark:bg-rose-900/20" 
    : user.role === "INSTRUCTOR"
    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
    : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 shadow-sm shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-emerald-600 font-bold text-lg">{user.name[0]}</span>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{user.name}</p>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${roleColor.split(' ')[0]} px-1.5 py-0.5 rounded-md inline-block mt-0.5`}>
            {user.role}
          </p>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 py-2"
          >
            {/* Header info for mobile */}
            <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 sm:hidden">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>

            <div className="px-2 space-y-1">
              <Link 
                href={`/dashboard/${user.role.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              >
                <LayoutDashboard size={18} /> Dashboard Home
              </Link>
              <Link 
                href={`/dashboard/${user.role.toLowerCase()}/settings`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              >
                <User size={18} /> My Profile
              </Link>
              <Link 
                href={`/dashboard/${user.role.toLowerCase()}/settings`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              >
                <Settings size={18} /> Account Settings
              </Link>
              {user.role === 'STUDENT' && (
                <Link 
                  href="/dashboard/student/subscription"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                >
                  <CreditCard size={18} /> Subscription
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link 
                  href="/dashboard/admin/security"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                >
                  <Shield size={18} /> Admin Panel
                </Link>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800 px-2">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
