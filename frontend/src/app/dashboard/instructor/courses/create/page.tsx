"use client";

import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  BookOpen, 
  Layers, 
  Globe, 
  Trophy,
  CheckCircle2,
  Video,
  FileText
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import CurriculumBuilder from "@/components/CurriculumBuilder";

const STEPS = [
  "Basic Info",
  "Course Details",
  "Curriculum",
  "Media Assets",
  "Pricing",
  "Settings",
  "Review & Publish"
];

const CATEGORIES = ["Mathematics", "Physics", "Chemistry", "Biology", "History", "Language", "Computer Science", "Business", "Vocational", "Soft Skills"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const SEGMENTS = [
  { id: "KG_G5", label: "Primary (KG - Grade 5)" },
  { id: "G6_G12", label: "Secondary (Grade 6 - Grade 12)" },
  { id: "UNIVERSITY", label: "University / College" }
];

export default function CreateCourse() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: "",
    shortDescription: "",
    category: "",
    subcategory: "",
    level: "Beginner",
    segment: "",
    language: "English",
    thumbnail: null as File | null,
    thumbnailUrl: "",

    // Step 2: Course Details
    fullDescription: "",
    objectives: [""] as string[],
    requirements: [""] as string[],
    targetAudience: [""] as string[],
    
    // Step 3: Curriculum (Managed separately but structured here)
    modules: [] as any[],

    // Step 5: Pricing
    isFree: true,
    price: "0",
    discountPrice: "",

    // Step 6: Settings
    visibility: "DRAFT",
    allowDiscussions: true,
    allowReviews: true,
    issueCertificate: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (formData.title.length < 10 || formData.title.length > 70) newErrors.title = "Title must be 10-70 characters.";
      if (formData.shortDescription.length < 50) newErrors.shortDescription = "Short description must be at least 50 characters.";
      if (!formData.category) newErrors.category = "Category is required.";
      if (!formData.segment) newErrors.segment = "Educational segment is required.";
    }
    if (step === 2) {
      if ((formData.fullDescription?.length || 0) < 100) newErrors.fullDescription = "Full description must be at least 100 characters.";
      if (formData.objectives.filter(o => o.trim()).length === 0) newErrors.objectives = "At least one learning objective is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, 7));
  };
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({...errors, thumbnail: "Image must be under 2MB"});
        return;
      }
      setFormData({ ...formData, thumbnail: file, thumbnailUrl: URL.createObjectURL(file) });
      setErrors({...errors, thumbnail: ""});
    }
  };

  const updateListField = (field: 'objectives' | 'requirements' | 'targetAudience', index: number, value: string) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData({ ...formData, [field]: newList });
  };

  const addListField = (field: 'objectives' | 'requirements' | 'targetAudience') => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeListField = (field: 'objectives' | 'requirements' | 'targetAudience', index: number) => {
    const newList = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newList });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:8000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to publish course");

      router.push("/dashboard/instructor/courses");
    } catch (error) {
       console.error(error);
       setErrors({ ...errors, publish: "Error publishing course. Please check your connection." });
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
          <p className="text-gray-500 mt-2">Expert Course Builder &mdash; Step {step} of 7</p>
        </div>
        <div className="hidden md:block">
           <button 
             onClick={() => router.push("/dashboard/instructor/courses")}
             className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
           >
             Save & Exit
           </button>
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="flex gap-2 mb-12">
         {STEPS.map((label, idx) => (
           <div key={idx} className="flex-1 group relative">
              <div className="h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: step > idx ? "100%" : step === idx + 1 ? "50%" : "0%" }}
                  className="h-full bg-emerald-500"
                />
              </div>
              <span className={`absolute top-4 left-0 text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                step === idx + 1 ? "text-emerald-600" : "text-gray-400"
              }`}>
                {label}
              </span>
           </div>
         ))}
      </div>

      <div className="bg-white dark:bg-[#111] p-8 sm:p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-[500px] flex flex-col">
         <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Course Title <span className="text-red-500">*</span></label>
                       <input 
                         type="text" 
                         placeholder="e.g. Master Calculus for Grade 12" 
                         value={formData.title}
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                         className={`w-full p-4 bg-gray-50 dark:bg-gray-800/50 border ${errors.title ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'} rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white`}
                       />
                       {errors.title && <p className="text-xs text-red-500 mt-2 font-medium">{errors.title}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Short Subtitle / Description <span className="text-red-500">*</span></label>
                       <textarea 
                         rows={2}
                         placeholder="A brief punchy line to grab attention (min 50 chars)" 
                         value={formData.shortDescription}
                         onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                         className={`w-full p-4 bg-gray-50 dark:bg-gray-800/50 border ${errors.shortDescription ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'} rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white resize-none`}
                       />
                       {errors.shortDescription && <p className="text-xs text-red-500 mt-2 font-medium">{errors.shortDescription}</p>}
                    </div>

                    <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Primary Category</label>
                       <select 
                         value={formData.category}
                         onChange={(e) => setFormData({...formData, category: e.target.value})}
                         className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white"
                       >
                          <option value="">Select Category</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>

                    <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Educational Segment</label>
                       <select 
                         value={formData.segment}
                         onChange={(e) => setFormData({...formData, segment: e.target.value})}
                         className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white"
                       >
                          <option value="">Select Segment</option>
                          {SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                       </select>
                    </div>

                    <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Difficulty Level</label>
                       <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-2xl border border-gray-100 dark:border-gray-800">
                          {LEVELS.map(l => (
                            <button
                               key={l}
                               onClick={() => setFormData({...formData, level: l})}
                               className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                                 formData.level === l 
                                  ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm" 
                                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                               }`}
                            >
                               {l}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thumbnail (16:9)</label>
                       <div className="relative">
                          <input type="file" id="thumb" className="hidden" accept="image/*" onChange={handleFileChange} />
                          <label htmlFor="thumb" className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">
                              {formData.thumbnail ? formData.thumbnail.name : "Choose Image..."}
                            </span>
                            <Upload size={16} className="text-emerald-500" />
                          </label>
                       </div>
                       {errors.thumbnail && <p className="text-xs text-red-500 mt-2">{errors.thumbnail}</p>}
                    </div>
                 </div>

                 <div className="flex justify-end pt-10">
                    <button onClick={handleNext} className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all transform hover:-translate-y-1">
                       Continue Builder <ChevronRight size={20} />
                    </button>
                 </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                 <div className="space-y-6">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Course Description <span className="text-red-500">*</span></label>
                       <textarea 
                         rows={8}
                         placeholder="Provide a deep, detailed overview of what makes this course special..." 
                         value={formData.fullDescription}
                         onChange={(e) => setFormData({...formData, fullDescription: e.target.value})}
                         className={`w-full p-4 bg-gray-50 dark:bg-gray-800/50 border ${errors.fullDescription ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'} rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white resize-none`}
                       />
                       {errors.fullDescription && <p className="text-xs text-red-500 mt-2 font-medium">{errors.fullDescription}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Learning Objectives</label>
                          {formData.objectives.map((obj, i) => (
                            <div key={i} className="flex gap-2">
                               <input 
                                 type="text" 
                                 placeholder="e.g. Master React Hooks"
                                 value={obj}
                                 onChange={(e) => updateListField('objectives', i, e.target.value)}
                                 className="flex-1 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                               />
                               {formData.objectives.length > 1 && (
                                 <button onClick={() => removeListField('objectives', i)} className="text-red-400 hover:text-red-600">&times;</button>
                               )}
                            </div>
                          ))}
                          <button onClick={() => addListField('objectives')} className="text-xs font-bold text-emerald-600 hover:underline">+ Add Objective</button>
                       </div>

                       <div className="space-y-4">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Requirements / Prerequisites</label>
                          {formData.requirements.map((req, i) => (
                            <div key={i} className="flex gap-2">
                               <input 
                                 type="text" 
                                 placeholder="e.g. Basic Calculus knowledge"
                                 value={req}
                                 onChange={(e) => updateListField('requirements', i, e.target.value)}
                                 className="flex-1 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                               />
                               {formData.requirements.length > 1 && (
                                 <button onClick={() => removeListField('requirements', i)} className="text-red-400 hover:text-red-600">&times;</button>
                               )}
                            </div>
                          ))}
                          <button onClick={() => addListField('requirements')} className="text-xs font-bold text-emerald-600 hover:underline">+ Add Requirement</button>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-between pt-10 mt-auto">
                    <button onClick={handleBack} className="flex items-center gap-2 px-6 py-4 text-gray-500 font-bold hover:text-emerald-600 transition-all">
                       <ChevronLeft size={20} /> Previous
                    </button>
                    <button onClick={handleNext} className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all transform hover:-translate-y-1">
                       Define Curriculum <ChevronRight size={20} />
                    </button>
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                 <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Curriculum Builder</h3>
                    <p className="text-gray-500 mb-8 font-medium">Structure your course into modules and lessons. Drag and drop handles to reorder.</p>
                    
                    <CurriculumBuilder 
                       modules={formData.modules} 
                       onChange={(modules) => setFormData({...formData, modules})} 
                    />
                 </div>

                 <div className="flex justify-between pt-10 mt-auto">
                    <button onClick={handleBack} className="flex items-center gap-2 px-6 py-4 text-gray-500 font-bold hover:text-emerald-600 transition-all">
                       <ChevronLeft size={20} /> Previous
                    </button>
                    <button onClick={handleNext} className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all transform hover:-translate-y-1">
                       Media Assets <ChevronRight size={20} />
                    </button>
                 </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                 <div className="max-w-2xl mx-auto py-8 space-y-8">
                    <div className="text-center">
                       <Upload className="mx-auto text-emerald-500 mb-4" size={48} />
                       <h3 className="text-xl font-bold text-gray-900 dark:text-white">Course Media & Resources</h3>
                       <p className="text-gray-500 text-sm">Upload promotional and learning materials for the entire course.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-3xl group cursor-pointer hover:border-emerald-500 transition-all">
                          <Video className="text-blue-500 mb-3" size={24} />
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Promo Video</h4>
                          <p className="text-xs text-gray-500">A short introduction (MP4, 1080p, {"<"} 500MB)</p>
                       </div>
                       <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-3xl group cursor-pointer hover:border-emerald-500 transition-all">
                          <FileText className="text-amber-500 mb-3" size={24} />
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Course Syllabus</h4>
                          <p className="text-xs text-gray-500">Downloadable PDF for students ({"<"} 10MB)</p>
                       </div>
                    </div>

                    <div className="p-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-center bg-gray-50/50 dark:bg-transparent">
                       <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drag and drop additional resources here</p>
                       <p className="text-xs text-gray-400 mt-1">Images, PDFs, or secondary materials</p>
                    </div>
                 </div>

                 <div className="flex justify-between pt-10 mt-auto">
                    <button onClick={handleBack} className="flex items-center gap-2 px-6 py-4 text-gray-500 font-bold hover:text-emerald-600 transition-all">
                       <ChevronLeft size={20} /> Previous
                    </button>
                    <button onClick={handleNext} className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all transform hover:-translate-y-1">
                       Configure Pricing <ChevronRight size={20} />
                    </button>
                 </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                 <div className="max-w-2xl mx-auto py-4 space-y-10">
                    <div className="grid md:grid-cols-2 gap-4">
                       <button 
                         onClick={() => setFormData({...formData, isFree: true})}
                         className={`p-6 rounded-3xl border-2 text-left transition-all ${formData.isFree ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-100 dark:border-gray-800'}`}
                       >
                         <h4 className={`font-bold mb-1 ${formData.isFree ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>Free Course</h4>
                         <p className="text-xs text-gray-500">Available to all students for free.</p>
                       </button>
                       <button 
                         onClick={() => setFormData({...formData, isFree: false})}
                         className={`p-6 rounded-3xl border-2 text-left transition-all ${!formData.isFree ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-100 dark:border-gray-800'}`}
                       >
                         <h4 className={`font-bold mb-1 ${!formData.isFree ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>Paid Course</h4>
                         <p className="text-xs text-gray-500">Set a price and earn revenue.</p>
                       </button>
                    </div>

                    {!formData.isFree && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-8 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-6"
                      >
                         <div className="grid md:grid-cols-2 gap-6">
                            <div>
                               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Asking Price (ETB)</label>
                               <div className="relative">
                                  <input 
                                    type="number" 
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">ETB</span>
                               </div>
                            </div>
                            <div>
                               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Discount Price (Optional)</label>
                               <div className="relative">
                                  <input 
                                    type="number" 
                                    value={formData.discountPrice}
                                    onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                                    className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-600"
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">ETB</span>
                               </div>
                            </div>
                         </div>
                         
                         <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
                            <span className="text-gray-500">Platform Fee (10%):</span>
                            <span className="font-bold text-red-400">-{Math.round(Number(formData.price) * 0.1)} ETB</span>
                         </div>
                         <div className="flex justify-between items-center text-lg font-black pt-2">
                            <span className="text-gray-900 dark:text-white">Your Earnings:</span>
                            <span className="text-emerald-500">{Math.round(Number(formData.price) * 0.9)} ETB</span>
                         </div>
                      </motion.div>
                    )}
                 </div>

                 <div className="flex justify-between pt-10 mt-auto">
                    <button onClick={handleBack} className="flex items-center gap-2 px-6 py-4 text-gray-500 font-bold hover:text-emerald-600 transition-all">
                       <ChevronLeft size={20} /> Previous
                    </button>
                    <button onClick={handleNext} className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all transform hover:-translate-y-1">
                       Course Settings <ChevronRight size={20} />
                    </button>
                 </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div 
                key="step6" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
                       <div>
                          <p className="font-bold text-gray-900 dark:text-white">Enable Course Discussions</p>
                          <p className="text-xs text-gray-500">Allow students to ask questions and discuss lessons.</p>
                       </div>
                       <input 
                         type="checkbox" 
                         checked={formData.allowDiscussions}
                         onChange={(e) => setFormData({...formData, allowDiscussions: e.target.checked})}
                         className="w-6 h-6 rounded-lg accent-emerald-500"
                       />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
                       <div>
                          <p className="font-bold text-gray-900 dark:text-white">Enable Course Reviews</p>
                          <p className="text-xs text-gray-500">Allow students to rate and review your course after completion.</p>
                       </div>
                       <input 
                         type="checkbox" 
                         checked={formData.allowReviews}
                         onChange={(e) => setFormData({...formData, allowReviews: e.target.checked})}
                         className="w-6 h-6 rounded-lg accent-emerald-500"
                       />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
                       <div>
                          <p className="font-bold text-gray-900 dark:text-white">Issue Professional Certificate</p>
                          <p className="text-xs text-gray-500">Generate a branded certificate for students who finish the course.</p>
                       </div>
                       <input 
                         type="checkbox" 
                         checked={formData.issueCertificate}
                         onChange={(e) => setFormData({...formData, issueCertificate: e.target.checked})}
                         className="w-6 h-6 rounded-lg accent-emerald-500"
                       />
                    </div>
                 </div>

                 <div className="flex justify-between pt-10 mt-auto">
                    <button onClick={handleBack} className="flex items-center gap-2 px-6 py-4 text-gray-500 font-bold hover:text-emerald-600 transition-all">
                       <ChevronLeft size={20} /> Previous
                    </button>
                    <button onClick={handleNext} className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all transform hover:-translate-y-1">
                       Final Review <ChevronRight size={20} />
                    </button>
                 </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div 
                key="step7" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                 <div className="space-y-8">
                    <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/20 text-center relative overflow-hidden">
                       <motion.div 
                         initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}
                         className="relative z-10"
                       >
                          <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={56} />
                          <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">Launch Your Masterpiece!</h3>
                          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-2 max-w-sm mx-auto">Your course is meticulously structured and ready for the world. Review the summary and hit publish.</p>
                       </motion.div>
                       <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[140%] bg-emerald-400 rotate-12 blur-3xl opacity-20" />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="bg-gray-50 dark:bg-gray-800/20 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                             <BookOpen size={18} className="text-emerald-500" /> Essential Details
                          </h4>
                          <div className="space-y-3">
                             <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course Title</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{formData.title}</p>
                             </div>
                             <div className="flex gap-4">
                                <div className="flex-1">
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</p>
                                   <p className="text-sm font-bold text-gray-900 dark:text-white">{formData.category}</p>
                                </div>
                                <div className="flex-1">
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level</p>
                                   <p className="text-sm font-bold text-emerald-600">{formData.level}</p>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="bg-gray-50 dark:bg-gray-800/20 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                             <Trophy size={18} className="text-amber-500" /> Structure & Pricing
                          </h4>
                          <div className="space-y-3">
                             <div className="flex gap-4">
                                <div className="flex-1">
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modules</p>
                                   <p className="text-sm font-bold text-gray-900 dark:text-white">{formData.modules.length}</p>
                                </div>
                                <div className="flex-1">
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Lessons</p>
                                   <p className="text-sm font-bold text-gray-900 dark:text-white">
                                      {formData.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                                   </p>
                                </div>
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Value</p>
                                <p className="text-sm font-bold text-emerald-600">
                                   {formData.isFree ? "Completely Free" : `${formData.price} ETB`}
                                   {!formData.isFree && formData.discountPrice && <span className="ml-2 text-gray-400 line-through text-xs">{formData.discountPrice} ETB</span>}
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-between pt-10 mt-auto">
                    <button onClick={handleBack} className="flex items-center gap-2 px-6 py-4 text-gray-500 font-bold hover:text-emerald-600 transition-all">
                       <ChevronLeft size={20} /> Previous
                    </button>
                    <button 
                      onClick={handlePublish}
                      disabled={isSubmitting}
                      className={`flex items-center gap-3 px-14 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-500/40 hover:bg-emerald-700 transition-all transform hover:scale-105 active:scale-95 group ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                       {isSubmitting ? "Publishing..." : "Publish Course"}
                       {!isSubmitting && <Globe size={20} className="group-hover:rotate-12 transition-transform" />}
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}
