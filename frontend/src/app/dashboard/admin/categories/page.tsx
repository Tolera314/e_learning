"use client";

import { useState } from "react";
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  FolderTree, 
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const INITIAL_CATEGORIES = [
  { 
    id: "1", 
    name: "Science & Technology", 
    slug: "science-tech", 
    segments: ["G6_G12", "UNIVERSITY"],
    courseCount: 42,
    subcategories: ["Physics", "Chemistry", "Computer Science"]
  },
  { 
    id: "2", 
    name: "Mathematics", 
    slug: "math", 
    segments: ["KG_G5", "G6_G12", "UNIVERSITY"],
    courseCount: 28,
    subcategories: ["Algebra", "Calculus", "Geometry"]
  },
  { 
    id: "3", 
    name: "Language & Literature", 
    slug: "language", 
    segments: ["KG_G5", "G6_G12"],
    courseCount: 15,
    subcategories: ["Amharic", "English", "Oromiffa"]
  }
];

export default function CategoriesManagement() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const deleteCategory = (id: string) => {
    if (confirm("Are you sure? This will affect all courses in this category.")) {
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Category deleted");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Layers className="text-emerald-600" size={32} />
            Categories Management
          </h1>
          <p className="text-gray-500 mt-1">Organize the academic hierarchy and subject taxonomy.</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
          <Plus size={20} />
          Create Category
        </button>
      </div>

      {/* Toolbar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search categories..." 
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category List */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Academic Hierarchy</span>
          <FolderTree size={18} className="text-gray-400" />
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <AnimatePresence>
            {categories.map((category) => (
              <div key={category.id}>
                <div className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors group flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(category.id)}>
                    <div className="text-gray-400 group-hover:text-emerald-500 transition-colors">
                      {expanded.includes(category.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 font-medium">/{category.slug}</span>
                        <div className="flex gap-1">
                          {category.segments.map(s => (
                            <span key={s} className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 rounded uppercase">
                              {s.replace('_', '-')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Courses</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{category.courseCount}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteCategory(category.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Subcategories */}
                <AnimatePresence>
                  {expanded.includes(category.id) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-gray-50/50 dark:bg-gray-800/10 border-t border-gray-100 dark:border-gray-800"
                    >
                      <div className="pl-16 pr-6 py-4 space-y-2">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Subcategories</div>
                        {category.subcategories.map((sub, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 group/sub">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {sub}
                            </span>
                            <button className="opacity-0 group-hover/sub:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 pt-2">
                          <Plus size={14} /> Add Subcategory
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
