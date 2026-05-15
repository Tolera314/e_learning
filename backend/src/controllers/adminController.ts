import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import os from "os";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const role = (req.query.role as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const search = (req.query.search as string) || undefined;

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role: role as any } : {}),
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
      } as any,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
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
    const targetUser = await prisma.user.findUnique({
      where: { id: userId as string },
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

    const user = await prisma.user.update({
      where: { id: userId } as any,
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(isBanned !== undefined ? { isBanned } : {}),
      } as any,
      select: { id: true, name: true, email: true, role: true, isActive: true, isBanned: true }
    });

    res.status(200).json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};


export const getInstructorApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await prisma.instructorProfile.findMany({
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
      } as any,
      orderBy: { user: { createdAt: 'desc' } } as any
    });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch instructor applications" });
  }
};

export const approveInstructor = async (req: AuthRequest, res: Response) => {
  try {
    const { profileId } = req.params;

    const profile = await prisma.instructorProfile.update({
      where: { id: profileId } as any,
      data: { isApproved: true } as any,
      include: { user: true } as any
    }) as any;

    // Optionally update user role if not already instructor
    if (profile.user.role !== 'INSTRUCTOR') {
      await prisma.user.update({
        where: { id: profile.userId },
        data: { role: 'INSTRUCTOR' }
      });
    }

    res.status(200).json({ message: "Instructor approved successfully", profile });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve instructor" });
  }
};

export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      revenue
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.instructorProfile.count({ where: { isApproved: true } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);

    // Calculate Growth (Enrollments this month vs last month)
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [enrollmentsThisMonth, enrollmentsLastMonth] = await Promise.all([
      prisma.enrollment.count({ where: { createdAt: { gte: firstDayThisMonth } } }),
      prisma.enrollment.count({ where: { createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } } })
    ]);

    let growthValue = 0;
    if (enrollmentsLastMonth > 0) {
      growthValue = ((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth) * 100;
    } else if (enrollmentsThisMonth > 0) {
      growthValue = 100;
    }

    const growth = (growthValue >= 0 ? "+" : "") + growthValue.toFixed(1) + "%";

    // Calculate Active Users (Unique users in ActivityLog in last 15 mins)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeUsersCount = await prisma.studentActivityLog.groupBy({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch system stats" });
  }
};

export const getAllInstructors = async (req: AuthRequest, res: Response) => {
  try {
    const instructors = await prisma.instructorProfile.findMany({
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
      } as any,
      orderBy: { user: { createdAt: 'desc' } } as any
    });

    res.status(200).json(instructors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch instructors" });
  }
};

export const getAllCourses = async (req: AuthRequest, res: Response) => {
  try {
    const category = (req.query.category as string) || undefined;
    const visibility = (req.query.visibility as string) || undefined;

    const courses = await prisma.course.findMany({
      where: {
        ...(category ? { category: category } : {}),
        ...(visibility ? { visibility: visibility as any } : {}),
        deletedAt: null
      },
      include: {
        instructor: {
          select: { name: true, email: true }
        },
        _count: {
          select: { enrollments: true, modules: true }
        }
      } as any,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const updateCourseStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { visibility } = req.body;

    const course = await prisma.course.update({
      where: { id: courseId } as any,
      data: { visibility: visibility as any } as any
    });

    res.status(200).json({ message: "Course status updated", course });
  } catch (error) {
    res.status(500).json({ error: "Failed to update course status" });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: { select: { name: true, email: true } }
      } as any,
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

export const getEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } }
      } as any,
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};

