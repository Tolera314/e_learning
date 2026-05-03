import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  subtitle?: string;
}

export default function SlidePanel({ isOpen, onClose, title, children, width = "max-w-md", subtitle }: SlidePanelProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
        />
      )}
      {isOpen && (
        <motion.div
          key="panel"
          initial={{ x: '100%', opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: '100%', opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className={`
            fixed z-[101] overflow-hidden flex flex-col bg-white dark:bg-[#111] shadow-2xl border border-gray-100 dark:border-gray-800
            /* Mobile: Centered Modal */
            inset-x-4 top-[5%] bottom-[5%] rounded-3xl
            /* Desktop: Slide Panel */
            md:inset-auto md:top-0 md:right-0 md:h-screen md:rounded-none md:rounded-l-[2rem] md:w-full ${width}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-[#0a0a0a]/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
              {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
            {children}
          </div>
          
          {/* Safe area at bottom for scrolling past floating buttons if any */}
          <div className="h-6 shrink-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
