"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProgress = exports.getMyEnrolledCourses = exports.enrollInCourse = void 0;
const prisma_1 = require("../utils/prisma");
/**
 * @desc    Enroll a student in a course
 * @route   POST /api/enrollments
 * @access  Private (Student)
 */
const enrollInCourse = async (req, res) => {
    const { courseId } = req.body;
    const studentId = req.user?.id;
    if (!studentId) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    try {
        // Check if course exists
        const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
        if (!course)
            return res.status(404).json({ message: 'Course not found' });
        if (!course.isFree) {
            // Payment should be verified before reaching here
        }
        // Atomic upsert — eliminates race condition from concurrent enrollment requests
        const enrollment = await prisma_1.prisma.enrollment.upsert({
            where: { studentId_courseId: { studentId, courseId } },
            create: { studentId, courseId },
            update: {}, // Nothing to update — idempotent
            include: { course: { select: { title: true, isFree: true } } }
        });
        res.status(201).json(enrollment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error enrolling in course', error });
    }
};
exports.enrollInCourse = enrollInCourse;
/**
 * @desc    Get student's enrolled courses
 * @route   GET /api/enrollments/my-courses
 * @access  Private (Student)
 */
const getMyEnrolledCourses = async (req, res) => {
    const studentId = req.user?.id;
    if (!studentId) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    try {
        const enrollments = await prisma_1.prisma.enrollment.findMany({
            where: { studentId },
            include: {
                course: {
                    include: {
                        instructor: {
                            select: { name: true, avatar: true }
                        },
                        _count: {
                            select: { modules: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(enrollments);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching enrolled courses', error });
    }
};
exports.getMyEnrolledCourses = getMyEnrolledCourses;
/**
 * @desc    Update lesson progress
 * @route   POST /api/enrollments/progress
 * @access  Private (Student)
 */
const updateProgress = async (req, res) => {
    const { lessonId, isCompleted, watchTimeSeconds } = req.body;
    const studentId = req.user?.id;
    if (!studentId) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    try {
        const progress = await prisma_1.prisma.lessonProgress.upsert({
            where: {
                studentId_lessonId: { studentId, lessonId }
            },
            update: {
                isCompleted,
                watchTimeSeconds
            },
            create: {
                studentId,
                lessonId,
                isCompleted,
                watchTimeSeconds
            }
        });
        // Optionally update overall course progress percentage here
        res.status(200).json(progress);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating progress', error });
    }
};
exports.updateProgress = updateProgress;
