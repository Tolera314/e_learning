import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getLiveClassAnalytics = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.query;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const sessions = await prisma.liveSession.findMany({
      where: {
        ...(courseId ? { lesson: { module: { courseId: courseId as string } } } : {}),
        startTime: { gte: thirtyDaysAgo },  // Scope to last 30 days
      },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
        attendance: true
      },
      orderBy: { startTime: 'desc' },
      take: 50,
    });

    const analytics = sessions.map((session: any) => ({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch live session analytics" });
  }
};

export const getStudentProgressReport = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId as string;

    const enrollments = await prisma.enrollment.findMany({
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

    const report = enrollments.map((e: any) => {
      const completedLessons = e.student.lessonProgress.filter((lp: any) => lp.isCompleted).length;
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student progress report" });
  }
};

export const getQuizPerformance = async (req: Request, res: Response) => {
  try {
    const quizId = req.params.quizId as string;

    const results = await prisma.quizSubmission.findMany({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quiz performance" });
  }
};

export const logSystemPerformance = async (req: Request, res: Response) => {
  try {
    const { type, source, message, stackTrace, metadata } = req.body;
    
    await prisma.systemPerformanceLog.create({
      data: {
        type,
        source,
        message,
        stackTrace,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    res.status(201).json({ status: "logged" });
  } catch (error) {
    res.status(500).json({ error: "Failed to log system performance" });
  }
};

export const getSystemMetrics = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.systemPerformanceLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const videoMetrics = await prisma.videoStreamMetric.aggregate({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch system metrics" });
  }
};
