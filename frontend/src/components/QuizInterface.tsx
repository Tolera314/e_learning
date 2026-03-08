"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  RefreshCcw,
  ArrowRight,
  X
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizInterfaceProps {
  title: string;
  questions: Question[];
  durationMinutes: number;
  onComplete: (score: number) => void;
}

export default function QuizInterface({ title, questions, durationMinutes, onComplete }: QuizInterfaceProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleFinish();
    }
  }, [timeLeft, isFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (optionIdx: number) => {
    setAnswers({ ...answers, [questions[currentQuestionIdx].id]: optionIdx });
  };

  const handleFinish = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setIsFinished(true);
    onComplete(finalScore);
  };

  if (isFinished && !showReview) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#111] rounded-[3rem] p-12 text-center shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden"
      >
        {/* Confetti-like effect background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-400 rounded-full blur-3xl animate-pulse" />
           <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${score >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
          {score >= 80 ? <Trophy size={48} /> : <AlertCircle size={48} />}
        </div>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{score >= 80 ? "Excellent Work!" : "Good Effort!"}</h2>
        <p className="text-gray-500 font-medium mb-10">You scored {score}% in the {title}</p>
        
        <div className="grid grid-cols-2 gap-6 mb-12 max-w-sm mx-auto">
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl">
             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Duration</p>
             <p className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(durationMinutes * 60 - timeLeft)}</p>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl">
             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Status</p>
             <p className={`text-xl font-bold ${score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{score >= 80 ? "Passed" : "Needs Review"}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <button 
             onClick={() => { setShowReview(true); setCurrentQuestionIdx(0); }}
             className="px-10 py-4 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
           >
              Review Answers
           </button>
           <button className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
              Next Lesson <ArrowRight size={18} />
           </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-500 font-medium">Question {currentQuestionIdx + 1} of {questions.length}</p>
        </div>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-lg ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}`}>
          <Clock size={20} /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-12 overflow-hidden">
        <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
           className="h-full bg-emerald-500 rounded-full"
        />
      </div>

      {/* QUESTION CARD */}
      <motion.div 
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-[#111] rounded-[3rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-10 leading-relaxed">
           {currentQuestion.text}
        </h3>

        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => !isFinished && handleSelect(idx)}
              disabled={isFinished}
              className={`w-full p-6 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between group ${
                answers[currentQuestion.id] === idx 
                ? (isFinished ? (idx === currentQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400' : 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400') : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400')
                : (isFinished && idx === currentQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400' : 'border-gray-50 dark:border-gray-800 hover:border-emerald-500/50 text-gray-700 dark:text-gray-300')
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${answers[currentQuestion.id] === idx ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                {option}
              </div>
          {answers[currentQuestion.id] === idx && (isFinished ? (idx === currentQuestion.correctAnswer ? <CheckCircle2 size={20} /> : <X size={20} />) : <CheckCircle2 size={20} />)}
          {isFinished && idx === currentQuestion.correctAnswer && answers[currentQuestion.id] !== idx && <CheckCircle2 size={20} />}
        </button>
      ))}
    </div>

    {isFinished && currentQuestion.explanation && (
       <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-500/20"
       >
          <div className="flex items-center gap-2 mb-2 text-emerald-600">
             <AlertCircle size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Explanation</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
             {currentQuestion.explanation}
          </p>
       </motion.div>
    )}
  </motion.div>

      {/* NAVIGATION */}
      <div className="flex items-center justify-between mt-12">
        <button
          onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIdx === 0}
          className="flex items-center gap-2 text-gray-400 font-bold hover:text-emerald-600 disabled:opacity-0 transition-all font-outfit"
        >
          <ChevronLeft size={20} /> Previous
        </button>
        
        {isFinished ? (
           <div className="flex gap-4">
              <button
                onClick={() => setShowReview(false)}
                className="px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all"
              >
                Back to Results
              </button>
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIdx === questions.length - 1}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 transition-all disabled:opacity-0"
              >
                 Next Question <ChevronRight size={20} />
              </button>
           </div>
        ) : (
          currentQuestionIdx === questions.length - 1 ? (
            <button
              onClick={handleFinish}
              disabled={Object.keys(answers).length < questions.length}
              className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={answers[currentQuestion.id] === undefined}
              className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-black hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              Next Question <ChevronRight size={20} />
            </button>
          )
        )}
      </div>
    </div>
  );
}
