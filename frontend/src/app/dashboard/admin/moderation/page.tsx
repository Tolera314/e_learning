"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Loader2,
  AlertTriangle,
  Flag,
  MessageCircle,
  FileVideo,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const TYPE_MAP: Record<string, string> = {
  'COURSE': 'Course',
  'USER': 'User Account',
  'THREAD': 'Forum Thread',
  'REPLY': 'Forum Reply'
};

export default function ContentModeration() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Backend should provide a 'flagged' items endpoint
      const response = await api.get('/admin/moderation/pending');
      setItems(response.data);
    } catch (error) {
      toast.error("Failed to load moderation queue");
      // Fallback for demo if endpoint not yet pushed
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (targetId: string, targetType: string, action: 'ALLOW' | 'BLOCK') => {
    try {
        await api.post('/admin/moderation', {
            targetId,
            targetType,
            action,
            reason: action === 'BLOCK' ? 'Violated community guidelines' : 'Approved after clinical review'
        });
        toast.success(`Content ${action === 'ALLOW' ? 'Approved' : 'Blocked'}`);
        setItems(items.filter(i => i.id !== targetId));
    } catch (error) {
        toast.error("Failed to apply moderation action");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShieldAlert className="text-red-600" size={32} />
            Content Moderation
          </h1>
          <p className="text-gray-500 mt-1">Review flagged content and ensure platform-wide safety standards.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 shadow-sm text-red-600">
            <AlertTriangle size={24} />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Reviews</p>
              <p className="text-lg font-bold">{items.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-red-600" size={48} />
              <p className="text-gray-500 font-medium">Scanning for reports...</p>
            </div>
          ) : items.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col lg:flex-row items-center gap-6 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                item.severity === 'HIGH' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                item.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
              }`}>
                {item.type === 'COURSE' ? <FileVideo size={24} /> : item.type === 'COMMENT' ? <MessageCircle size={24} /> : <Flag size={24} />}
              </div>
 
              <div className="flex-1 w-full space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded uppercase tracking-wider">{TYPE_MAP[item.type] || item.type}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    item.severity === 'HIGH' ? 'bg-red-600 text-white' : 'bg-gray-400 text-white'
                  }`}>{item.severity} Severity</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.title || "Untitled Content"}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Issue:</span> {item.reason}
                  <span className="mx-2">•</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">By:</span> {item.author || "System Flag"}
                </p>
              </div>
 
              <div className="flex shrink-0 gap-2 w-full lg:w-auto">
                <button 
                  onClick={() => handleAction(item.id, item.type, 'ALLOW')}
                  className="flex-1 lg:w-32 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Allow
                </button>
                <button 
                  onClick={() => handleAction(item.id, item.type, 'BLOCK')}
                  className="flex-1 lg:w-32 py-3 border border-red-200 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={16} /> Block
                </button>
                <button className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 transition-all">
                  <Eye size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {items.length === 0 && (
          <div className="py-20 text-center bg-gray-50 dark:bg-gray-800/10 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 font-medium">All clear! No pending content reports.</p>
          </div>
        )}
      </div>
    </div>
  );
}
