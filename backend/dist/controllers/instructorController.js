"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endDirectLive = exports.startDirectLive = exports.updateInstructorProfile = exports.getInstructorProfile = exports.getInstructorEarnings = exports.getInstructorStudents = exports.replyToReview = exports.getInstructorReviews = exports.getRecentActivity = exports.getInstructorDashboardStats = exports.getMonetizationStats = exports.getAssignmentStats = exports.gradeSubmission = exports.getAssignmentSubmissions = exports.createAssignment = exports.createLiveSession = exports.getInstructorDashboardAnalytics = exports.getInstructorCourses = exports.getSystemMetrics = exports.logSystemPerformance = exports.getQuizPerformance = exports.getStudentProgressReport = exports.getLiveClassAnalytics = void 0;
const prisma_1 = require("../utils/prisma");
const security_1 = require("../utils/security");
const getLiveClassAnalytics = async (req, res) => {
    try {
        const { courseId } = req.query;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sessions = await prisma_1.prisma.liveSession.findMany({
            where: {
                ...(courseId ? { lesson: { module: { courseId: courseId } } } : {}),
                startTime: { gte: thirtyDaysAgo },
            },
            include: {
                lesson: {
                    include: {
                        module: {
                            include: {
                                course: {
                                    include: {
                                        _count: { select: { enrollments: true } }
                                    }
                                }
                            }
                        }
                    }
                },
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
            enrolledCount: session.lesson.module.course._count.enrollments,
            attendedCount: session.attendance.length,
            participationRate: session.lesson.module.course._count.enrollments > 0
                ? (session.attendance.length / session.lesson.module.course._count.enrollments) * 100
                : 0
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
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        const isOwner = await (0, security_1.validateCourseOwnership)(courseId, instructorId);
        if (!isOwner)
            return res.status(403).json({ error: "Access denied: Not your course" });
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
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        const isOwner = await (0, security_1.validateQuizOwnership)(quizId, instructorId);
        if (!isOwner)
            return res.status(403).json({ error: "Access denied: Not your quiz" });
        const results = await prisma_1.prisma.quizSubmission.findMany({
            where: { quizId },
            include: {
                answers: { include: { question: { select: { text: true } } } }
            }
        });
        const questions = await prisma_1.prisma.question.findMany({
            where: { quizId },
            select: { id: true, text: true }
        });
        const questionStats = questions.map(q => {
            const responses = results.flatMap(r => r.answers).filter(a => a.questionId === q.id);
            const correct = responses.filter(a => a.isCorrect).length;
            return {
                id: q.id,
                text: q.text,
                correctRate: responses.length > 0 ? Math.round((correct / responses.length) * 100) : 0,
                totalResponses: responses.length
            };
        });
        const scores = results.map(r => r.score);
        const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        res.status(200).json({
            quizId,
            averageScore: Math.round(avgScore),
            highestScore: Math.max(...(scores.length ? scores : [0])),
            lowestScore: Math.min(...(scores.length ? scores : [0])),
            passRate: Math.round((results.filter(r => r.score >= 70).length / (results.length || 1)) * 100),
            totalSubmissions: results.length,
            questionStats: questionStats.sort((a, b) => a.correctRate - b.correctRate).slice(0, 5) // Worst performing first
        });
    }
    catch (error) {
        console.error("Quiz Performance Error:", error);
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
            include: {
                _count: { select: { enrollments: true, reviews: true } }
            }
        });
        const reviewsAgg = await prisma_1.prisma.review.groupBy({
            by: ['courseId'],
            where: { courseId: { in: courses.map((c) => c.id) } },
            _avg: { rating: true }
        });
        const result = courses.map((course) => {
            const rAgg = reviewsAgg.find((r) => r.courseId === course.id);
            return {
                id: course.id,
                title: course.title,
                category: course.category || "General",
                students: course._count.enrollments,
                rating: rAgg?._avg?.rating ? Number(rAgg._avg.rating.toFixed(1)) : 0,
                status: course.visibility === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
                img: "bg-gray-100 dark:bg-gray-800" // Optional: placeholder for thumbnail
            };
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch instructor courses" });
    }
};
exports.getInstructorCourses = getInstructorCourses;
const getInstructorDashboardAnalytics = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        // 1. Fetch instructor's courses
        const courses = await prisma_1.prisma.course.findMany({
            where: { instructorId },
            include: {
                enrollments: { include: { student: { include: { lessonProgress: true } } } },
                modules: { include: { _count: { select: { lessons: true } } } },
                _count: { select: { enrollments: true } }
            }
        });
        const courseIds = courses.map(c => c.id);
        // 2. Fetch revenue from transactions (assuming we map purchases to instructor's courses eventually, but for now we'll simulate instructor share or fetch if we have a direct link)
        // In our schema, we don't have direct course purchase linking on transactions currently unless we look at Enrollments. 
        // For MVP hydration, we'll calculate revenue based on courses price * enrollments (simplified).
        let totalRevenue = 0;
        const courseStats = courses.map((c) => {
            const price = Number(c.price || 0);
            const rev = c.enrollments.length * price;
            totalRevenue += rev;
            const totalLessons = c.modules.reduce((sum, m) => sum + m._count.lessons, 0) || 1;
            let totalCompletionPercent = 0;
            c.enrollments.forEach((e) => {
                const completed = e.student.lessonProgress.filter((lp) => lp.isCompleted && lp.lesson.moduleId).length; // simple approximation
                totalCompletionPercent += (completed / totalLessons) * 100;
            });
            const avgCompletion = c.enrollments.length > 0 ? totalCompletionPercent / c.enrollments.length : 0;
            return {
                id: c.id,
                name: c.title,
                students: c.enrollments.length,
                completion: Math.round(Math.min(100, avgCompletion)),
                revenue: `${rev.toLocaleString()} ETB`
            };
        });
        // 3. Overall Stats
        const totalEnrolments = courses.reduce((acc, c) => acc + c.enrollments.length, 0);
        const overallCompletion = courseStats.length > 0 ? courseStats.reduce((acc, c) => acc + c.completion, 0) / courseStats.length : 0;
        const stats = [
            { label: "Total Enrolments", value: totalEnrolments.toString(), change: "+12.3%", up: true, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600" },
            { label: "Total Revenue", value: `${totalRevenue.toLocaleString()} ETB`, change: "+8.5%", up: true, color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" },
            { label: "Avg Completion", value: `${Math.round(overallCompletion)}%`, change: "+2.1%", up: true, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600" },
            { label: "Engagement Rate", value: `${Math.min(99, Math.round(overallCompletion * 0.8 + 15))}%`, change: "-1.2%", up: false, color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600" }
        ];
        // 4. Charts Data (Mocked temporal distribution for now, based on enrollments count)
        const dailyEnrolments = [
            Math.floor(totalEnrolments * 0.1),
            Math.floor(totalEnrolments * 0.15),
            Math.floor(totalEnrolments * 0.05),
            Math.floor(totalEnrolments * 0.2),
            Math.floor(totalEnrolments * 0.1),
            Math.floor(totalEnrolments * 0.25),
            Math.floor(totalEnrolments * 0.15)
        ];
        const revenueGrowth = dailyEnrolments.map(e => e * 500); // approx 500 ETB average
        // 5. Check if instructor is currently LIVE
        const activeLiveSession = await prisma_1.prisma.liveSession.findFirst({
            where: {
                isLive: true,
                lesson: { module: { course: { instructorId: instructorId } } }
            },
            select: { id: true }
        });
        res.status(200).json({
            stats,
            courseStats: courseStats.sort((a, b) => b.students - a.students),
            charts: {
                dailyEnrolments,
                revenueGrowth
            },
            isLive: !!activeLiveSession,
            activeLiveSessionId: activeLiveSession?.id || null
        });
    }
    catch (error) {
        console.error("Dashboard Analytics Error:", error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
};
exports.getInstructorDashboardAnalytics = getInstructorDashboardAnalytics;
const createLiveSession = async (req, res) => {
    try {
        const { title, courseId, startTime, durationSeconds, moduleId } = req.body;
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        const isOwner = await (0, security_1.validateCourseOwnership)(courseId, instructorId);
        if (!isOwner)
            return res.status(403).json({ error: "Access denied: Not your course" });
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
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        // Verify lessonId belongs to instructor's course
        const lesson = await prisma_1.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { select: { courseId: true } } }
        });
        if (!lesson || !(await (0, security_1.validateCourseOwnership)(lesson.module.courseId, instructorId))) {
            return res.status(403).json({ error: "Access denied: Lesson does not belong to your course" });
        }
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
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        const isOwner = await (0, security_1.validateAssignmentOwnership)(assignmentId, instructorId);
        if (!isOwner)
            return res.status(403).json({ error: "Access denied: Not your assignment" });
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
        const instructorId = req.user?.id;
        const { grade, feedback, status } = req.body;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        const isOwner = await (0, security_1.validateSubmissionOwnership)(submissionId, instructorId);
        if (!isOwner)
            return res.status(403).json({ error: "Access denied: This submission is for another instructor's course" });
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
        // 5. Upcoming Live Sessions
        const upcomingSessions = await prisma_1.prisma.liveSession.findMany({
            where: {
                startTime: { gte: new Date() },
                lesson: { module: { course: { instructorId } } }
            },
            include: {
                lesson: { select: { title: true, module: { select: { course: { select: { title: true } } } } } }
            },
            take: 2,
            orderBy: { startTime: 'asc' }
        });
        res.status(200).json({
            totalCourses,
            totalStudents,
            totalRevenue: estimatedEarnings.toFixed(2),
            avgRating: reviews._avg.rating?.toFixed(1) || "5.0",
            revenueTrend: "+8% this month",
            studentTrend: "+12% weekly",
            upcomingSessions: upcomingSessions.map((s) => ({
                title: s.lesson.title,
                time: s.startTime,
                course: s.lesson.module.course.title
            }))
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
const getInstructorReviews = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        const reviews = await prisma_1.prisma.review.findMany({
            where: { course: { instructorId } },
            include: {
                student: { select: { name: true, avatar: true } },
                course: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(reviews);
    }
    catch (error) {
        console.error("Get Reviews Error:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};
exports.getInstructorReviews = getInstructorReviews;
const replyToReview = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { id } = req.params;
        const { reply } = req.body;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        const review = await prisma_1.prisma.review.findFirst({
            where: {
                id,
                course: { instructorId }
            }
        });
        if (!review)
            return res.status(404).json({ error: "Review not found" });
        const updatedReview = await prisma_1.prisma.review.update({
            where: { id },
            data: { reply }
        });
        res.status(200).json(updatedReview);
    }
    catch (error) {
        console.error("Reply Review Error:", error);
        res.status(500).json({ error: "Failed to save reply" });
    }
};
exports.replyToReview = replyToReview;
const getInstructorStudents = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        const enrollments = await prisma_1.prisma.enrollment.findMany({
            where: { course: { instructorId } },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        createdAt: true
                    }
                },
                course: { select: { id: true, title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        const students = enrollments.map((e) => {
            const student = e.student;
            return {
                id: student.id,
                name: student.name,
                email: student.email,
                course: e.course.title,
                progress: Math.round(Number(e.progressPercent || 0)),
                lastActive: "Active",
                avatar: student.avatar
            };
        });
        res.status(200).json(students);
    }
    catch (error) {
        console.error("Get Students Error:", error);
        res.status(500).json({ error: "Failed to fetch students" });
    }
};
exports.getInstructorStudents = getInstructorStudents;
const getInstructorEarnings = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        const courses = await prisma_1.prisma.course.findMany({
            where: { instructorId },
            include: {
                _count: { select: { enrollments: true } },
                enrollments: {
                    include: { student: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 50
                }
            }
        });
        let totalEarnings = 0;
        let monthlyEarnings = 0;
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const transactions = [];
        courses.forEach((course) => {
            const coursePrice = Number(course.price) || 0;
            const enrollmentCount = course._count.enrollments;
            totalEarnings += coursePrice * enrollmentCount;
            course.enrollments.forEach((enrollment) => {
                if (new Date(enrollment.createdAt) > oneMonthAgo) {
                    monthlyEarnings += coursePrice;
                }
                transactions.push({
                    id: enrollment.id.split('-')[0].toUpperCase(),
                    course: course.title,
                    student: enrollment.student.name,
                    amount: `${coursePrice} ETB`,
                    share: `${(coursePrice * 0.9).toFixed(0)} ETB`, // 90% share
                    date: new Date(enrollment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    status: "COMPLETED",
                    rawDate: enrollment.createdAt
                });
            });
        });
        // Sort transactions by date
        transactions.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
        res.status(200).json({
            summary: [
                { label: "Total Earnings", value: `${totalEarnings.toLocaleString()} ETB`, sub: "+12.5% from last month", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" },
                { label: "Monthly Earnings", value: `${monthlyEarnings.toLocaleString()} ETB`, sub: "Last 30 days", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600" },
                { label: "Pending Payout", value: `${(totalEarnings * 0.15).toFixed(0).toLocaleString()} ETB`, sub: "Next payout: Nov 15", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600" },
                { label: "Commission Paid", value: `${(totalEarnings * 0.1).toFixed(0).toLocaleString()} ETB`, sub: "10% Platform Fee", color: "bg-gray-50 dark:bg-gray-800 text-gray-400" },
            ],
            transactions: transactions.slice(0, 20)
        });
    }
    catch (error) {
        console.error("Get Earnings Error:", error);
        res.status(500).json({ error: "Failed to fetch earnings" });
    }
};
exports.getInstructorEarnings = getInstructorEarnings;
const getInstructorProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                phoneNumber: true,
                avatar: true,
                instructorProfile: true
            }
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.status(200).json({
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber || "",
            avatar: user.avatar || "",
            title: user.instructorProfile?.title || "",
            bio: user.instructorProfile?.bio || "",
            language: user.instructorProfile?.languagePreference || "English"
        });
    }
    catch (error) {
        console.error("Get Instructor Profile Error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};
exports.getInstructorProfile = getInstructorProfile;
const updateInstructorProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const { name, phoneNumber, title, bio, language } = req.body;
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.user.update({
                where: { id: userId },
                data: { name, phoneNumber }
            }),
            prisma_1.prisma.instructorProfile.upsert({
                where: { userId },
                create: {
                    userId,
                    title,
                    bio,
                    languagePreference: language
                },
                update: {
                    title,
                    bio,
                    languagePreference: language
                }
            })
        ]);
        res.status(200).json({ message: "Profile updated successfully" });
    }
    catch (error) {
        console.error("Update Instructor Profile Error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};
exports.updateInstructorProfile = updateInstructorProfile;
const startDirectLive = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { instructorProfile: { include: { followers: true } } }
        });
        if (!user || !user.instructorProfile)
            return res.status(404).json({ error: "Instructor profile not found" });
        const profile = user.instructorProfile;
        const instructorName = user.name || "Instructor";
        // 1. Create a virtual lesson for this direct live
        const lesson = await prisma_1.prisma.lesson.create({
            data: {
                title: `Live Session by ${instructorName}`,
                moduleId: "direct-live",
                type: "LIVE",
                orderIndex: 0,
                isFreePreview: true
            }
        }).catch(async () => {
            return null;
        });
        let lessonId;
        if (!lesson) {
            const firstCourse = await prisma_1.prisma.course.findFirst({ where: { instructorId: userId }, include: { modules: true } });
            if (!firstCourse || firstCourse.modules.length === 0) {
                return res.status(400).json({ error: "You must have at least one course with a module to go live." });
            }
            const fallbackLesson = await prisma_1.prisma.lesson.create({
                data: {
                    title: `Instant Live: ${new Date().toLocaleString()}`,
                    moduleId: firstCourse.modules[0].id,
                    type: "LIVE",
                    orderIndex: 999
                }
            });
            lessonId = fallbackLesson.id;
        }
        else {
            lessonId = lesson.id;
        }
        const liveSession = await prisma_1.prisma.liveSession.create({
            data: {
                lessonId,
                startTime: new Date(),
                isLive: true,
            }
        });
        // 2. Notify followers
        const followerIds = profile.followers.map(f => f.studentId);
        if (followerIds.length > 0) {
            await prisma_1.prisma.notification.createMany({
                data: followerIds.map(fId => ({
                    userId: fId,
                    type: "LIVE_CLASS",
                    title: "Instructor is LIVE!",
                    message: `${instructorName} has just started a live session. Join now!`,
                    linkUrl: `/dashboard/student/live/${liveSession.id}`
                }))
            });
        }
        res.status(200).json({
            message: "You are now LIVE!",
            liveSessionId: liveSession.id,
            followerCount: followerIds.length
        });
    }
    catch (error) {
        console.error("Start Direct Live Error:", error);
        res.status(500).json({ error: "Failed to start live session" });
    }
};
exports.startDirectLive = startDirectLive;
const endDirectLive = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        await prisma_1.prisma.liveSession.update({
            where: { id: sessionId },
            data: {
                isLive: false,
                endTime: new Date()
            }
        });
        res.status(200).json({ message: "Live session ended." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to end live session" });
    }
};
exports.endDirectLive = endDirectLive;
