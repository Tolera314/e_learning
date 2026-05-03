"use client";

import { useState, useEffect } from "react";
import { 
   ChevronLeft, 
   Plus,
   Clock,
   Target,
   MoreVertical,
   Trash2,
   Edit3,
   CheckCircle2
} from "lucide-react";
import Link from "next/link";
import SlidePanel from "@/components/SlidePanel";
import { useParams } from "next/navigation";
import api from "@/lib/api";

export default function CourseQuizzes() {
  const params = useParams();
  const courseId = params?.id as string;
  
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchQuizzes();
    }
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/quizzes/instructor/course/${courseId}`);
      setQuizzes(data);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeQuiz) {
       setQuestions(activeQuiz.questions || []);
    }
  }, [activeQuiz]);

  // Panel States
  const [isQuizPanelOpen, setIsQuizPanelOpen] = useState(false);
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(false);

  // Forms
  const [quizForm, setQuizForm] = useState({ title: "", timeLimit: "30", passingScore: "70", lessonId: "" });
  const [questionForm, setQuestionForm] = useState({ text: "", options: ["", "", "", ""], correctIndex: 0 });

  const handleCreateQuiz = () => {
    setQuizForm({ title: "", timeLimit: "30", passingScore: "70", lessonId: "" });
    setIsQuizPanelOpen(true);
  };

  const handleSaveQuiz = async () => {
     if (!quizForm.title) return alert("Title is required");
     try {
       await api.post("/quizzes/instructor", {
         ...quizForm,
         durationMinutes: Number(quizForm.timeLimit),
         questions: [] // Initially empty, questions added later
       });
       fetchQuizzes();
       setIsQuizPanelOpen(false);
     } catch (err) {
       alert("Failed to create quiz");
     }
  };

  const handleAddQuestion = () => {
     setQuestionForm({ text: "", options: ["", "", "", ""], correctIndex: 0 });
     setIsQuestionPanelOpen(true);
  };

  const handleSaveQuestion = async () => {
     if (!questionForm.text || questionForm.options.some(o => !o)) return alert("All fields are required");
     setQuestions([...questions, { 
       text: questionForm.text, 
       options: questionForm.options.map((o, i) => ({ text: o, isCorrect: i === questionForm.correctIndex })),
       id: `temp-${Date.now()}` 
     }]);
     setIsQuestionPanelOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 mt-10">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
           <Link href="/dashboard/instructor/courses" className="p-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 hover:text-emerald-600 transition-colors shadow-sm">
              <ChevronLeft size={20} />
           </Link>
           <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Management</h1>
             <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Advanced Calculus G12</span>
             </p>
           </div>
        </div>
        {!activeQuiz && (
          <button 
            onClick={handleCreateQuiz}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
          >
            <Plus size={20} /> Create Quiz
          </button>
        )}
      </header>

      {/* WORKSPACE */}
      {!activeQuiz ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
               <div key={quiz.id} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col hover:shadow-lg transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                     <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg ${quiz.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                        {quiz.status}
                     </span>
                     <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><MoreVertical size={18} /></button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 line-clamp-2">{quiz.title}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6 mt-auto border-t border-gray-50 dark:border-gray-800/50 pt-6">
                     <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1.5"><Clock size={12}/> Time Limit</p>
                        <p className="font-bold text-gray-900 dark:text-white">{quiz.timeLimit} mins</p>
                     </div>
                     <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1.5"><Target size={12}/> Passing Score</p>
                        <p className="font-bold text-emerald-600">{quiz.passingScore}%</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => setActiveQuiz(quiz)} 
                     className="w-full py-3.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-emerald-900/30 rounded-xl font-bold transition-colors"
                  >
                     Manage {quiz._count?.questions || 0} Questions
                  </button>
               </div>
            ))}
         </div>
      ) : (
         <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6 mb-8">
               <div>
                  <button onClick={() => setActiveQuiz(null)} className="text-sm font-bold text-gray-400 hover:text-emerald-600 transition-colors mb-2 flex items-center gap-1">
                     <ChevronLeft size={16} /> Back to Quizzes
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeQuiz.title}</h2>
               </div>
               <button onClick={handleAddQuestion} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-black rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                  <Plus size={16} /> Add Question
               </button>
            </div>

            <div className="space-y-6">
               {questions.map((q, i) => (
                  <div key={q.id} className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                     <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg"><span className="text-emerald-500 mr-2">Q{i+1}.</span> {q.text}</h3>
                        <div className="flex gap-2">
                           <button className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg transition-colors"><Edit3 size={16} /></button>
                           <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                     </div>
                     <div className="grid sm:grid-cols-2 gap-3">
                         {q.options.map((opt: { text: string; isCorrect: boolean }, idx: number) => (
                            <div key={idx} className={`p-4 rounded-xl border ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 font-bold flex justify-between' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300'}`}>
                               {opt.text}
                               {opt.isCorrect && <CheckCircle2 size={18} className="text-emerald-500" />}
                            </div>
                         ))}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* PANELS */}
      <SlidePanel isOpen={isQuizPanelOpen} onClose={() => setIsQuizPanelOpen(false)} title="Create New Quiz">
         <div className="space-y-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quiz Title *</label>
               <input 
                  type="text" 
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                  className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Time Limit (Mins)</label>
                  <input 
                     type="number" 
                     value={quizForm.timeLimit}
                     onChange={(e) => setQuizForm({...quizForm, timeLimit: e.target.value})}
                     className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Passing Score (%)</label>
                  <input 
                     type="number" 
                     value={quizForm.passingScore}
                     onChange={(e) => setQuizForm({...quizForm, passingScore: e.target.value})}
                     className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-emerald-200 dark:border-emerald-800/30 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-600"
                  />
               </div>
            </div>
            <button onClick={handleSaveQuiz} className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors">
               Save Quiz Configuration
            </button>
         </div>
      </SlidePanel>

      <SlidePanel isOpen={isQuestionPanelOpen} onClose={() => setIsQuestionPanelOpen(false)} title="Question Editor">
         <div className="space-y-8">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Question Text *</label>
               <textarea 
                  rows={3}
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})}
                  className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white resize-none"
               />
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Answers (Select Correct One) *</label>
               <div className="space-y-3">
                  {[0,1,2,3].map(index => (
                     <div key={index} className="flex gap-3 items-center">
                        <input 
                           type="radio" 
                           name="correctOption" 
                           checked={questionForm.correctIndex === index}
                           onChange={() => setQuestionForm({...questionForm, correctIndex: index})}
                           className="w-5 h-5 accent-emerald-600"
                        />
                        <input 
                           type="text" 
                           placeholder={`Option ${index + 1}`}
                           value={questionForm.options[index]}
                           onChange={(e) => {
                              const newOpts = [...questionForm.options];
                              newOpts[index] = e.target.value;
                              setQuestionForm({...questionForm, options: newOpts});
                           }}
                           className={`flex-1 p-3 bg-white dark:bg-[#111] border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 ${questionForm.correctIndex === index ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'}`}
                        />
                     </div>
                  ))}
               </div>
            </div>

            <button onClick={handleSaveQuestion} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-[1.02] transition-transform">
               Add Question to Quiz
            </button>
         </div>
      </SlidePanel>
    </div>
  );
}
