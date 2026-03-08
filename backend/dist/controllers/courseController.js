"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstructorCourses = exports.getCourses = exports.createCourse = void 0;
const prisma_1 = require("../utils/prisma");
/**
 * @desc    Create a new course with modules and lessons
 * @route   POST /api/courses
 * @access  Private (Instructor only)
 */
const createCourse = async (req, res) => {
    const { title, shortDescription, fullDescription, category, level, language, objectives, requirements, targetAudience, isFree, price, discountPrice, modules } = req.body;
    const instructorId = req.user?.id;
    if (!instructorId) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    try {
        // Basic validation
        if (!title || !shortDescription || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const course = await prisma_1.prisma.course.create({
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
                    create: modules?.map((m, mIdx) => ({
                        title: m.title,
                        orderIndex: mIdx,
                        lessons: {
                            create: m.lessons?.map((l, lIdx) => ({
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
    }
    catch (error) {
        console.error('Course creation error:', error);
        res.status(500).json({ message: 'Error creating course', error });
    }
};
exports.createCourse = createCourse;
/**
 * @desc    Get all courses (with filters)
 * @route   GET /api/courses
 * @access  Public
 */
const getCourses = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const where = {
            visibility: 'PUBLISHED',
            deletedAt: null,
            ...(category ? { category } : {})
        };
        const [courses, total] = await Promise.all([
            prisma_1.prisma.course.findMany({
                where,
                include: {
                    instructor: { select: { name: true, avatar: true } },
                    _count: { select: { enrollments: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.prisma.course.count({ where })
        ]);
        res.status(200).json({
            data: courses,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error });
    }
};
exports.getCourses = getCourses;
/**
 * @desc    Get instructor courses
 * @route   GET /api/courses/instructor
 * @access  Private (Instructor)
 */
const getInstructorCourses = async (req, res) => {
    const instructorId = req.user?.id;
    if (!instructorId)
        return res.status(401).json({ message: 'Not authorized' });
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    try {
        const [courses, total] = await Promise.all([
            prisma_1.prisma.course.findMany({
                where: { instructorId },
                include: {
                    _count: { select: { enrollments: true, modules: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.prisma.course.count({ where: { instructorId } })
        ]);
        res.status(200).json({
            data: courses,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching instructor courses', error });
    }
};
exports.getInstructorCourses = getInstructorCourses;
