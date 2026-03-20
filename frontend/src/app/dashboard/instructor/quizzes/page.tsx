"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, BookOpen, ChevronLeft } from "lucide-react";
import api from "@/lib/api";

export default function InstructorQuizzesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const [quizData, setQuizData] = useState({
    lessonId: "",
    title: "",
    passingScore: 70,
    durationMinutes: 10,
    questions: [
      {
        text: "",
        points: 1,
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false }
        ]
      }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/instructor/courses');
      setCourses(data.courses || data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const fetchLessons = async (courseId: string) => {
    if (!courseId) return setLessons([]);
    try {
      const { data } = await api.get(`/instructor/courses/${courseId}`);
      if (data && data.modules) {
        const extractedLessons = data.modules.flatMap((m: any) => m.lessons);
        setLessons(extractedLessons);
      }
    } catch (err) {
      console.error("Failed to fetch lessons", err);
    }
  };

  const handleCourseChange = (e: any) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    setQuizData(prev => ({ ...prev, lessonId: "" }));
    fetchLessons(courseId);
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { text: "", points: 1, options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }
      ]
    }));
  };

  const addOption = (qIdx: number) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIdx].options.push({ text: "", isCorrect: false });
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const setCorrectOption = (qIdx: number, oIdx: number) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIdx].options.forEach((opt, idx) => {
      opt.isCorrect = (idx === oIdx);
    });
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleSave = async () => {
    if (!quizData.lessonId || !quizData.title) {
      alert("Please select a lesson and provide a title.");
      return;
    }
    setLoading(true);
    setSuccess("");
    try {
      await api.post('/quizzes/instructor', quizData);
      setSuccess("Quiz created successfully!");
      setIsCreating(false);
      // Reset form
      setQuizData({
        lessonId: "",
        title: "",
        passingScore: 70,
        durationMinutes: 10,
        questions: [{ text: "", points: 1, options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }]
      });
      setSelectedCourseId("");
    } catch (error) {
      console.error("Failed to save quiz", error);
      alert("Error saving quiz. Make sure all fields are filled.");
    } finally {
      setLoading(false);
    }
  };

  if (isCreating) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <header className="flex items-center gap-4">
          <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Quiz</h1>
            <p className="text-gray-500 mt-1">Design your assessment and assign it to a lesson.</p>
          </div>
        </header>

        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Basic Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={handleCourseChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Choose Course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Lesson</label>
              <select
                value={quizData.lessonId}
                onChange={(e) => setQuizData({ ...quizData, lessonId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] focus:ring-2 focus:ring-emerald-500 outline-none"
                disabled={!selectedCourseId}
              >
                <option value="">-- Choose Lesson --</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quiz Title</label>
              <input
                type="text"
                value={quizData.title}
                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                placeholder="e.g. Chapter 1 Assessment"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (Minutes)</label>
              <input
                type="number"
                value={quizData.durationMinutes || ''}
                onChange={(e) => setQuizData({ ...quizData, durationMinutes: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passing Score (%)</label>
              <input
                type="number"
                value={quizData.passingScore}
                onChange={(e) => setQuizData({ ...quizData, passingScore: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Questions Inventory</h2>
          
          {quizData.questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white dark:bg-[#111] p-6 rounded-2xl shadow-sm border-l-4 border-l-emerald-500 border border-gray-100 dark:border-gray-800 relative group/q">
              <div className="absolute top-4 right-4">
                {quizData.questions.length > 1 && (
                  <button 
                    onClick={() => setQuizData(prev => ({...prev, questions: prev.questions.filter((_, i) => i !== qIdx)}))}
                    className="text-gray-400 hover:text-rose-500 p-2 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="flex items-start gap-4 mb-6 pr-12">
                <span className="bg-emerald-100 text-emerald-600 font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                  {qIdx + 1}
                </span>
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    placeholder="Enter your question here..."
                    value={q.text}
                    onChange={(e) => {
                      const newQs = [...quizData.questions];
                      newQs[qIdx].text = e.target.value;
                      setQuizData({...quizData, questions: newQs});
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] font-medium outline-none focus:border-emerald-500 transition-colors"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Points potential:</span>
                    <input
                      type="number"
                      value={q.points}
                      onChange={(e) => {
                        const newQs = [...quizData.questions];
                        newQs[qIdx].points = Number(e.target.value);
                        setQuizData({...quizData, questions: newQs});
                      }}
                      className="w-20 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pl-12 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Answer Options</h4>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${qIdx}`}
                      checked={opt.isCorrect}
                      onChange={() => setCorrectOption(qIdx, oIdx)}
                      className="w-5 h-5 text-emerald-600 cursor-pointer focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${oIdx + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const newQs = [...quizData.questions];
                        newQs[qIdx].options[oIdx].text = e.target.value;
                        setQuizData({...quizData, questions: newQs});
                      }}
                      className={`flex-1 px-4 py-2 rounded-xl border transition-all outline-none ${opt.isCorrect ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-900 dark:text-emerald-100 font-medium' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111]'}`}
                    />
                    {q.options.length > 2 && (
                      <button 
                        onClick={() => {
                          const newQs = [...quizData.questions];
                          newQs[qIdx].options = newQs[qIdx].options.filter((_, i) => i !== oIdx);
                          setQuizData({...quizData, questions: newQs});
                        }}
                        className="text-gray-400 hover:text-rose-500 p-2"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button 
                  onClick={() => addOption(qIdx)}
                  className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:text-emerald-700 mt-2 transition-colors"
                >
                  <Plus size={14} /> Add Option
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={addQuestion}
            className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex items-center justify-center gap-2 text-gray-400 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all font-bold group"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" /> 
            Add Next Question
          </button>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleSave}
            disabled={loading || !selectedCourseId || !quizData.lessonId || !quizData.title}
            className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform hover:-translate-y-1"
          >
            {loading ? 'Publishing...' : <><Save size={20} /> Publish Assessment</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quizzes & Assessments</h1>
          <p className="text-gray-500 mt-2">Manage course examinations and track student performance.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:-translate-y-1 transition-all"
        >
          <Plus size={24} />
          Create New Quiz
        </button>
      </header>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <BookOpen /> {success}
        </div>
      )}

      {/* Simplified Dashboard Grid for Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* If we had a list of existing quizzes, we'd map them here */}
        <div className="col-span-full py-20 text-center bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-gray-800 border-dashed">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <Plus size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Quizzes Created</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">Start by creating your first assessment to measure student understanding.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
