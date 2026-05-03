"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Settings,
  Menu,
  PlusCircle,
  Video,
  FileQuestion,
  Users,
  BarChart3,
  Star,
  DollarSign,
  Bell,
  LifeBuoy,
  Trophy,
  CreditCard,
  UserCircle,
  MessageSquare,
  Layers,
  Activity,
  FileSpreadsheet,
  TrendingUp,
  Percent,
  Zap,
  Shield,
  History,
  Database,
  Heart
} from "lucide-react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";
import AuthGuard from "./AuthGuard";
import { useAuth } from "@/context/AuthContext";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
    }`}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "student" | "instructor" | "admin";
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = {
    student: [
      { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard/student" },
      { icon: <BookOpen size={20} />, label: "My Courses", href: "/dashboard/student/courses" },
      { icon: <Video size={20} />, label: "Live Classes", href: "/dashboard/student/live-classes" },
      { icon: <FileQuestion size={20} />, label: "Assignments", href: "/dashboard/student/assignments" },
      { icon: <BarChart3 size={20} />, label: "Progress", href: "/dashboard/student/progress" },
      { icon: <Trophy size={20} />, label: "Certificates", href: "/dashboard/student/certificates" },
      { icon: <Star size={20} />, label: "Reviews", href: "/dashboard/student/reviews" },
      { icon: <CreditCard size={20} />, label: "Subscription", href: "/dashboard/student/subscription" },
      { icon: <MessageSquare size={20} />, label: "Messages", href: "/dashboard/student/messages" },
      { icon: <Bell size={20} />, label: "Notifications", href: "/dashboard/student/notifications" },
      { icon: <UserCircle size={20} />, label: "Profile Settings", href: "/dashboard/student/settings" },
      { icon: <LifeBuoy size={20} />, label: "Help & Support", href: "/dashboard/student/support" },
    ],
    instructor: [
      { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard/instructor" },
      { icon: <BookOpen size={20} />, label: "My Courses", href: "/dashboard/instructor/courses" },
      { icon: <PlusCircle size={20} />, label: "Create Course", href: "/dashboard/instructor/courses/create" },
      { icon: <Video size={20} />, label: "Lessons", href: "/dashboard/instructor/lessons" },
      { icon: <FileQuestion size={20} />, label: "Quizzes & Assignments", href: "/dashboard/instructor/quizzes" },
      { icon: <Video size={20} />, label: "Live Classes", href: "/dashboard/instructor/live-classes" },
      { icon: <Users size={20} />, label: "Students", href: "/dashboard/instructor/students" },
      { icon: <BarChart3 size={20} />, label: "Analytics", href: "/dashboard/instructor/analytics" },
      { icon: <Star size={20} />, label: "Reviews", href: "/dashboard/instructor/reviews" },
      { icon: <DollarSign size={20} />, label: "Earnings", href: "/dashboard/instructor/earnings" },
      { icon: <MessageSquare size={20} />, label: "Messages", href: "/dashboard/instructor/messages" },
      { icon: <Bell size={20} />, label: "Notifications", href: "/dashboard/instructor/notifications" },
      { icon: <Settings size={20} />, label: "Profile Settings", href: "/dashboard/instructor/settings" },
      { icon: <LifeBuoy size={20} />, label: "Support", href: "/dashboard/instructor/support" },
    ],
    admin: [
      { type: "header", label: "Core Management" },
      { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard/admin" },
      { icon: <Users size={20} />, label: "User Management", href: "/dashboard/admin/users" },
      { icon: <GraduationCap size={20} />, label: "Instructors", href: "/dashboard/admin/instructors" },
      { icon: <BookOpen size={20} />, label: "Course Catalog", href: "/dashboard/admin/courses" },
      { icon: <Layers size={20} />, label: "Categories", href: "/dashboard/admin/categories" },
      
      { type: "header", label: "Academic Ops" },
      { icon: <Activity size={20} />, label: "Enrollments", href: "/dashboard/admin/enrollments" },
      { icon: <Video size={20} />, label: "Live Classes", href: "/dashboard/admin/live-sessions" },
      { icon: <FileSpreadsheet size={20} />, label: "Quizzes", href: "/dashboard/admin/quizzes" },
      { icon: <Trophy size={20} />, label: "Certificates", href: "/dashboard/admin/certificates" },
      
      { type: "header", label: "Financial" },
      { icon: <CreditCard size={20} />, label: "Payments", href: "/dashboard/admin/payments" },
      { icon: <TrendingUp size={20} />, label: "Earnings", href: "/dashboard/admin/earnings" },
      { icon: <Percent size={20} />, label: "Commission", href: "/dashboard/admin/commission" },
      
      { type: "header", label: "Engagement" },
      { icon: <Bell size={20} />, label: "Announcements", href: "/dashboard/admin/notifications" },
      { icon: <MessageSquare size={20} />, label: "Moderation", href: "/dashboard/admin/content-moderation" },
      { icon: <Heart size={20} />, label: "Support & Feedback", href: "/dashboard/admin/support" },
      
      { type: "header", label: "System" },
      { icon: <BarChart3 size={20} />, label: "Analytics", href: "/dashboard/admin/analytics" },
      { icon: <Zap size={20} />, label: "Performance", href: "/dashboard/admin/performance" },
      { icon: <Shield size={20} />, label: "Security", href: "/dashboard/admin/security" },
      { icon: <History size={20} />, label: "Audit Logs", href: "/dashboard/admin/audit-logs" },
      { icon: <Settings size={20} />, label: "System Config", href: "/dashboard/admin/settings" },
      { icon: <Database size={20} />, label: "Backups", href: "/dashboard/admin/backups" },
    ],
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="h-screen bg-gray-50 dark:bg-[#0a0a0a] flex overflow-hidden">
        {/* Sidebar Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#111] border-r border-gray-100 dark:border-gray-800 z-50 transition-transform lg:translate-x-0 lg:static lg:block ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col p-6">
            <Link href="/" className="flex items-center gap-2 mb-10 px-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                <GraduationCap size={24} />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                Ethio<span className="text-emerald-600">Digital</span>
              </span>
            </Link>

            <nav className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
              {navItems[role].map((item: any, idx) => {
                if (item.type === "header") {
                  return (
                    <div key={`header-${idx}`} className="px-4 pt-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {item.label}
                    </div>
                  );
                }
                const isActive = item.href === `/dashboard/${role}` 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href);
                
                return <SidebarItem key={idx} {...item} active={isActive} />;
              })}
            </nav>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-1">
               <SidebarItem 
                icon={<LifeBuoy size={20} />} 
                label="Help & Support" 
                href={`/dashboard/${role}/support`} 
                active={pathname.includes("/support")}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Header */}
          <header className="h-20 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-gray-800 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-2 sm:gap-4 font-outfit ml-auto">
              <NotificationBell />
              <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 flex mx-1"></div>
              <UserMenu user={user} />
            </div>
          </header>

          {/* Page Area */}
          <main className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
