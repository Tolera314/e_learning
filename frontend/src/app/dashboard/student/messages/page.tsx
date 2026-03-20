import React from "react";
import MessagingHub from "@/components/MessagingHub";

export default function StudentMessagesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Connect directly with your instructors and peers.</p>
      </header>
      <MessagingHub />
    </div>
  );
}
