"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentLessons = exports.deleteLesson = exports.updateLesson = exports.createLesson = exports.deleteModule = exports.updateModule = exports.createModule = exports.getCourseCurriculum = void 0;
const prisma_1 = require("../utils/prisma");
/**
 * @desc    Get all modules and lessons for a specific course
 * @route   GET /api/courses/:courseId/curriculum
 */
const getCourseCurriculum = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const modules = await prisma_1.prisma.module.findMany({
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
    }
    catch (error) {
        console.error("Get Course Curriculum Error:", error);
        res.status(500).json({ error: "Failed to fetch curriculum" });
    }
};
exports.getCourseCurriculum = getCourseCurriculum;
/**
 * @desc    Create a new module for a course
 * @route   POST /api/modules/:courseId
 */
const createModule = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { title, orderIndex } = req.body;
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }
        const module = await prisma_1.prisma.module.create({
            data: {
                courseId,
                title,
                orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0
            }
        });
        res.status(201).json(module);
    }
    catch (error) {
        console.error("Create Module Error:", error);
        res.status(500).json({ error: "Failed to create module" });
    }
};
exports.createModule = createModule;
/**
 * @desc    Update a module
 * @route   PATCH /api/modules/:moduleId
 */
const updateModule = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const { title, orderIndex } = req.body;
        const module = await prisma_1.prisma.module.update({
            where: { id: moduleId },
            data: {
                title,
                orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : undefined
            }
        });
        res.status(200).json(module);
    }
    catch (error) {
        console.error("Update Module Error:", error);
        res.status(500).json({ error: "Failed to update module" });
    }
};
exports.updateModule = updateModule;
/**
 * @desc    Delete a module
 * @route   DELETE /api/modules/:moduleId
 */
const deleteModule = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        // Optional: Check if module has lessons and handle accordingly
        await prisma_1.prisma.module.delete({
            where: { id: moduleId }
        });
        res.status(200).json({ message: "Module deleted successfully" });
    }
    catch (error) {
        console.error("Delete Module Error:", error);
        res.status(500).json({ error: "Failed to delete module" });
    }
};
exports.deleteModule = deleteModule;
/**
 * @desc    Create a new lesson in a module
 * @route   POST /api/modules/:moduleId/lessons
 */
const createLesson = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const { title, type, content, durationSeconds, orderIndex, isFreePreview } = req.body;
        const videoUrl = req.file?.path;
        if (!title || !type) {
            return res.status(400).json({ error: "Title and type are required" });
        }
        const lesson = await prisma_1.prisma.lesson.create({
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
    }
    catch (error) {
        console.error("Create Lesson Error:", error);
        res.status(500).json({ error: "Failed to create lesson" });
    }
};
exports.createLesson = createLesson;
/**
 * @desc    Update a lesson
 * @route   PATCH /api/lessons/:lessonId
 */
const updateLesson = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const { title, type, content, durationSeconds, orderIndex, isFreePreview } = req.body;
        const videoUrl = req.file?.path;
        const lesson = await prisma_1.prisma.lesson.update({
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
    }
    catch (error) {
        console.error("Update Lesson Error:", error);
        res.status(500).json({ error: "Failed to update lesson" });
    }
};
exports.updateLesson = updateLesson;
/**
 * @desc    Delete a lesson
 * @route   DELETE /api/lessons/:lessonId
 */
const deleteLesson = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        await prisma_1.prisma.lesson.delete({
            where: { id: lessonId }
        });
        res.status(200).json({ message: "Lesson deleted successfully" });
    }
    catch (error) {
        console.error("Delete Lesson Error:", error);
        res.status(500).json({ error: "Failed to delete lesson" });
    }
};
exports.deleteLesson = deleteLesson;
/**
 * @desc    Get recently published lessons for student discovery
 * @route   GET /api/lessons/recent
 */
const getRecentLessons = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId)
            return res.status(401).json({ error: "Unauthorized" });
        // Get followed instructors
        const following = await prisma_1.prisma.follower.findMany({
            where: { studentId },
            select: { instructorId: true }
        });
        const instructorIds = following.map((f) => f.instructorId);
        // Get lessons from followed instructors or overall recent lessons
        const recentLessons = await prisma_1.prisma.lesson.findMany({
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
        const result = recentLessons.map((l) => ({
            id: l.id,
            title: l.title,
            course: l.module.course.title,
            instructor: l.module.course.instructor.name,
            duration: `${Math.floor(l.durationSeconds / 60)}:${String(l.durationSeconds % 60).padStart(2, '0')}`,
            thumbnail: l.module.course.thumbnailUrl || ""
        }));
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Recent Lessons Error:", error);
        res.status(500).json({ error: "Failed to fetch recent lessons" });
    }
};
exports.getRecentLessons = getRecentLessons;
