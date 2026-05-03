"use client";

import { 
  FileText, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  ChevronRight,
  Upload,
  Timer,
  Loader2,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlidePanel from "@/components/SlidePanel";
import api from "@/lib/api";

export default function StudentAssessments() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload State
  const [uploadPanel, setUploadPanel] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [submissionType, setSubmissionType] = useState<"file" | "text">("file");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  useEffect(() => {
    api.get("/student/tasks")
      .then(res => setAssessments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Quiz State
  const [quizPanel, setQuizPanel] = useState<any>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [quizStep, setQuizStep] = useState<"intro" | "active" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Timer
  useEffect(() => {
    if (quizStep !== "active" || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(prev => {
      if (prev <= 1) { 
        clearInterval(t); 
        handleQuizSubmit(); 
        return 0; 
      }
      return prev - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [quizStep, timeLeft]);

  const startQuiz = async (assessment: any) => {
    try {
      setQuizPanel(assessment);
      setQuizStep("intro");
      const res = await api.get(`/quizzes/${assessment.id}`);
      setQuizData(res.data);
      setCurrentQ(0);
      setAnswers([]);
      setTimeLeft((res.data.durationMinutes || assessment.timeLimit || 15) * 60);
      setQuizResult(null);
    } catch(err) {
      alert("Failed to load quiz details.");
      setQuizPanel(null);
    }
  };

  const handleAnswer = (optionId: string) => {
    if (!quizData) return;
    const questionId = quizData.questions[currentQ].id;
    const newAnswers = [...answers.filter(a => a.questionId !== questionId), { questionId, selectedOptionId: optionId }];
    setAnswers(newAnswers);
    if (currentQ < quizData.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      handleQuizSubmit(newAnswers);
    }
  };

  const handleQuizSubmit = async (finalAnswers = answers) => {
    if (isSubmittingQuiz || !quizPanel) return;
    setIsSubmittingQuiz(true);
    try {
      const res = await api.post(`/quizzes/${quizPanel.id}/submit`, { answers: finalAnswers });
      setQuizResult(res.data);
      setQuizStep("result");
      setAssessments(prev => prev.map(a => 
        a.id === quizPanel.id 
          ? { ...a, status: res.data.passed ? "completed" : "submitted", score: `${res.data.score}%` } 
          : a
      ));
    } catch(err) {
      alert("Failed to submit quiz.");
      setQuizStep("result");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const [reviewMode, setReviewMode] = useState(false);

  const handleUpload = async () => {
    if (submissionType === "file" && !selectedFile) return;
    if (submissionType === "text" && !textContent.trim()) return;
    
    setIsUploading(true);

    const formData = new FormData();
    if (submissionType === "file" && selectedFile) {
      formData.append("submission", selectedFile);
    } else {
      formData.append("textContent", textContent);
    }
    
    try {
      await api.post(`/student/assignments/${uploadPanel.id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploadDone(true);
      setAssessments(assessments.map(a => a.id === uploadPanel.id ? { ...a, status: "submitted", score: "Pending — Awaiting grade" } : a));
      setTimeout(() => { 
        setUploadPanel(null); 
        setUploadDone(false); 
        setSelectedFile(null); 
        setTextContent("");
      }, 1500);
    } catch (e) {
      alert("Failed to submit assignment.");
    } finally {
      setIsUploading(false);
    }
  };

  const filtered = assessments.filter(a => {
    const matchesTab = activeTab === "all" || a.type === activeTab.slice(0, -1);
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.course.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;


  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments & Quizzes</h1>
          <p className="text-gray-500 mt-2">Track your work, complete quizzes, and submit assignments.</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search..." className="pl-12 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm w-full md:w-64" />
        </div>
      </header>

      {/* STATUS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Completed", value: assessments.filter(a => a.status === "completed").length, bg: "bg-emerald-600", Icon: CheckCircle2 },
          { label: "Pending", value: assessments.filter(a => a.status === "todo" || a.status === "submitted").length, bg: "bg-amber-500", Icon: Clock },
          { label: "Overdue", value: assessments.filter(a => a.date === "Overdue" && a.status === "todo").length, bg: "bg-gray-900 dark:bg-gray-800", Icon: AlertCircle },
        ].map(({ label, value, bg, Icon }) => (
          <div key={label} className={`${bg} p-7 rounded-3xl text-white shadow-xl`}>
            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-4">{label}</h4>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold">{value}</span>
              <Icon size={32} className="opacity-30" />
            </div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-8 border-b border-gray-100 dark:border-gray-800">
        {["all", "quizzes", "assignments"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? "text-emerald-600" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
            {tab}
            {activeTab === tab && <motion.div layoutId="ass-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-4 pb-20">
        {loading ? (
          Array.from({length:3}).map((_,i) => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">No assessments found.</div>
        ) : (
          filtered.map(item => (
            <motion.div key={item.id} whileHover={{ x: 4 }} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-5 group hover:border-emerald-400 transition-all shadow-sm">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.type === "quiz" ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20"}`}>
                {item.type === "quiz" ? <HelpCircle size={24} /> : <FileText size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.course}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${item.status === "completed" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : item.status === "submitted" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20"}`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`text-xs flex items-center gap-1 ${item.date === "Overdue" ? "text-red-500 font-bold" : "text-gray-500"}`}><Clock size={12} /> {item.date}</span>
                  {item.score !== "—" && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> {item.score}</span>}
                </div>
              </div>
              {item.status === "todo" && item.type === "assignment" && (
                <button onClick={() => { setUploadPanel(item); setSelectedFile(null); setUploadDone(false); }} className="shrink-0 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Upload size={14} /> Submit
                </button>
              )}
              {item.status === "todo" && item.type === "quiz" && (
                <button onClick={() => startQuiz(item)} className="shrink-0 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <Timer size={14} /> Start Quiz
                </button>
              )}
              {item.status === "completed" && (
                <button className="shrink-0 p-3 text-gray-300 hover:text-emerald-500 transition-colors"><ChevronRight size={20} /></button>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* UPLOAD SUBMISSION PANEL */}
      <SlidePanel isOpen={!!uploadPanel} onClose={() => setUploadPanel(null)} title="Submit Assignment" subtitle={uploadPanel?.title}>
        {uploadDone ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-5">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Submitted!</h3>
            <p className="text-sm text-gray-500">Your assignment has been sent to the instructor for grading.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-sm text-amber-700 dark:text-amber-400 font-medium tracking-tight">
              <span className="font-bold flex items-center gap-2 mb-1"><AlertCircle size={14} /> Global Deadline: {uploadPanel?.date}</span>
              Please ensure your work is original and high quality.
            </div>

            {/* Submission Type Toggle */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              <button 
                onClick={() => setSubmissionType("file")}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${submissionType === "file" ? "bg-white dark:bg-[#111] text-blue-600 shadow-sm" : "text-gray-400"}`}
              >
                FILE UPLOAD
              </button>
              <button 
                onClick={() => setSubmissionType("text")}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${submissionType === "text" ? "bg-white dark:bg-[#111] text-blue-600 shadow-sm" : "text-gray-400"}`}
              >
                TEXT SUBMISSION
              </button>
            </div>

            {submissionType === "file" ? (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">Upload Document *</label>
                <label className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${selectedFile ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-200 dark:border-gray-800 hover:border-blue-400"}`}>
                  <Upload size={32} className={selectedFile ? "text-blue-500" : "text-gray-300"} />
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="font-bold text-blue-700 dark:text-blue-400">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-gray-500 tracking-tight">Select file or drag & drop</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">PDF, DOCX, ZIP — Max 5MB</p>
                    </>
                  )}
                  <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">Text Submission *</label>
                <textarea 
                  rows={10} 
                  value={textContent}
                  onChange={e => setTextContent(e.target.value)}
                  placeholder="Type or paste your assignment content here..." 
                  className="w-full p-5 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none text-sm font-medium leading-relaxed" 
                />
              </div>
            )}

            <div className="pt-4">
              <button 
                onClick={handleUpload} 
                disabled={isUploading || (submissionType === "file" ? !selectedFile : !textContent.trim())} 
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Submit Assignment"}
              </button>
            </div>
          </div>
        )}
      </SlidePanel>

      {/* QUIZ PANEL */}
      <AnimatePresence>
        {quizPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-[#111] rounded-3xl w-full max-w-xl shadow-2xl p-8 relative">
              <button onClick={() => setQuizPanel(null)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>

              {quizStep === "intro" && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto">
                    <HelpCircle size={32} className="text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{quizPanel.title}</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center">
                      <p className="text-gray-400 font-medium mb-1">Questions</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{quizData?.questions?.length || quizPanel.questions}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-center">
                      <p className="text-purple-400 font-medium mb-1">Time Limit</p>
                      <p className="text-2xl font-black text-purple-600">{quizPanel.timeLimit || 15} min</p>
                    </div>
                  </div>
                  <button onClick={() => setQuizStep("active")} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors">Start Quiz</button>
                </div>
              )}

              {quizStep === "active" && quizData && (
                <div className="space-y-8">
                  {/* Expert Navigation Grid */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quizData.questions.map((_:any, i:number) => (
                      <button 
                        key={i} 
                        onClick={() => setCurrentQ(i)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border ${
                          currentQ === i 
                            ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/10" 
                            : answers.some(a => a.questionId === quizData.questions[i].id)
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                            : "bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-black uppercase text-gray-500 tracking-widest">Question {currentQ + 1} of {quizData.questions.length}</span>
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black ${timeLeft < 60 ? "text-red-500 bg-red-50 animate-pulse" : "text-purple-600 bg-purple-50 dark:bg-purple-900/20"}`}>
                      <Timer size={14} /> <span>{fmt(timeLeft)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">{quizData.questions[currentQ].text}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {quizData.questions[currentQ].options.map((opt: any, i: number) => {
                        const isSelected = answers.find(a => a.questionId === quizData.questions[currentQ].id)?.selectedOptionId === opt.id;
                        return (
                          <button 
                            key={opt.id} 
                            onClick={() => {
                              const newAnswers = [...answers.filter(a => a.questionId !== quizData.questions[currentQ].id), { questionId: quizData.questions[currentQ].id, selectedOptionId: opt.id }];
                              setAnswers(newAnswers);
                            }} 
                            className={`w-full text-left p-5 rounded-2xl font-bold border-2 transition-all flex items-center gap-4 ${
                              isSelected 
                                ? "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300 shadow-sm" 
                                : "bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-purple-200 dark:hover:border-purple-800"
                            }`}
                          >
                            <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all ${isSelected ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}>
                              {["A", "B", "C", "D", "E"][i]}
                            </span>
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button 
                      disabled={currentQ === 0}
                      onClick={() => setCurrentQ(prev => prev - 1)}
                      className="flex-1 py-4 text-sm font-bold border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-30"
                    >
                      Previous
                    </button>
                    {currentQ < quizData.questions.length - 1 ? (
                      <button 
                        onClick={() => setCurrentQ(prev => prev + 1)}
                        className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:opacity-90 transition-all"
                      >
                        Next Question
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleQuizSubmit()}
                        disabled={isSubmittingQuiz}
                        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        {isSubmittingQuiz ? <Loader2 size={18} className="animate-spin" /> : "Finish & Submit"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {quizStep === "result" && quizResult && (
                <div className="space-y-8 py-4">
                  {!reviewMode ? (
                    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                      <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl shadow-xl ${quizResult.passed ? "bg-emerald-50 text-emerald-600 shadow-emerald-500/10" : "bg-red-50 text-red-600 shadow-red-500/10"}`}>
                        {quizResult.passed ? "✨" : "💡"}
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                          {quizResult.passed ? "Certified!" : "Keep Learning"}
                        </h2>
                        <p className="text-gray-500 font-medium">You scored {quizResult.score}% on this attempt.</p>
                      </div>
                      <div className="p-10 bg-gray-50 dark:bg-[#151515] rounded-[2rem] border border-gray-100 dark:border-gray-800">
                        <p className={`text-7xl font-black ${quizResult.passed ? "text-emerald-500" : "text-amber-500"}`}>{quizResult.score}%</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Calculated Accuracy Score</p>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => setReviewMode(true)} className="flex-1 py-5 bg-white border-2 border-gray-100 dark:bg-transparent dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-50 transition-all">Review Mode</button>
                        <button onClick={() => setQuizPanel(null)} className="flex-1 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:opacity-90 transition-all">Go to Home</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-[#0d0d0d] pb-4 z-10 border-b border-gray-100 dark:border-gray-800">
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest">Expert Review Mode</h4>
                        <button onClick={() => setReviewMode(false)} className="text-xs font-bold text-purple-600 hover:underline">Back to Summary</button>
                      </div>
                      {quizResult.results.map((res: any, i: number) => (
                        <div key={i} className={`p-6 rounded-[1.5rem] border-2 transition-all ${res.isCorrect ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/5 dark:border-emerald-900/30" : "bg-red-50/50 border-red-100 dark:bg-red-900/5 dark:border-red-900/30"}`}>
                          <div className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${res.isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <p className="font-bold text-gray-900 dark:text-white">{res.questionText}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                  <p className="text-gray-400 font-bold mb-1 uppercase tracking-widest text-[8px]">Your Answer</p>
                                  <p className={res.isCorrect ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                                    {quizData.questions.find((q:any) => q.id === res.questionId)?.options.find((o:any) => o.id === res.selectedOptionId)?.text || "No answer"}
                                  </p>
                                </div>
                                {!res.isCorrect && (
                                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                                    <p className="text-emerald-500 font-bold mb-1 uppercase tracking-widest text-[8px]">Correct Answer</p>
                                    <p className="text-emerald-600 font-bold">
                                      {quizData.questions.find((q:any) => q.id === res.questionId)?.options.find((o:any) => o.id === res.correctOptionId)?.text}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Expert Explanation</p>
                                <p className="text-[13px] text-gray-600 dark:text-gray-400 italic font-medium leading-relaxed">"{res.explanation}"</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
