import Link from "next/link";
import { BookOpen, Users, LayoutDashboard, Settings, Video, FileText, BarChart, LogOut } from "lucide-react";

interface SidebarProps {
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

export default function Sidebar({ role }: SidebarProps) {
  // Define links based on the role
  const getLinks = () => {
    switch (role) {
      case "STUDENT":
        return [
          { name: "My Progress", icon: LayoutDashboard, href: "/dashboard/student" },
          { name: "Browse Courses", icon: BookOpen, href: "/dashboard/student/courses" },
          { name: "Assignments", icon: FileText, href: "/dashboard/student/assignments" },
          { name: "Certificates", icon: FileText, href: "/dashboard/student/certificates" },
        ];
      case "INSTRUCTOR":
        return [
          { name: "Overview", icon: LayoutDashboard, href: "/dashboard/instructor" },
          { name: "My Courses", icon: Video, href: "/dashboard/instructor/courses" },
          { name: "Students", icon: Users, href: "/dashboard/instructor/students" },
          { name: "Revenue", icon: BarChart, href: "/dashboard/instructor/revenue" },
        ];
      case "ADMIN":
        return [
          { name: "System Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
          { name: "User Management", icon: Users, href: "/dashboard/admin/users" },
          { name: "Course Approvals", icon: BookOpen, href: "/dashboard/admin/approvals" },
          { name: "Subscriptions", icon: BarChart, href: "/dashboard/admin/subscriptions" },
          { name: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="flex flex-col w-64 h-screen bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0">
      
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="text-emerald-600 w-6 h-6" />
          <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white truncate">
            Ethio<span className="text-emerald-600">Digital</span>
          </span>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-6 py-4">
        <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase border border-gray-200 dark:border-gray-700 w-fit">
          {role} PORTAL
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-emerald-500 transition-colors" />
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button className="flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Sign out
        </button>
      </div>

    </div>
  );
}
