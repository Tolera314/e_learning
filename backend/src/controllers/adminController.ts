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

    const user = await prisma.user.update({
      where: { id: userId } as any,
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(isBanned !== undefined ? { isBanned } : {})
      } as any
    });

    res.status(200).json({ message: "User status updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user status" });
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
    
    // In a real system, this would be a bulk insert or a background job
    const users = await prisma.user.findMany({ where: { deletedAt: null }, select: { id: true } });
    
    const notifications = users.map(user => ({
      userId: user.id,
      title,
      message,
      type: type || 'SYSTEM',
    }));

    await prisma.notification.createMany({
      data: notifications as any
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
    // Simplified CPU load: grab the average over the past 1 minute.
    const loadAvg = os.loadavg(); 
    const cpuUsagePercent = (loadAvg[0] / cpus.length) * 100;

    const uptime = os.uptime();

    // To get socket connections / active users, we leverage studentActivityLog or db query
    // Wait, the plan also mentions active LiveAttendance counts
    const activeLiveUsers = await prisma.liveSessionAttendance.count({
      where: { leftAt: null }
    });

    // 2. Fetch Recent System Errors
    const recentErrors = await prisma.systemPerformanceLog.findMany({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch server performance metrics" });
  }
};
