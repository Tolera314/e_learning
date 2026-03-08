import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * @desc    Create a new course with modules and lessons
 * @route   POST /api/courses
 * @access  Private (Instructor only)
 */
export const createCourse = async (req: AuthRequest, res: Response) => {
  const { 
    title, 
    shortDescription, 
    fullDescription, 
    category, 
    level, 
    language, 
    objectives, 
    requirements, 
    targetAudience, 
    isFree, 
    price, 
    discountPrice, 
    modules 
  } = req.body;

  const instructorId = req.user?.id;

  if (!instructorId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    // Basic validation
    if (!title || !shortDescription || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const course = await prisma.course.create({
      data: {
        title,
        shortDescription,
        fullDescription,
        category,
        level: level || "Beginner",
        language: language || "English",
        objectives: objectives || [],
        requirements: requirements || [],
        targetAudience: targetAudience || [],
        isFree: isFree ?? true,
        price: Number(price) || 0,
        discountPrice: discountPrice ? Number(discountPrice) : null,
        instructorId,
        modules: {
          create: modules?.map((m: any, mIdx: number) => ({
            title: m.title,
            orderIndex: mIdx,
            lessons: {
              create: m.lessons?.map((l: any, lIdx: number) => ({
                title: l.title,
                type: l.type || "VIDEO",
                orderIndex: lIdx,
              }))
            }
          })) || []
        }
      },
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      }
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ message: 'Error creating course', error });
  }
};

/**
 * @desc    Get all courses (with filters)
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = async (req: AuthRequest, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
        const skip = (page - 1) * limit;
        const category = req.query.category as string | undefined;

        const where = {
            visibility: 'PUBLISHED' as const,
            deletedAt: null,
            ...(category ? { category } : {})
        };

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                include: {
                    instructor: { select: { name: true, avatar: true } },
                    _count: { select: { enrollments: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.course.count({ where })
        ]);

        res.status(200).json({
            data: courses,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error });
    }
};

/**
 * @desc    Get instructor courses
 * @route   GET /api/courses/instructor
 * @access  Private (Instructor)
 */
export const getInstructorCourses = async (req: AuthRequest, res: Response) => {
    const instructorId = req.user?.id;
    if (!instructorId) return res.status(401).json({ message: 'Not authorized' });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    try {
        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where: { instructorId },
                include: {
                    _count: { select: { enrollments: true, modules: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.course.count({ where: { instructorId } })
        ]);

        res.status(200).json({
            data: courses,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching instructor courses', error });
    }
};
