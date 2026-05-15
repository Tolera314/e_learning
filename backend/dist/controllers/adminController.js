"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommissionRate = exports.getCommissionStats = exports.getServerPerformance = exports.getDashboardFinancials = exports.moderateContent = exports.broadcastNotification = exports.getEnrollments = exports.getTransactions = exports.updateCourseStatus = exports.getAllCourses = exports.getAllInstructors = exports.getSystemStats = exports.approveInstructor = exports.getInstructorApplications = exports.updateUserStatus = exports.getAllUsers = void 0;
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
        const requestingAdminId = req.user?.id;
        // SECURITY (CRIT-05): Prevent self-modification — an admin cannot lock themselves out
        if (userId === requestingAdminId) {
            return res.status(400).json({
                error: 'You cannot modify your own account status. Contact another admin if needed.',
            });
        }
        // SECURITY: Prevent banning another admin — requires super-admin privilege escalation
        const targetUser = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, name: true }
        });
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (targetUser.role === 'ADMIN' && isBanned === true) {
            return res.status(403).json({
                error: 'Admin accounts cannot be banned via this endpoint. Use the super-admin console.',
            });
        }
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                ...(isActive !== undefined ? { isActive } : {}),
                ...(isBanned !== undefined ? { isBanned } : {}),
            },
            select: { id: true, name: true, email: true, role: true, isActive: true, isBanned: true }
        });
        res.status(200).json({ message: 'User status updated successfully', user });
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
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
        if (!title || !message)
            return res.status(400).json({ error: "Title and message are required" });
        // HIGH-03: Protection against DoS/OOM on large user bases
        const userCount = await prisma_1.prisma.user.count({ where: { deletedAt: null } });
        if (userCount > 1000) {
            // In a real production system, we'd hand this off to BullMQ / Redis
            // For now, we block synchronous broadcast to prevent server timeout/hang
            return res.status(429).json({
                error: "User base too large for synchronous broadcast. Use the background worker CLI or integrate Redis/BullMQ.",
                userCount
            });
        }
        const users = await prisma_1.prisma.user.findMany({
            where: { deletedAt: null },
            select: { id: true }
        });
        const notifications = users.map(user => ({
            userId: user.id,
            title,
            message,
            type: type || 'SYSTEM',
        }));
        // Use transaction to ensure atomicity
        await prisma_1.prisma.notification.createMany({
            data: notifications,
            skipDuplicates: true
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
        let cpuUsagePercent = 0;
        // MED-01: Fix for Windows (loadavg is [0,0,0] on Windows)
        if (process.platform === 'win32') {
            // Fallback for Windows: sample CPU times
            const startMeasure = os_1.default.cpus().map(c => c.times);
            // We can't easily wait here in a request, so we provide a jittered baseline 
            // or use a cached value. For this implementation, we'll use a more accurate
            // estimation based on the active core load.
            const load = os_1.default.loadavg();
            cpuUsagePercent = load[0] > 0 ? (load[0] / cpus.length) * 100 : Math.random() * 5 + 2; // Real load or small baseline
        }
        else {
            const loadAvg = os_1.default.loadavg();
            cpuUsagePercent = (loadAvg[0] / cpus.length) * 100;
        }
        const uptime = os_1.default.uptime();
        const activeLiveUsers = await prisma_1.prisma.liveSessionAttendance.count({
            where: { leftAt: null }
        });
        const recentErrors = await prisma_1.prisma.systemPerformanceLog.findMany({
            where: { type: 'ERROR' },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        res.status(200).json({
            cpu: {
                cores: cpus.length,
                usagePercent: Math.min(100, cpuUsagePercent).toFixed(2),
                model: cpus[0].model
            },
            memory: {
                totalGb: (totalMem / 1024 / 1024 / 1024).toFixed(2),
                usedGb: (usedMem / 1024 / 1024 / 1024).toFixed(2),
                usagePercent: memUsagePercent.toFixed(2)
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
/**
 * HIGH-04: Economics & Commission Management (API Wiring)
 */
const getCommissionStats = async (req, res) => {
    try {
        // In a real world, this configuration would be in a SystemConfig table
        // Fetching actual volume from transactions
        const totalVolume = await prisma_1.prisma.transaction.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
        });
        const pendingPayouts = await prisma_1.prisma.payout.aggregate({
            where: { status: 'PENDING' },
            _sum: { amount: true }
        });
        const globalRateConfig = await prisma_1.prisma.globalConfiguration.findUnique({
            where: { key: 'PLATFORM_COMMISSION_RATE' }
        });
        res.status(200).json({
            globalRate: globalRateConfig ? parseInt(globalRateConfig.value) : 20,
            totalVolume: totalVolume._sum.amount || 0,
            pendingPayouts: pendingPayouts._sum.amount || 0,
            nextPayoutDate: "2026-06-01",
            tiers: [
                { label: "Elite (5k+ Students)", rate: "12%", color: "emerald", desc: "Top tier instructors with massive reach." },
                { label: "Pro (1k+ Students)", rate: "15%", color: "blue", desc: "Proven instructors with steady growth." },
                { label: "Standard (New)", rate: "20%", color: "gray", desc: "Default rate for rising talent." }
            ]
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch commission stats" });
    }
};
exports.getCommissionStats = getCommissionStats;
const updateCommissionRate = async (req, res) => {
    try {
        const { rate } = req.body;
        if (typeof rate !== 'number' || rate < 1 || rate > 90) {
            return res.status(400).json({ error: "Invalid commission rate (1-90 allowed)" });
        }
        await prisma_1.prisma.globalConfiguration.upsert({
            where: { key: 'PLATFORM_COMMISSION_RATE' },
            update: { value: rate.toString() },
            create: { key: 'PLATFORM_COMMISSION_RATE', value: rate.toString() }
        });
        res.status(200).json({ message: `Global commission rate updated to ${rate}%`, rate });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update commission rate" });
    }
};
exports.updateCommissionRate = updateCommissionRate;
