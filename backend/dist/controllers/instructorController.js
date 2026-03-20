"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getInstructorDashboardStats = exports.getMonetizationStats = exports.getAssignmentStats = exports.gradeSubmission = exports.getAssignmentSubmissions = exports.createAssignment = exports.createLiveSession = exports.getInstructorCourses = exports.getSystemMetrics = exports.logSystemPerformance = exports.getQuizPerformance = exports.getStudentProgressReport = exports.getLiveClassAnalytics = void 0;
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
const getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        const courses = await prisma_1.prisma.course.findMany({
            where: { instructorId },
            select: {
                id: true,
                title: true,
                modules: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });
        res.status(200).json(courses);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch instructor courses" });
    }
};
exports.getInstructorCourses = getInstructorCourses;
const createLiveSession = async (req, res) => {
    try {
        const { title, courseId, startTime, durationSeconds, moduleId } = req.body;
        if (!title || !courseId || !startTime || !moduleId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // 1. Create the Lesson of type LIVE
        const lesson = await prisma_1.prisma.lesson.create({
            data: {
                title: String(title),
                moduleId: String(moduleId),
                type: "LIVE",
                durationSeconds: durationSeconds ? parseInt(String(durationSeconds)) : 3600,
                orderIndex: 99,
            }
        });
        // 2. Create the LiveSession record
        const liveSession = await prisma_1.prisma.liveSession.create({
            data: {
                lessonId: lesson.id,
                startTime: new Date(String(startTime)),
                isLive: false,
            }
        });
        res.status(201).json({
            message: "Live session created successfully",
            lesson,
            liveSession
        });
    }
    catch (error) {
        console.error("Create Live Session Error:", error);
        res.status(500).json({ error: "Failed to create live session" });
    }
};
exports.createLiveSession = createLiveSession;
const createAssignment = async (req, res) => {
    try {
        const { lessonId, instructions, deadline, maxPoints, allowedFileTypes } = req.body;
        if (!lessonId || !instructions) {
            return res.status(400).json({ error: "Lesson ID and instructions are required" });
        }
        const assignment = await prisma_1.prisma.assignment.create({
            data: {
                lessonId: String(lessonId),
                instructions: String(instructions),
                deadline: deadline ? new Date(String(deadline)) : undefined,
                maxPoints: maxPoints ? parseInt(String(maxPoints)) : 100,
                allowedFileTypes: Array.isArray(allowedFileTypes) ? allowedFileTypes : ["pdf", "docx", "zip"],
            }
        });
        res.status(201).json({
            message: "Assignment created successfully",
            assignment
        });
    }
    catch (error) {
        console.error("Create Assignment Error:", error);
        res.status(500).json({ error: "Failed to create assignment" });
    }
};
exports.createAssignment = createAssignment;
const getAssignmentSubmissions = async (req, res) => {
    try {
        const assignmentId = String(req.params.assignmentId);
        const submissions = await prisma_1.prisma.assignmentSubmission.findMany({
            where: { assignmentId },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });
        res.status(200).json(submissions);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
};
exports.getAssignmentSubmissions = getAssignmentSubmissions;
const gradeSubmission = async (req, res) => {
    try {
        const submissionId = String(req.params.submissionId);
        const { grade, feedback, status } = req.body;
        const submission = await prisma_1.prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade: grade !== undefined ? parseInt(String(grade)) : undefined,
                feedback: feedback ? String(feedback) : undefined,
                status: String(status || "GRADED"),
                gradedAt: new Date(),
            }
        });
        res.status(200).json({
            message: "Submission graded successfully",
            submission
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to grade submission" });
    }
};
exports.gradeSubmission = gradeSubmission;
const getAssignmentStats = async (req, res) => {
    try {
        const totalAssignments = await prisma_1.prisma.assignment.count();
        const totalSubmissions = await prisma_1.prisma.assignmentSubmission.count();
        const pendingGrades = await prisma_1.prisma.assignmentSubmission.count({
            where: { status: "SUBMITTED" }
        });
        res.status(200).json({
            totalAssignments,
            totalSubmissions,
            pendingGrades,
            completionRate: totalAssignments > 0 ? (totalSubmissions / totalAssignments).toFixed(2) : 0
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch assignment stats" });
    }
};
exports.getAssignmentStats = getAssignmentStats;
const getMonetizationStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const profile = await prisma_1.prisma.instructorProfile.findUnique({
            where: { userId },
            include: {
                _count: {
                    select: { followers: true }
                }
            }
        });
        if (!profile)
            return res.status(404).json({ error: "Instructor profile not found" });
        const MONETIZATION_THRESHOLDS = {
            FOLLOWERS: 10000,
            WATCH_HOURS: 500
        };
        const watchHours = (profile.totalWatchMinutes || 0) / 60;
        const followerCount = profile.followerCount || 0;
        res.status(200).json({
            metrics: {
                followers: followerCount,
                watchHours: watchHours.toFixed(1),
                totalStudents: 1250, // Mock for now
                liveSessionsCount: 12
            },
            thresholds: MONETIZATION_THRESHOLDS,
            progress: {
                followers: Math.min(100, (followerCount / MONETIZATION_THRESHOLDS.FOLLOWERS) * 100).toFixed(1),
                watchTime: Math.min(100, (watchHours / MONETIZATION_THRESHOLDS.WATCH_HOURS) * 100).toFixed(1)
            },
            isEligible: followerCount >= MONETIZATION_THRESHOLDS.FOLLOWERS && watchHours >= MONETIZATION_THRESHOLDS.WATCH_HOURS
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch monetization metrics" });
    }
};
exports.getMonetizationStats = getMonetizationStats;
const getInstructorDashboardStats = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        // 1. Total Courses
        const totalCourses = await prisma_1.prisma.course.count({ where: { instructorId } });
        // 2. Total Students (Unique enrollments across all courses)
        const totalStudents = await prisma_1.prisma.enrollment.count({
            where: { course: { instructorId } }
        });
        // 3. Average Rating from real reviews
        const reviews = await prisma_1.prisma.review.aggregate({
            where: { course: { instructorId } },
            _avg: { rating: true }
        });
        // 4. Estimated Revenue based on monetization metrics
        const profile = await prisma_1.prisma.instructorProfile.findUnique({
            where: { userId: instructorId }
        });
        // Simplified expert-level estimation logic
        const watchHours = (profile?.totalWatchMinutes || 0) / 60;
        const followerCount = profile?.followerCount || 0;
        const estimatedEarnings = (watchHours * 2.5) + (followerCount * 0.5); // Example rate
        res.status(200).json({
            totalCourses,
            totalStudents,
            totalRevenue: estimatedEarnings.toFixed(2),
            avgRating: reviews._avg.rating?.toFixed(1) || "5.0",
            revenueTrend: "+8% this month",
            studentTrend: "+12% weekly"
        });
    }
    catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};
exports.getInstructorDashboardStats = getInstructorDashboardStats;
const getRecentActivity = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        // Fetch latest enrollments and submissions
        const enrollments = await prisma_1.prisma.enrollment.findMany({
            where: { course: { instructorId } },
            include: {
                student: { select: { name: true } },
                course: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        const submissions = await prisma_1.prisma.assignmentSubmission.findMany({
            where: { assignment: { lesson: { module: { course: { instructorId } } } } },
            include: {
                student: { select: { name: true } },
                assignment: { include: { lesson: { select: { title: true } } } }
            },
            orderBy: { submittedAt: 'desc' },
            take: 5
        });
        // Normalize into activity feed
        const activities = [
            ...enrollments.map((e) => ({
                id: e.id,
                user: e.student.name,
                title: `enrolled in ${e.course.title}`,
                type: "Enrollment",
                time: e.createdAt,
            })),
            ...submissions.map((s) => ({
                id: s.id,
                user: s.student.name,
                title: `submitted ${s.assignment.lesson.title}`,
                type: "Submission",
                time: s.submittedAt,
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
        res.status(200).json(activities);
    }
    catch (error) {
        console.error("Recent Activity Error:", error);
        res.status(500).json({ error: "Failed to fetch recent activity" });
    }
};
exports.getRecentActivity = getRecentActivity;
