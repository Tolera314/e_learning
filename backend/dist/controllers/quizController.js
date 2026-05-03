"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizSubmissions = exports.submitQuiz = exports.getQuiz = exports.getMyQuizzes = exports.createQuiz = void 0;
const prisma_1 = require("../utils/prisma");
/**
 * INSTRUCTOR: Create a new Quiz
 */
const createQuiz = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { lessonId, title, passingScore, durationMinutes, questions } = req.body;
        // Validate lesson belongs to instructor
        const lesson = await prisma_1.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { include: { course: true } } }
        });
        if (!lesson || lesson.module.course.instructorId !== instructorId) {
            return res.status(403).json({ error: 'Unauthorized to add quiz to this course' });
        }
        const quiz = await prisma_1.prisma.quiz.create({
            data: {
                lessonId,
                title,
                passingScore: Number(passingScore) || 50,
                durationMinutes: Number(durationMinutes) || null,
                questions: {
                    create: questions.map((q) => ({
                        text: q.text,
                        points: Number(q.points) || 1,
                        options: {
                            create: q.options.map((o) => ({
                                text: o.text,
                                isCorrect: Boolean(o.isCorrect)
                            }))
                        }
                    }))
                }
            },
            include: {
                questions: { include: { options: true } }
            }
        });
        res.status(201).json(quiz);
    }
    catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
};
exports.createQuiz = createQuiz;
/**
 * INSTRUCTOR: Get all Quizzes created by the instructor
 */
const getMyQuizzes = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { courseId } = req.params;
        if (!instructorId)
            return res.status(401).json({ error: 'Unauthorized' });
        const quizzes = await prisma_1.prisma.quiz.findMany({
            where: {
                lesson: {
                    module: {
                        course: {
                            instructorId,
                            ...(courseId ? { id: courseId } : {})
                        }
                    }
                }
            },
            include: {
                lesson: { include: { module: { include: { course: true } } } },
                _count: { select: { questions: true } },
                questions: { include: { options: true } } // Include questions for the editor
            }
        });
        res.status(200).json(quizzes);
    }
    catch (error) {
        console.error('Get instructor quizzes error:', error);
        res.status(500).json({ error: 'Failed to get quizzes' });
    }
};
exports.getMyQuizzes = getMyQuizzes;
/**
 * INSTRUCTOR/STUDENT: Get Quiz Details (Admin/Instructor get correct answers, students do not)
 */
const getQuiz = async (req, res) => {
    try {
        const id = req.params.id;
        const role = req.user?.role;
        const quiz = await prisma_1.prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    include: {
                        options: role === 'INSTRUCTOR' || role === 'ADMIN'
                            ? true
                            : { select: { id: true, text: true, questionId: true } }
                    }
                }
            }
        });
        if (!quiz)
            return res.status(404).json({ error: 'Quiz not found' });
        // Expert Feature: Randomize questions and options for students to prevent cheating
        if (role === 'STUDENT') {
            quiz.questions = quiz.questions.sort(() => Math.random() - 0.5);
            quiz.questions.forEach(q => {
                q.options = q.options.sort(() => Math.random() - 0.5);
            });
        }
        res.status(200).json(quiz);
    }
    catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Failed to get quiz' });
    }
};
exports.getQuiz = getQuiz;
/**
 * STUDENT: Submit Quiz for Auto-Grading & Detailed Feedback
 */
const submitQuiz = async (req, res) => {
    try {
        const studentId = req.user?.id;
        const id = req.params.id;
        const { answers } = req.body;
        const quiz = await prisma_1.prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        });
        if (!quiz)
            return res.status(404).json({ error: 'Quiz not found' });
        let score = 0;
        const detailedResults = [];
        const answerRecords = [];
        const questions = quiz.questions || [];
        for (const q of questions) {
            const studentAnswer = answers.find((a) => a.questionId === q.id);
            const selectedOptionId = studentAnswer?.selectedOptionId || null;
            const correctOption = q.options.find((o) => o.isCorrect);
            const isCorrect = selectedOptionId === correctOption?.id;
            if (isCorrect)
                score += q.points;
            // Expert Feature: Return full context for "Review Mode"
            detailedResults.push({
                questionId: q.id,
                questionText: q.text,
                selectedOptionId,
                correctOptionId: correctOption?.id,
                isCorrect,
                explanation: q.explanation || "No explanation provided."
            });
            if (selectedOptionId) {
                answerRecords.push({
                    questionId: q.id,
                    selectedOptionId,
                    isCorrect
                });
            }
        }
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        const scorePercentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
        const passed = scorePercentage >= quiz.passingScore;
        const submission = await prisma_1.prisma.quizSubmission.create({
            data: {
                quizId: id,
                studentId,
                score: scorePercentage,
                answers: {
                    create: answerRecords
                }
            }
        });
        // Mark lesson as completed if passed
        if (passed) {
            await prisma_1.prisma.lessonProgress.upsert({
                where: { studentId_lessonId: { studentId, lessonId: quiz.lessonId } },
                update: { isCompleted: true },
                create: { studentId, lessonId: quiz.lessonId, isCompleted: true }
            });
            // Update enrollment progress (Expert: triggering background recalculation)
            const lesson = await prisma_1.prisma.lesson.findUnique({
                where: { id: quiz.lessonId },
                include: { module: { include: { course: true } } }
            });
            if (lesson) {
                const courseId = lesson.module.courseId;
                const [total, completed] = await Promise.all([
                    prisma_1.prisma.lesson.count({ where: { module: { courseId } } }),
                    prisma_1.prisma.lessonProgress.count({ where: { studentId, isCompleted: true, lesson: { module: { courseId } } } })
                ]);
                await prisma_1.prisma.enrollment.updateMany({
                    where: { studentId, courseId },
                    data: { progressPercent: total > 0 ? (completed / total) * 100 : 0 }
                });
            }
        }
        // Log Activity
        await prisma_1.prisma.studentActivityLog.create({
            data: {
                studentId,
                action: "SUBMIT_QUIZ",
                metadata: JSON.stringify({ quizId: id, score: scorePercentage, passed })
            }
        });
        res.status(201).json({
            submissionId: submission.id,
            score: scorePercentage,
            passed,
            results: detailedResults
        });
    }
    catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
};
exports.submitQuiz = submitQuiz;
/**
 * INSTRUCTOR: Get Quiz Submissions
 */
const getQuizSubmissions = async (req, res) => {
    try {
        const id = req.params.id;
        const submissions = await prisma_1.prisma.quizSubmission.findMany({
            where: { quizId: id },
            include: {
                student: { select: { id: true, name: true, email: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(submissions);
    }
    catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ error: 'Failed to get submissions' });
    }
};
exports.getQuizSubmissions = getQuizSubmissions;
