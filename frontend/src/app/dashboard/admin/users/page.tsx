"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert, 
  UserMinus, 
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/users", {
        params: {
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          search: search || undefined
        }
      });
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, roleFilter, statusFilter]);

  const toggleStatus = async (userId: string, currentActive: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentActive });
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentActive } : u));
      toast.success(currentActive ? "User suspended" : "User activated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const toggleBan = async (userId: string, currentBanned: boolean) => {
    if (!currentBanned && !confirm("Are you sure you want to BAN this user? They will lose all access immediately.")) return;
    try {
      await api.patch(`/admin/users/${userId}/status`, { isBanned: !currentBanned });
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !currentBanned } : u));
      toast.success(currentBanned ? "Ban removed" : "User banned successfully");
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="text-emerald-600" size={32} />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Oversee and control all platform accounts from one place.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-[#151515] p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col px-4 border-r border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Users</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{users.length}</span>
          </div>
          <div className="flex flex-col px-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth</span>
            <span className="text-lg font-bold text-emerald-600">+12%</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="p-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-medium"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="INSTRUCTOR">Instructors</option>
          <option value="ADMIN">Administrators</option>
        </select>

        <select 
          className="p-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-medium"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
          <option value="banned">Banned Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role & Activity</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-emerald-600" size={40} />
                        <span className="text-gray-500 font-medium tracking-wide">Retrieving secure user data...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500 italic">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <motion.tr 
                      key={user.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-600 flex items-center justify-center font-bold text-lg shadow-sm">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1"><Mail size={12} /> {user.email || "No email"}</span>
                              <span className="flex items-center gap-1"><Phone size={12} /> {user.phoneNumber}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                            user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700/50'
                          }`}>
                            {user.role}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar size={12} /> Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          {user.isBanned ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                              <ShieldAlert size={14} /> BANNED
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className={`flex items-center gap-1.5 text-xs font-bold ${user.isActive ? "text-emerald-500" : "text-amber-500"}`}>
                                {user.isActive ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                {user.isActive ? "ACTIVE" : "SUSPENDED"}
                              </span>
                              {!user.isVerified && (
                                <span className="text-[10px] text-gray-400 font-medium italic">Unverified</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toggleStatus(user.id, user.isActive)}
                            className={`p-2 rounded-xl transition-all ${user.isActive ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                            title={user.isActive ? "Suspend User" : "Activate User"}
                          >
                            {user.isActive ? <UserMinus size={20} /> : <UserCheck size={20} />}
                          </button>
                          <button 
                            onClick={() => toggleBan(user.id, user.isBanned)}
                            className={`p-2 rounded-xl transition-all ${user.isBanned ? 'text-gray-400 hover:bg-gray-100' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                            title={user.isBanned ? "Remove Ban" : "Ban User"}
                          >
                            {user.isBanned ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                          </button>
                          <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
