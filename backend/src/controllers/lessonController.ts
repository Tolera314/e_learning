import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * @desc    Get all modules and lessons for a specific course
 * @route   GET /api/courses/:courseId/curriculum
 */
export const getCourseCurriculum = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId as string;
    
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          include: {
            resources: true,
            assignment: true,
            quizzes: true,
            liveSession: true
          }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });

    res.status(200).json(modules);
  } catch (error) {
    console.error("Get Course Curriculum Error:", error);
    res.status(500).json({ error: "Failed to fetch curriculum" });
  }
};

/**
 * @desc    Create a new module for a course
 * @route   POST /api/modules/:courseId
 */
export const createModule = async (req: AuthRequest, res: Response) => {
  try {
    const courseId = req.params.courseId as string;
    const { title, orderIndex } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0
      }
    });

    res.status(201).json(module);
  } catch (error) {
    console.error("Create Module Error:", error);
    res.status(500).json({ error: "Failed to create module" });
  }
};

/**
 * @desc    Update a module
 * @route   PATCH /api/modules/:moduleId
 */
export const updateModule = async (req: AuthRequest, res: Response) => {
  try {
    const moduleId = req.params.moduleId as string;
    const { title, orderIndex } = req.body;

    const module = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : undefined
      }
    });

    res.status(200).json(module);
  } catch (error) {
    console.error("Update Module Error:", error);
    res.status(500).json({ error: "Failed to update module" });
  }
};

/**
 * @desc    Delete a module
 * @route   DELETE /api/modules/:moduleId
 */
export const deleteModule = async (req: AuthRequest, res: Response) => {
  try {
    const moduleId = req.params.moduleId as string;

    // Optional: Check if module has lessons and handle accordingly
    await prisma.module.delete({
      where: { id: moduleId }
    });

    res.status(200).json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Delete Module Error:", error);
    res.status(500).json({ error: "Failed to delete module" });
  }
};

/**
 * @desc    Create a new lesson in a module
 * @route   POST /api/modules/:moduleId/lessons
 */
export const createLesson = async (req: AuthRequest, res: Response) => {
  try {
    const moduleId = req.params.moduleId as string;
    const { title, type, content, durationSeconds, orderIndex, isFreePreview } = req.body;
    const videoUrl = (req.file as any)?.path;

    if (!title || !type) {
      return res.status(400).json({ error: "Title and type are required" });
    }

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        type,
        content,
        videoUrl,
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : 0,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0,
        isFreePreview: isFreePreview === 'true' || isFreePreview === true
      }
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error("Create Lesson Error:", error);
    res.status(500).json({ error: "Failed to create lesson" });
  }
};

/**
 * @desc    Update a lesson
 * @route   PATCH /api/lessons/:lessonId
 */
export const updateLesson = async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = req.params.lessonId as string;
    const { title, type, content, durationSeconds, orderIndex, isFreePreview } = req.body;
    const videoUrl = (req.file as any)?.path;

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        type,
        content,
        videoUrl: videoUrl || undefined,
        durationSeconds: durationSeconds !== undefined ? parseInt(durationSeconds) : undefined,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : undefined,
        isFreePreview: isFreePreview !== undefined ? (isFreePreview === 'true' || isFreePreview === true) : undefined
      }
    });

    res.status(200).json(lesson);
  } catch (error) {
    console.error("Update Lesson Error:", error);
    res.status(500).json({ error: "Failed to update lesson" });
  }
};

/**
 * @desc    Delete a lesson
 * @route   DELETE /api/lessons/:lessonId
 */
export const deleteLesson = async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = req.params.lessonId as string;

    await prisma.lesson.delete({
      where: { id: lessonId }
    });

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Delete Lesson Error:", error);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
};
/**
 * @desc    Get recently published lessons for student discovery
 * @route   GET /api/lessons/recent
 */
export const getRecentLessons = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ error: "Unauthorized" });

    // Get followed instructors
    const following = await (prisma as any).follower.findMany({
      where: { studentId },
      select: { instructorId: true }
    });
    const instructorIds = following.map((f: any) => f.instructorId);

    // Get lessons from followed instructors or overall recent lessons
    const recentLessons = await prisma.lesson.findMany({
      where: {
        OR: [
          { module: { course: { instructorId: { in: instructorIds } } } },
          { isFreePreview: true }
        ]
      },
      include: {
        module: {
          include: {
            course: {
              include: {
                instructor: {
                  select: { name: true, avatar: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    });

    const result = recentLessons.map((l: any) => ({
      id: l.id,
      title: l.title,
      course: l.module.course.title,
      instructor: l.module.course.instructor.name,
      duration: `${Math.floor(l.durationSeconds / 60)}:${String(l.durationSeconds % 60).padStart(2, '0')}`,
      thumbnail: l.module.course.thumbnailUrl || ""
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Get Recent Lessons Error:", error);
    res.status(500).json({ error: "Failed to fetch recent lessons" });
  }
};
