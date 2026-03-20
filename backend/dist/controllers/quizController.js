"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizSubmissions = exports.submitQuiz = exports.getQuiz = exports.createQuiz = void 0;
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
                            ? true // full access
                            : { select: { id: true, text: true, questionId: true } } // Student access (no isCorrect)
                    }
                }
            }
        });
        if (!quiz)
            return res.status(404).json({ error: 'Quiz not found' });
        res.status(200).json(quiz);
    }
    catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Failed to get quiz' });
    }
};
exports.getQuiz = getQuiz;
/**
 * STUDENT: Submit Quiz for Auto-Grading
 */
const submitQuiz = async (req, res) => {
    try {
        const studentId = req.user?.id;
        const id = req.params.id; // Quiz ID
        const { answers } = req.body; // Array of { questionId, selectedOptionId }
        const quiz = await prisma_1.prisma.quiz.findUnique({
            where: { id },
            include: { questions: { include: { options: true } } }
        });
        if (!quiz)
            return res.status(404).json({ error: 'Quiz not found' });
        let score = 0;
        const answerRecords = [];
        const questions = quiz.questions || [];
        // Auto grading
        for (const q of questions) {
            const studentAnswer = answers.find((a) => a.questionId === q.id);
            if (!studentAnswer)
                continue;
            const selectedOption = q.options.find((o) => o.id === studentAnswer.selectedOptionId);
            const isCorrect = selectedOption?.isCorrect || false;
            if (isCorrect)
                score += q.points;
            answerRecords.push({
                questionId: q.id,
                selectedOptionId: studentAnswer.selectedOptionId,
                isCorrect
            });
        }
        const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
        const scorePercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        const submission = await prisma_1.prisma.quizSubmission.create({
            data: {
                quizId: id,
                studentId,
                score: scorePercentage, // Storing as percentage for standard passing calculation
                answers: {
                    create: answerRecords
                }
            },
            include: { answers: true }
        });
        // Mark lesson as visually completed if passing score reached
        if (scorePercentage >= quiz.passingScore) {
            await prisma_1.prisma.lessonProgress.upsert({
                where: {
                    studentId_lessonId: { studentId, lessonId: quiz.lessonId }
                },
                update: { isCompleted: true },
                create: { studentId, lessonId: quiz.lessonId, isCompleted: true, watchTimeSeconds: 0 }
            });
        }
        res.status(201).json({
            submission,
            score: scorePercentage,
            passed: scorePercentage >= quiz.passingScore,
            maxScore
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
