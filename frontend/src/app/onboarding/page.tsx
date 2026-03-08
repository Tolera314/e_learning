"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  User, 
  BookOpen, 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Camera,
  GraduationCap,
  MessageSquare,
  Upload,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const REGIONS = [
  "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", 
  "Gambela", "Harari", "Oromia", "Sidama", "Somali", "South Ethiopia", 
  "Central Ethiopia", "South West Ethiopia", "Tigray"
];

const SUBJECTS = [
  "Mathematics", "Physics", "Biology", "Chemistry", "English", 
  "Programming", "Social Studies", "Economics", "History", "Civics"
];

export default function Onboarding() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    gender: "",
    dob: "",
    region: "",
    educationLevel: "",
    currentGrade: "",
    universityName: "",
    fieldOfStudy: "",
    yearOfStudy: "",
    subjectsOfInterest: [],
    parentName: "",
    parentPhone: "",
    // Instructor specific
    highestEducation: "",
    teachingExperience: "",
    bio: "",
    subjects: [],
    languagePreference: "English",
    degreeFile: null,
    degreeFileName: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/login");
    }
  }, [router]);

  if (!user) return null;

  const role = user.role;
  const totalSteps = role === "STUDENT" ? 5 : 5;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({
        ...prev,
        degreeFile: file,
        degreeFileName: file.name
      }));
    }
  };

  const handleToggleSubject = (subject: string) => {
    const field = role === "STUDENT" ? "subjectsOfInterest" : "subjects";
    setFormData((prev: any) => {
      const current = prev[field] || [];
      const updated = current.includes(subject) 
        ? current.filter((s: string) => s !== subject)
        : [...current, subject];
      return { ...prev, [field]: updated };
    });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // In a real app, you'd use FormData to upload the file
      const body = { 
        userId: user.id, 
        ...formData,
        // For now we just send the file name, in real use we'd upload the file separately
        degreeFile: formData.degreeFileName 
      };

      const response = await fetch("http://localhost:8000/api/auth/complete-onboarding", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Onboarding failed");

      const updatedUser = { ...user, onboardingCompleted: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      if (role === "INSTRUCTOR") {
        setStep(6); // Show approval message
      } else {
        router.push("/dashboard/student");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => (
    <div className="max-w-md mx-auto mb-12">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Step {step} of {totalSteps}</span>
        <span className="text-xs font-medium text-gray-400 capitalize">{role.toLowerCase()} profile</span>
      </div>
      <div className="flex gap-2 h-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i + 1 <= step ? "bg-emerald-500" : "bg-gray-100 dark:bg-gray-800"}`} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {step <= totalSteps && renderProgress()}

        <AnimatePresence mode="wait">
          {/* STEP 1: BASIC PROFILE (Both) */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <User size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Basic Information</h2>
              <p className="text-gray-500 mb-8">Let's start with some basic details about you.</p>

              <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                   <div className="grid grid-cols-2 gap-4">
                      {["Male", "Female"].map(g => (
                        <button key={g} onClick={() => setFormData({...formData, gender: g})} className={`py-3 rounded-xl border-2 transition-all font-medium ${formData.gender === g ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "border-gray-100 dark:border-gray-800 text-gray-500"}`}>
                          {g}
                        </button>
                      ))}
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                   <input type="date" name="dob" value={formData.dob || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white" />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Region in Ethiopia</label>
                   <select name="region" value={formData.region || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white">
                     <option value="">Select Region</option>
                     {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                 </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                  Next Step <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: EDUCATION LEVEL (Student) / PROFESSIONAL (Instructor) */}
          {step === 2 && role === "STUDENT" && (
            <motion.div key="edu-student" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Education Details</h2>
              <p className="text-gray-500 mb-8">Tell us about your current academic status.</p>

              <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Educational Level</label>
                   <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: "KG_G5", label: "Primary (KG - Grade 5)" },
                        { id: "G6_G12", label: "Secondary (Grade 6 - Grade 12)" },
                        { id: "UNIVERSITY", label: "University / College" }
                      ].map(l => (
                        <button key={l.id} onClick={() => setFormData({...formData, educationLevel: l.id})} className={`p-4 text-left rounded-xl border-2 transition-all font-medium ${formData.educationLevel === l.id ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20" : "border-gray-100 dark:border-gray-800 text-gray-500"}`}>
                          {l.label}
                        </button>
                      ))}
                   </div>
                </div>

                {formData.educationLevel === "G6_G12" && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Grade</label>
                    <select name="currentGrade" value={formData.currentGrade || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white">
                      <option value="">Select Grade</option>
                      {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                  </motion.div>
                )}

                {formData.educationLevel === "UNIVERSITY" && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-4">
                    <input name="universityName" placeholder="University Name" value={formData.universityName || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white" />
                    <input name="fieldOfStudy" placeholder="Field of Study" value={formData.fieldOfStudy || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white" />
                  </motion.div>
                )}
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="px-6 py-3 text-gray-500 font-bold hover:text-emerald-600 transition-colors">Back</button>
                <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors">Next Stage</button>
              </div>
            </motion.div>
          )}

          {step === 2 && role === "INSTRUCTOR" && (
            <motion.div key="prof-instructor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Professional Profile</h2>
              <p className="text-gray-500 mb-8">Highlight your expertise as an educator.</p>

              <div className="space-y-6">
                 <input name="highestEducation" placeholder="Highest Educational Qualification (e.g., MSc in Physics)" value={formData.highestEducation || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white" />
                 <input name="teachingExperience" type="number" placeholder="Years of Teaching Experience" value={formData.teachingExperience || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white" />
                 <textarea name="bio" rows={4} placeholder="Tell students about yourself and your teaching style..." value={formData.bio || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl resize-none text-gray-900 dark:text-white" />
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="px-6 py-3 text-gray-500 font-bold">Back</button>
                <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold">Next Stage</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PREFERENCES (Both) */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Heart size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Subject Interests</h2>
              <p className="text-gray-500 mb-8">What topics are you most interested in?</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SUBJECTS.map(s => {
                  const isSelected = role === "STUDENT" ? (formData.subjectsOfInterest || []).includes(s) : (formData.subjects || []).includes(s);
                  return (
                    <button key={s} onClick={() => handleToggleSubject(s)} className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${isSelected ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20" : "border-gray-100 dark:border-gray-800 text-gray-500"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="px-6 py-3 text-gray-500 font-bold">Back</button>
                <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold">Continue</button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PARENT INFO (Student) / VERIFICATION (Instructor) */}
          {step === 4 && role === "STUDENT" && (
            <motion.div key="parent-info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Parental Information</h2>
              <p className="text-gray-500 mb-8">Required for students under Grade 9 for progress tracking.</p>

              <div className="space-y-6">
                <input name="parentName" placeholder="Parent / Guardian Name" value={formData.parentName || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white" />
                <input name="parentPhone" placeholder="Parent Contact Number" value={formData.parentPhone || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white" />
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="px-6 py-3 text-gray-500 font-bold">Back</button>
                <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold">Almost Done</button>
              </div>
            </motion.div>
          )}

          {step === 4 && role === "INSTRUCTOR" && (
            <motion.div key="verif-instructor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Documents</h2>
              <p className="text-gray-500 mb-8">Upload your teaching credentials for verification.</p>

              <div className="space-y-6">
                 <input 
                    type="file" 
                    id="degree-upload" 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                 />
                 <label 
                    htmlFor="degree-upload"
                    className="block border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/10 transition-all group"
                 >
                    <Upload className="mx-auto text-gray-400 group-hover:text-emerald-500 mb-4 transition-colors" size={40} />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                       {formData.degreeFileName ? `Selected: ${formData.degreeFileName}` : "Click to upload your Degree (PDF/JPG)"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Maximum file size: 5MB</p>
                 </label>
                 
                 <div className="flex items-center gap-4">
                    <input type="checkbox" checked={formData.liveAvailability || false} onChange={(e) => setFormData({...formData, liveAvailability: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
                    <label className="text-sm text-gray-700 dark:text-gray-300">I am available for Live Teaching sessions.</label>
                 </div>
              </div>

              <div className="mt-10 flex justify-between">
                <button onClick={prevStep} className="px-6 py-3 text-gray-500 font-bold">Back</button>
                <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-sm">Review & Finish</button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: FINAL (Both) */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111] p-10 rounded-3xl border border-gray-100 dark:border-gray-800 text-center shadow-xl">
               <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <ShieldCheck size={40} />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to Start!</h2>
               <p className="text-gray-500 mb-10">By clicking finish, your profile will be created and your {role === "STUDENT" ? "3-day free trial" : "application"} will be activated.</p>

               <div className="space-y-4">
                 <button onClick={handleSubmit} disabled={loading} className="w-full flex justify-center py-4 px-4 bg-emerald-600 text-white rounded-xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-colors gap-3 items-center">
                    {loading ? <Loader2 className="animate-spin" /> : <>Finish Onboarding <CheckCircle2 size={20} /></>}
                 </button>
                 <button onClick={prevStep} className="w-full py-4 text-gray-500 font-bold">Wait, I want to change something</button>
               </div>
            </motion.div>
          )}

          {/* STEP 6: INSTRUCTOR APPROVAL PENDING */}
          {step === 6 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111] p-10 rounded-3xl border border-gray-100 dark:border-gray-800 text-center shadow-xl">
               <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <MessageSquare size={40} />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Received</h2>
               <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                 Your instructor application is under review. Our team will verify your credentials within 24-48 hours.
               </p>
               <button onClick={() => router.push("/dashboard/instructor")} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold">Go to Instructor Dashboard</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
