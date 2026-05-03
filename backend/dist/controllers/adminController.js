"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerPerformance = exports.getDashboardFinancials = exports.moderateContent = exports.broadcastNotification = exports.getEnrollments = exports.getTransactions = exports.updateCourseStatus = exports.getAllCourses = exports.getAllInstructors = exports.getSystemStats = exports.approveInstructor = exports.getInstructorApplications = exports.updateUserStatus = exports.getAllUsers = void 0;
const prisma_1 = require("../utils/prisma");
const os_1 = __importDefault(require("os"));
const getAllUsers = async (req, res) => {
    try {
        const role = req.query.role || undefined;
        const status = req.query.status || undefined;
        const search = req.query.search || undefined;
        const users = await prisma_1.prisma.user.findMany({
            where: {
                ...(role ? { role: role } : {}),
                ...(status === 'active' ? { isActive: true, isBanned: false } : {}),
                ...(status === 'suspended' ? { isActive: false } : {}),
                ...(status === 'banned' ? { isBanned: true } : {}),
                ...(search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { phoneNumber: { contains: search, mode: 'insensitive' } },
                    ]
                } : {}),
                deletedAt: null
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                isActive: true,
                isBanned: true,
                createdAt: true,
                isVerified: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};
exports.getAllUsers = getAllUsers;
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive, isBanned } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                ...(isActive !== undefined ? { isActive } : {}),
                ...(isBanned !== undefined ? { isBanned } : {})
            }
        });
        res.status(200).json({ message: "User status updated successfully", user });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update user status" });
    }
};
exports.updateUserStatus = updateUserStatus;
const getInstructorApplications = async (req, res) => {
    try {
        const applications = await prisma_1.prisma.instructorProfile.findMany({
            where: { isApproved: false },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true
                    }
                }
            },
            orderBy: { user: { createdAt: 'desc' } }
        });
        res.status(200).json(applications);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch instructor applications" });
    }
};
exports.getInstructorApplications = getInstructorApplications;
const approveInstructor = async (req, res) => {
    try {
        const { profileId } = req.params;
        const profile = await prisma_1.prisma.instructorProfile.update({
            where: { id: profileId },
            data: { isApproved: true },
            include: { user: true }
        });
        // Optionally update user role if not already instructor
        if (profile.user.role !== 'INSTRUCTOR') {
            await prisma_1.prisma.user.update({
                where: { id: profile.userId },
                data: { role: 'INSTRUCTOR' }
            });
        }
        res.status(200).json({ message: "Instructor approved successfully", profile });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to approve instructor" });
    }
};
exports.approveInstructor = approveInstructor;
const getSystemStats = async (req, res) => {
    try {
        const [totalUsers, totalInstructors, totalCourses, totalEnrollments, revenue] = await Promise.all([
            prisma_1.prisma.user.count({ where: { deletedAt: null } }),
            prisma_1.prisma.instructorProfile.count({ where: { isApproved: true } }),
            prisma_1.prisma.course.count(),
            prisma_1.prisma.enrollment.count(),
            prisma_1.prisma.transaction.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            })
        ]);
        // Calculate Growth (Enrollments this month vs last month)
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const [enrollmentsThisMonth, enrollmentsLastMonth] = await Promise.all([
            prisma_1.prisma.enrollment.count({ where: { createdAt: { gte: firstDayThisMonth } } }),
            prisma_1.prisma.enrollment.count({ where: { createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } } })
        ]);
        let growthValue = 0;
        if (enrollmentsLastMonth > 0) {
            growthValue = ((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth) * 100;
        }
        else if (enrollmentsThisMonth > 0) {
            growthValue = 100;
        }
        const growth = (growthValue >= 0 ? "+" : "") + growthValue.toFixed(1) + "%";
        // Calculate Active Users (Unique users in ActivityLog in last 15 mins)
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const activeUsersCount = await prisma_1.prisma.studentActivityLog.groupBy({
            by: ['studentId'],
            where: { createdAt: { gte: fifteenMinsAgo } }
        });
        res.status(200).json({
            totalUsers,
            totalInstructors,
            totalCourses,
            totalEnrollments,
            totalRevenue: revenue._sum.amount || 0,
            growth,
            activeNow: activeUsersCount.length
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch system stats" });
    }
};
exports.getSystemStats = getSystemStats;
const getAllInstructors = async (req, res) => {
    try {
        const instructors = await prisma_1.prisma.instructorProfile.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        avatar: true,
                        isBanned: true
                    }
                },
                _count: {
                    select: { followers: true }
                }
            },
            orderBy: { user: { createdAt: 'desc' } }
        });
        res.status(200).json(instructors);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch instructors" });
    }
};
exports.getAllInstructors = getAllInstructors;
const getAllCourses = async (req, res) => {
    try {
        const category = req.query.category || undefined;
        const visibility = req.query.visibility || undefined;
        const courses = await prisma_1.prisma.course.findMany({
            where: {
                ...(category ? { category: category } : {}),
                ...(visibility ? { visibility: visibility } : {}),
                deletedAt: null
            },
            include: {
                instructor: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { enrollments: true, modules: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(courses);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch courses" });
    }
};
exports.getAllCourses = getAllCourses;
const updateCourseStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { visibility } = req.body;
        const course = await prisma_1.prisma.course.update({
            where: { id: courseId },
            data: { visibility: visibility }
        });
        res.status(200).json({ message: "Course status updated", course });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update course status" });
    }
};
exports.updateCourseStatus = updateCourseStatus;
const getTransactions = async (req, res) => {
    try {
        const transactions = await prisma_1.prisma.transaction.findMany({
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(transactions);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
};
exports.getTransactions = getTransactions;
const getEnrollments = async (req, res) => {
    try {
        const enrollments = await prisma_1.prisma.enrollment.findMany({
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.status(200).json(enrollments);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch enrollments" });
    }
};
exports.getEnrollments = getEnrollments;
const broadcastNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        // In a real system, this would be a bulk insert or a background job
        const users = await prisma_1.prisma.user.findMany({ where: { deletedAt: null }, select: { id: true } });
        const notifications = users.map(user => ({
            userId: user.id,
            title,
            message,
            type: type || 'SYSTEM',
        }));
        await prisma_1.prisma.notification.createMany({
            data: notifications
        });
        res.status(200).json({ message: `Notification broadcasted to ${users.length} users` });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to broadcast notification" });
    }
};
exports.broadcastNotification = broadcastNotification;
const moderateContent = async (req, res) => {
    try {
        const { targetId, targetType, action, reason } = req.body; // type: 'COURSE' | 'USER' | 'THREAD' | 'REPLY'
        const adminId = req.user?.id;
        if (!adminId)
            return res.status(401).json({ error: "Unauthorized" });
        // 1. Apply the action
        if (targetType === 'COURSE') {
            await prisma_1.prisma.course.update({
                where: { id: targetId },
                data: { visibility: action === 'BLOCK' ? 'ARCHIVED' : 'PUBLISHED' }
            });
        }
        else if (targetType === 'USER') {
            await prisma_1.prisma.user.update({
                where: { id: targetId },
                data: { isBanned: action === 'BLOCK', isActive: action !== 'BLOCK' }
            });
        }
        // 2. Log the action for audit trail
        await prisma_1.prisma.moderationLog.create({
            data: {
                adminId,
                targetId,
                targetType,
                action,
                reason: reason || "No reason provided"
            }
        });
        res.status(200).json({ message: "Content moderation action applied and logged" });
    }
    catch (error) {
        res.status(500).json({ error: "Moderation failed" });
    }
};
exports.moderateContent = moderateContent;
const getDashboardFinancials = async (req, res) => {
    try {
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: { status: 'COMPLETED' },
            orderBy: { createdAt: 'asc' },
            select: { amount: true, createdAt: true }
        });
        // Grouping by month for charts
        const monthlyData = {};
        transactions.forEach(t => {
            const month = t.createdAt.toLocaleString('default', { month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + Number(t.amount);
        });
        const chartData = Object.entries(monthlyData).map(([name, total]) => ({
            name,
            total
        }));
        res.status(200).json(chartData);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch financials" });
    }
};
exports.getDashboardFinancials = getDashboardFinancials;
const getServerPerformance = async (req, res) => {
    try {
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
        const usedMem = totalMem - freeMem;
        const memUsagePercent = (usedMem / totalMem) * 100;
        const cpus = os_1.default.cpus();
        // Simplified CPU load: grab the average over the past 1 minute.
        const loadAvg = os_1.default.loadavg();
        const cpuUsagePercent = (loadAvg[0] / cpus.length) * 100;
        const uptime = os_1.default.uptime();
        // To get socket connections / active users, we leverage studentActivityLog or db query
        // Wait, the plan also mentions active LiveAttendance counts
        const activeLiveUsers = await prisma_1.prisma.liveSessionAttendance.count({
            where: { leftAt: null }
        });
        // 2. Fetch Recent System Errors
        const recentErrors = await prisma_1.prisma.systemPerformanceLog.findMany({
            where: { type: 'ERROR' },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        res.status(200).json({
            cpu: {
                cores: cpus.length,
                usagePercent: cpuUsagePercent,
                model: cpus[0].model
            },
            memory: {
                totalGb: (totalMem / 1024 / 1024 / 1024).toFixed(2),
                usedGb: (usedMem / 1024 / 1024 / 1024).toFixed(2),
                usagePercent: memUsagePercent
            },
            uptimeSeconds: uptime,
            activeConnections: activeLiveUsers,
            recentErrors
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch server performance metrics" });
    }
};
exports.getServerPerformance = getServerPerformance;
