"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import api from "@/lib/api";

interface QuestionOption {
  id: string;
  text: string;
  questionId: string;
}

interface Question {
  id: string;
  text: string;
  points: number;
  options: QuestionOption[];
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  durationMinutes: number | null;
  questions: Question[];
}

export default function QuizPlayer({ quizId, onComplete }: { quizId: string, onComplete?: () => void }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || result) return;
    
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const fetchQuiz = async () => {
    try {
      const { data } = await api.get(`/quizzes/${quizId}`);
      setQuiz(data);
      if (data.durationMinutes) {
        setTimeLeft(data.durationMinutes * 60);
      }
    } catch (error) {
      console.error("Failed to fetch quiz", error);
    }
  };

  const handleSelect = (questionId: string, optionId: string) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || result) return;
    setIsSubmitting(true);

    try {
      const payload = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId
      }));

      const { data } = await api.post(`/quizzes/${quizId}/submit`, { answers: payload });
      setResult(data);
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Failed to submit quiz", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!quiz) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading quiz...</div>;

  if (result) {
    return (
      <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center shadow-lg">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {result.passed ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {result.passed ? 'Quiz Passed!' : 'Quiz Failed'}
        </h2>
        <p className="text-gray-500 mb-8">
          You scored <span className="font-bold text-gray-900 dark:text-gray-100">{result.score}%</span>. 
          The passing score was {quiz.passingScore}%.
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl inline-block text-left w-full max-w-md mx-auto">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Submission Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Correct Answers</span>
              <span className="font-bold text-gray-900 dark:text-white hidden">N/A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Maximum Potential Score</span>
              <span className="font-bold text-gray-900 dark:text-white">{result.maxScore} points</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full max-h-[80vh]">
      {/* Quiz Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{quiz.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{quiz.questions.length} questions • {quiz.passingScore}% to pass</p>
        </div>
        
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${timeLeft < 60 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
            <Clock size={18} />
            <span className="tracking-widest">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Questions Scroll Area */}
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-10">
        {quiz.questions.map((q, qIdx) => (
          <div key={q.id}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              <span className="text-emerald-600 mr-2">{qIdx + 1}.</span> {q.text}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{q.points} point{q.points > 1 ? 's' : ''}</p>
            
            <div className="space-y-3">
              {q.options.map(opt => (
                <label 
                  key={opt.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    answers[q.id] === opt.id 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                      : 'border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => handleSelect(q.id, opt.id)}
                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <span className={`text-sm ${answers[q.id] === opt.id ? 'font-medium text-emerald-900 dark:text-emerald-100' : 'text-gray-700 dark:text-gray-300'}`}>
                    {opt.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111]">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle size={16} />
            <span>Ensure all questions are answered before submitting.</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? 'Evaluating...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
