"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = exports.getInstructorDashboard = exports.getStudentDashboard = exports.getPublicStats = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
const getPublicStats = async (req, res) => {
    try {
        const [totalCourses, totalUsers, totalEnrollments, avgRatingAgg] = await Promise.all([
            prisma_1.prisma.course.count({ where: { visibility: 'PUBLISHED' } }),
            prisma_1.prisma.user.count(),
            prisma_1.prisma.enrollment.count(),
            prisma_1.prisma.course.aggregate({
                where: { visibility: 'PUBLISHED' },
                _avg: { rating: true }
            })
        ]);
        res.json({
            totalCourses,
            totalStudents: totalUsers,
            totalEnrollments,
            averageRating: avgRatingAgg._avg.rating || 4.8
        });
    }
    catch (error) {
        logger_1.default.error({ error }, 'Error fetching public stats');
        res.status(500).json({ message: 'Server error retrieving public stats' });
    }
};
exports.getPublicStats = getPublicStats;
const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const [enrollments, activeSubscriptions] = await Promise.all([
            prisma_1.prisma.enrollment.findMany({
                where: { studentId },
                include: { course: { select: { title: true, category: true, level: true, thumbnailUrl: true } } }
            }),
            prisma_1.prisma.subscription.findMany({ where: { studentId, expiresAt: { gt: new Date() } } })
        ]);
        res.json({
            enrollments,
            activeSubscriptions,
            stats: {
                completedCourses: enrollments.filter((e) => e.isCompleted).length,
                inProgress: enrollments.filter((e) => !e.isCompleted).length,
            }
        });
    }
    catch (error) {
        logger_1.default.error({ error }, 'Error fetching student dashboard');
        res.status(500).json({ message: 'Server error retrieving dashboard data' });
    }
};
exports.getStudentDashboard = getStudentDashboard;
const getInstructorDashboard = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const [courses, revenueResult] = await Promise.all([
            prisma_1.prisma.course.findMany({
                where: { instructorId },
                include: { _count: { select: { enrollments: true } } }
            }),
            // Real revenue from Transaction table
            prisma_1.prisma.transaction.aggregate({
                where: { user: { courses: { some: { instructorId } } }, status: 'COMPLETED' },
                _sum: { amount: true }
            })
        ]);
        const totalEnrollments = courses.reduce((acc, c) => acc + c._count.enrollments, 0);
        res.json({
            courses,
            stats: {
                publishedCourses: courses.filter((c) => c.visibility === 'PUBLISHED').length,
                totalStudents: totalEnrollments,
                revenueETB: Number(revenueResult._sum.amount ?? 0)
            }
        });
    }
    catch (error) {
        logger_1.default.error({ error }, 'Error fetching instructor dashboard');
        res.status(500).json({ message: 'Server error retrieving dashboard data' });
    }
};
exports.getInstructorDashboard = getInstructorDashboard;
const getAdminDashboard = async (req, res) => {
    try {
        const [totalUsers, totalSubs, pendingCourses] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.subscription.count({ where: { expiresAt: { gt: new Date() } } }),
            prisma_1.prisma.course.findMany({
                where: { visibility: 'PENDING_APPROVAL' },
                include: { instructor: { select: { name: true, email: true } } }
            })
        ]);
        res.json({
            message: 'Admin Dashboard Data',
            stats: {
                totalUsers,
                totalActiveSubscriptions: totalSubs,
                pendingApprovalsCount: pendingCourses.length
            },
            pendingCourses
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error retrieving admin data' });
    }
};
exports.getAdminDashboard = getAdminDashboard;