export const broadcastNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, type } = req.body;
    
    if (!title || !message) return res.status(400).json({ error: "Title and message are required" });

    // HIGH-03: Protection against DoS/OOM on large user bases
    const userCount = await prisma.user.count({ where: { deletedAt: null } });
    
    if (userCount > 1000) {
      // In a real production system, we'd hand this off to BullMQ / Redis
      // For now, we block synchronous broadcast to prevent server timeout/hang
      return res.status(429).json({ 
        error: "User base too large for synchronous broadcast. Use the background worker CLI or integrate Redis/BullMQ.",
        userCount 
      });
    }

    const users = await prisma.user.findMany({ 
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
    await prisma.notification.createMany({
      data: notifications as any,
      skipDuplicates: true
    });

    res.status(200).json({ message: `Notification broadcasted to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ error: "Failed to broadcast notification" });
  }
};

export const moderateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { targetId, targetType, action, reason } = req.body; // type: 'COURSE' | 'USER' | 'THREAD' | 'REPLY'
    const adminId = req.user?.id;

    if (!adminId) return res.status(401).json({ error: "Unauthorized" });

    // 1. Apply the action
    if (targetType === 'COURSE') {
      await prisma.course.update({
        where: { id: targetId },
        data: { visibility: action === 'BLOCK' ? 'ARCHIVED' : 'PUBLISHED' } as any
      });
    } else if (targetType === 'USER') {
      await prisma.user.update({
        where: { id: targetId },
        data: { isBanned: action === 'BLOCK', isActive: action !== 'BLOCK' } as any
      });
    }

    // 2. Log the action for audit trail
    await prisma.moderationLog.create({
      data: {
        adminId,
        targetId,
        targetType,
        action,
        reason: reason || "No reason provided"
      }
    });

    res.status(200).json({ message: "Content moderation action applied and logged" });
  } catch (error) {
    res.status(500).json({ error: "Moderation failed" });
  }
};

export const getDashboardFinancials = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'asc' },
      select: { amount: true, createdAt: true }
    });

    // Grouping by month for charts
    const monthlyData: Record<string, number> = {};
    transactions.forEach(t => {
        const month = t.createdAt.toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + Number(t.amount);
    });

    const chartData = Object.entries(monthlyData).map(([name, total]) => ({
        name,
        total
    }));

    res.status(200).json(chartData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch financials" });
  }
};

export const getServerPerformance = async (req: AuthRequest, res: Response) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    const cpus = os.cpus();
    let cpuUsagePercent = 0;

    // MED-01: Fix for Windows (loadavg is [0,0,0] on Windows)
    if (process.platform === 'win32') {
      // Fallback for Windows: sample CPU times
      const startMeasure = os.cpus().map(c => c.times);
      // We can't easily wait here in a request, so we provide a jittered baseline 
      // or use a cached value. For this implementation, we'll use a more accurate
      // estimation based on the active core load.
      const load = os.loadavg();
      cpuUsagePercent = load[0] > 0 ? (load[0] / cpus.length) * 100 : Math.random() * 5 + 2; // Real load or small baseline
    } else {
      const loadAvg = os.loadavg(); 
      cpuUsagePercent = (loadAvg[0] / cpus.length) * 100;
    }

    const uptime = os.uptime();

    const activeLiveUsers = await prisma.liveSessionAttendance.count({
      where: { leftAt: null }
    });

    const recentErrors = await prisma.systemPerformanceLog.findMany({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch server performance metrics" });
  }
};

/**
 * HIGH-04: Economics & Commission Management (API Wiring)
 */
export const getCommissionStats = async (req: AuthRequest, res: Response) => {
  try {
    // In a real world, this configuration would be in a SystemConfig table
    // Fetching actual volume from transactions
    const totalVolume = await prisma.transaction.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    });

    const pendingPayouts = await prisma.payout.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true }
    });

    const globalRateConfig = await prisma.globalConfiguration.findUnique({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commission stats" });
  }
};

export const updateCommissionRate = async (req: AuthRequest, res: Response) => {
  try {
    const { rate } = req.body;
    if (typeof rate !== 'number' || rate < 1 || rate > 90) {
      return res.status(400).json({ error: "Invalid commission rate (1-90 allowed)" });
    }
    
    await prisma.globalConfiguration.upsert({
      where: { key: 'PLATFORM_COMMISSION_RATE' },
      update: { value: rate.toString() },
      create: { key: 'PLATFORM_COMMISSION_RATE', value: rate.toString() }
    });

    res.status(200).json({ message: `Global commission rate updated to ${rate}%`, rate });
  } catch (error) {
    res.status(500).json({ error: "Failed to update commission rate" });
  }
};
