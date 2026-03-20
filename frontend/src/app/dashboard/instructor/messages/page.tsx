import React from "react";
import MessagingHub from "@/components/MessagingHub";

export default function InstructorMessagesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage communications with your students and colleagues.</p>
      </header>
      <MessagingHub />
    </div>
  );
}
