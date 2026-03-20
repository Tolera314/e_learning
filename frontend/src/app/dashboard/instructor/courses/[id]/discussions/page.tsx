"use client";

import React from "react";
import { useParams } from "next/navigation";
import DiscussionForum from "@/components/DiscussionForum";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InstructorCourseDiscussionsPage() {
  const params = useParams();
  const courseId = params?.id as string;

  if (!courseId) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 mb-2">
        <Link href="/dashboard/instructor/courses" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-primary-600 dark:text-primary-400" />
            Discussion Moderation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage course threads, answer queries, pin announcements, and enforce community standards.
          </p>
        </div>
      </div>

      <div className="h-[700px] bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
        <DiscussionForum courseId={courseId} userRole="INSTRUCTOR" />
      </div>
    </div>
  );
}
