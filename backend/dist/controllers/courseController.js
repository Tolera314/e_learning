"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourse = exports.getInstructorCourses = exports.getCourse = exports.getCourses = exports.createCourse = void 0;
const prisma_1 = require("../utils/prisma");
/**
 * @desc    Create a new course with modules and lessons
 * @route   POST /api/courses
 * @access  Private (Instructor only)
 */
const createCourse = async (req, res) => {
    const { title, shortDescription, fullDescription, category, level, language, objectives, requirements, targetAudience, isFree, price, discountPrice, modules, segment } = req.body;
    const instructorId = req.user?.id;
    const thumbnailUrl = req.file?.path;
    if (!instructorId) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    try {
        // Basic validation
        if (!title || !shortDescription || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Since we're using multipart/form-data, modules might come as a stringified JSON
        let parsedModules = [];
        if (typeof modules === 'string') {
            try {
                parsedModules = JSON.parse(modules);
            }
            catch (e) {
                console.error("Failed to parse modules JSON:", e);
                parsedModules = [];
            }
        }
        else if (Array.isArray(modules)) {
            parsedModules = modules;
        }
        const parseJsonArray = (val) => {
            if (!val)
                return [];
            if (Array.isArray(val))
                return val;
            if (typeof val === 'string') {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    return [];
                }
            }
            return [];
        };
        // Phase 2: Credibility / Validation Layer
        const profile = await prisma_1.prisma.instructorProfile.findUnique({
            where: { userId: instructorId }
        });
        const requestedSegment = segment || "UNIVERSITY";
        let initialVisibility = "DRAFT";
        // If the instructor has defined segments but this isn't one of them, flag as needs review
        if (profile && profile.expertiseSegments && profile.expertiseSegments.length > 0) {
            if (!profile.expertiseSegments.includes(requestedSegment)) {
                initialVisibility = "PENDING_APPROVAL";
            }
        }
        const course = await prisma_1.prisma.course.create({
            data: {
                title,
                shortDescription,
                fullDescription,
                category,
                level: level || "Beginner",
                language: language || "English",
                objectives: parseJsonArray(objectives),
                requirements: parseJsonArray(requirements),
                targetAudience: parseJsonArray(targetAudience),
                isFree: isFree === 'true' || isFree === true,
                price: Number(price) || 0,
                discountPrice: discountPrice ? Number(discountPrice) : null,
                instructorId,
                thumbnailUrl,
                segment: requestedSegment,
                visibility: initialVisibility,
                modules: {
                    create: parsedModules?.map((m, mIdx) => ({
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
        if (req.user?.role === 'STUDENT') {
            const profile = await prisma_1.prisma.studentProfile.findUnique({
                where: { userId: req.user.id }
            });
            // Only strictly filter if they have an educationLevel. Otherwise let them see all, or we could strict filter.
            // Given requirements, we filter by level if defined.
            if (profile?.educationLevel) {
                where.segment = profile.educationLevel;
            }
        }
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
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: id },
            include: {
                instructor: { select: { name: true, avatar: true, instructorProfile: true } },
                _count: { select: { enrollments: true, modules: true } }
            }
        });
        if (!course)
            return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(course);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching course', error });
    }
};
exports.getCourse = getCourse;
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
/**
 * @desc    Update an existing course
 * @route   PATCH /api/courses/:id
 * @access  Private (Instructor only)
 */
const updateCourse = async (req, res) => {
    const id = req.params.id;
    const { title, shortDescription, fullDescription, category, level, language, objectives, requirements, targetAudience, isFree, price, discountPrice, modules, segment, visibility } = req.body;
    const instructorId = req.user?.id;
    const thumbnailUrl = req.file?.path;
    if (!instructorId) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    try {
        const existingCourse = await prisma_1.prisma.course.findUnique({
            where: { id },
            include: { modules: true }
        });
        if (!existingCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (existingCourse.instructorId !== instructorId) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }
        const parseJsonArray = (val) => {
            if (!val)
                return undefined; // Return undefined to avoid updating if not provided
            if (Array.isArray(val))
                return val;
            if (typeof val === 'string') {
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    return [];
                }
            }
            return [];
        };
        let updatedVisibility = visibility || existingCourse.visibility;
        const targetSegment = segment || existingCourse.segment;
        if (updatedVisibility === 'PUBLISHED') {
            const profile = await prisma_1.prisma.instructorProfile.findUnique({
                where: { userId: instructorId }
            });
            // Credibility checks when trying to publish
            if (profile && profile.expertiseSegments && profile.expertiseSegments.length > 0) {
                if (!profile.expertiseSegments.includes(targetSegment)) {
                    updatedVisibility = 'PENDING_APPROVAL';
                }
            }
        }
        // Update with basic fields first
        const updatedCourse = await prisma_1.prisma.course.update({
            where: { id },
            data: {
                title,
                shortDescription,
                fullDescription,
                category,
                level,
                language,
                objectives: parseJsonArray(objectives),
                requirements: parseJsonArray(requirements),
                targetAudience: parseJsonArray(targetAudience),
                isFree: isFree !== undefined ? (isFree === 'true' || isFree === true) : undefined,
                price: price !== undefined ? Number(price) : undefined,
                discountPrice: discountPrice !== undefined ? Number(discountPrice) : undefined,
                thumbnailUrl: thumbnailUrl || undefined,
                segment: segment || undefined,
                visibility: updatedVisibility !== existingCourse.visibility ? updatedVisibility : undefined,
            }
        });
        res.status(200).json(updatedCourse);
    }
    catch (error) {
        console.error('Course update error:', error);
        res.status(500).json({ message: 'Error updating course', error });
    }
};
exports.updateCourse = updateCourse;
