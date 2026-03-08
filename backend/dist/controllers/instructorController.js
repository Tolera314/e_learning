"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemMetrics = exports.logSystemPerformance = exports.getQuizPerformance = exports.getStudentProgressReport = exports.getLiveClassAnalytics = void 0;
const prisma_1 = require("../utils/prisma");
const getLiveClassAnalytics = async (req, res) => {
    try {
        const { courseId } = req.query;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sessions = await prisma_1.prisma.liveSession.findMany({
            where: {
                ...(courseId ? { lesson: { module: { courseId: courseId } } } : {}),
                startTime: { gte: thirtyDaysAgo }, // Scope to last 30 days
            },
            include: {
                lesson: { include: { module: { include: { course: true } } } },
                attendance: true
            },
            orderBy: { startTime: 'desc' },
            take: 50,
        });
        const analytics = sessions.map((session) => ({
            id: session.id,
            title: session.lesson.title,
            courseName: session.lesson.module.course.title,
            startTime: session.startTime,
            duration: `${session.lesson.durationSeconds / 60} mins`,
            status: session.isLive ? 'active' : (session.endTime ? 'completed' : 'upcoming'),
            enrolledCount: 60, // Mock for now
            attendedCount: session.attendance.length,
            participationRate: (session.attendance.length / 60) * 100
        }));
        res.status(200).json(analytics);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch live session analytics" });
    }
};
exports.getLiveClassAnalytics = getLiveClassAnalytics;
const getStudentProgressReport = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const enrollments = await prisma_1.prisma.enrollment.findMany({
            where: { courseId },
            include: {
                student: {
                    include: {
                        activityLogs: {
                            where: { courseId: courseId },
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        },
                        lessonProgress: {
                            where: {
                                lesson: {
                                    module: { courseId: courseId }
                                }
                            }
                        }
                    }
                }
            }
        });
        const report = enrollments.map((e) => {
            const completedLessons = e.student.lessonProgress.filter((lp) => lp.isCompleted).length;
            return {
                id: e.student.id,
                name: `${e.student.firstName} ${e.student.lastName}`,
                progress: (completedLessons / 20) * 100, // Assuming 20 lessons total
                lessonsCompleted: completedLessons,
                lastActive: e.student.activityLogs[0]?.createdAt || e.updatedAt,
                status: completedLessons < 5 ? 'Struggling' : 'Active'
            };
        });
        res.status(200).json(report);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch student progress report" });
    }
};
exports.getStudentProgressReport = getStudentProgressReport;
const getQuizPerformance = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const results = await prisma_1.prisma.quizSubmission.findMany({
            where: { quizId },
            include: {
                answers: true
            }
        });
        const scores = results.map(r => r.score);
        const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        res.status(200).json({
            quizId,
            averageScore: avgScore,
            highestScore: Math.max(...(scores.length ? scores : [0])),
            lowestScore: Math.min(...(scores.length ? scores : [0])),
            passRate: (results.filter(r => r.score >= 70).length / (results.length || 1)) * 100,
            totalSubmissions: results.length
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch quiz performance" });
    }
};
exports.getQuizPerformance = getQuizPerformance;
const logSystemPerformance = async (req, res) => {
    try {
        const { type, source, message, stackTrace, metadata } = req.body;
        await prisma_1.prisma.systemPerformanceLog.create({
            data: {
                type,
                source,
                message,
                stackTrace,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
        res.status(201).json({ status: "logged" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to log system performance" });
    }
};
exports.logSystemPerformance = logSystemPerformance;
const getSystemMetrics = async (req, res) => {
    try {
        const logs = await prisma_1.prisma.systemPerformanceLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        const videoMetrics = await prisma_1.prisma.videoStreamMetric.aggregate({
            _avg: {
                bufferingEvents: true,
                totalWatchTime: true
            },
            _sum: {
                playbackErrors: true
            }
        });
        res.status(200).json({
            logs,
            videoMetrics: {
                avgBuffering: videoMetrics._avg.bufferingEvents,
                totalErrors: videoMetrics._sum.playbackErrors,
                avgWatchTime: videoMetrics._avg.totalWatchTime
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch system metrics" });
    }
};
exports.getSystemMetrics = getSystemMetrics;
