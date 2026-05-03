"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCourseOwnership = validateCourseOwnership;
exports.validateEnrollment = validateEnrollment;
exports.validateAssignmentOwnership = validateAssignmentOwnership;
exports.validateQuizOwnership = validateQuizOwnership;
exports.validateSubmissionOwnership = validateSubmissionOwnership;
const prisma_1 = require("./prisma");
/**
 * Validates that a course belongs to the specified instructor.
 * @throws 403 error if ownership is not confirmed.
 */
async function validateCourseOwnership(courseId, instructorId) {
    if (!courseId || !instructorId)
        return false;
    const course = await prisma_1.prisma.course.findFirst({
        where: { id: courseId, instructorId: instructorId }
    });
    return !!course;
}
/**
 * Validates that a student is enrolled in a given course.
 */
async function validateEnrollment(courseId, studentId) {
    if (!courseId || !studentId)
        return false;
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: {
            studentId_courseId: { studentId, courseId }
        }
    });
    return !!enrollment;
}
/**
 * Validates that an assignment belongs to an instructor's course.
 */
async function validateAssignmentOwnership(assignmentId, instructorId) {
    const assignment = await prisma_1.prisma.assignment.findFirst({
        where: {
            id: assignmentId,
            lesson: { module: { course: { instructorId: instructorId } } }
        }
    });
    return !!assignment;
}
/**
 * Validates that a quiz belongs to an instructor's course.
 */
async function validateQuizOwnership(quizId, instructorId) {
    const quiz = await prisma_1.prisma.quiz.findFirst({
        where: {
            id: quizId,
            lesson: { module: { course: { instructorId: instructorId } } }
        }
    });
    return !!quiz;
}
/**
 * Validates that a submission belongs to an instructor's course.
 */
async function validateSubmissionOwnership(submissionId, instructorId) {
    const submission = await prisma_1.prisma.assignmentSubmission.findFirst({
        where: {
            id: submissionId,
            assignment: { lesson: { module: { course: { instructorId: instructorId } } } }
        }
    });
    return !!submission;
}
