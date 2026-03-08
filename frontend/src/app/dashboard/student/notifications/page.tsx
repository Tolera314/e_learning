"use client";

import { 
  Bell, 
  MessageSquare, 
  FileText, 
  Video, 
  Zap,
  Check,
  MoreVertical,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

const NOTIFICATIONS = [
  { id: "1", title: "New Course Available: Biology G11", desc: "Start learning modern genetics today with Dr. Dawit.", time: "2 hours ago", type: "course", unread: true },
  { id: "2", title: "Assignment Deadline Approaching", desc: "Physics Mechanics Recap is due in 24 hours.", time: "5 hours ago", type: "deadline", unread: true },
  { id: "3", title: "Instructor Message", desc: "Dr. Abebe replied to your question about Integration.", time: "1 day ago", type: "message", unread: false },
  { id: "4", title: "Live Class Reminder", desc: "Chemistry Live Study begins in 1 hour.", time: "1 day ago", type: "live", unread: false },
];

export default function StudentNotifications() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">Notifications</h1>
          <p className="text-gray-500 mt-2">Stay updated with course announcements and activity.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all">
           <Check size={18} /> Mark all as read
        </button>
      </header>

      <div className="bg-white dark:bg-[#111] rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
         <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {NOTIFICATIONS.map((notif) => (
               <div key={notif.id} className={`p-8 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all flex gap-6 relative ${notif.unread ? 'bg-emerald-50/10' : ''}`}>
                  {notif.unread && (
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                  )}
                  
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                     notif.type === 'course' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 
                     notif.type === 'deadline' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                     notif.type === 'message' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' :
                     'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                  }`}>
                     {notif.type === 'course' ? <Zap size={24} /> : 
                      notif.type === 'deadline' ? <FileText size={24} /> : 
                      notif.type === 'message' ? <MessageSquare size={24} /> : 
                      <Video size={24} />}
                  </div>

                  <div className="flex-1 space-y-1">
                     <div className="flex items-center justify-between">
                        <h3 className={`font-bold ${notif.unread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{notif.title}</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                           <Clock size={12} /> {notif.time}
                        </span>
                     </div>
                     <p className="text-gray-500 text-sm leading-relaxed">{notif.desc}</p>
                  </div>

                  <button className="p-2 text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors">
                     <MoreVertical size={20} />
                  </button>
               </div>
            ))}
         </div>
      </div>
      
      <div className="flex justify-center">
         <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-8">Load previous notifications</button>
      </div>
    </div>
  );
}
