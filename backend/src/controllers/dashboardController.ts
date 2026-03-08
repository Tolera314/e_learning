import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../utils/prisma';
import logger from '../utils/logger';

export const getStudentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) { res.status(401).json({ message: 'Unauthorized' }); return; }

    const [enrollments, activeSubscriptions] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId },
        include: { course: { select: { title: true, category: true, level: true, thumbnailUrl: true } } }
      }),
      prisma.subscription.findMany({ where: { studentId, expiresAt: { gt: new Date() } } })
    ]);

    res.json({
      enrollments,
      activeSubscriptions,
      stats: {
        completedCourses: enrollments.filter((e) => e.isCompleted).length,
        inProgress: enrollments.filter((e) => !e.isCompleted).length,
      }
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching student dashboard');
    res.status(500).json({ message: 'Server error retrieving dashboard data' });
  }
};

export const getInstructorDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) { res.status(401).json({ message: 'Unauthorized' }); return; }

    const [courses, revenueResult] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId },
        include: { _count: { select: { enrollments: true } } }
      }),
      // Real revenue from Transaction table
      prisma.transaction.aggregate({
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
  } catch (error) {
    logger.error({ error }, 'Error fetching instructor dashboard');
    res.status(500).json({ message: 'Server error retrieving dashboard data' });
  }
};

export const getAdminDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalSubs, pendingCourses] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { expiresAt: { gt: new Date() } } }),
      prisma.course.findMany({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving admin data' });
  }
};
