import { prisma } from "./prisma";

/**
 * Validates that a course belongs to the specified instructor.
 * @throws 403 error if ownership is not confirmed.
 */
export async function validateCourseOwnership(courseId: string, instructorId: string) {
    if (!courseId || !instructorId) return false;
    
    const course = await prisma.course.findFirst({
        where: { id: courseId, instructorId: instructorId }
    });
    
    return !!course;
}

/**
 * Validates that a student is enrolled in a given course.
 */
export async function validateEnrollment(courseId: string, studentId: string) {
    if (!courseId || !studentId) return false;

    const enrollment = await prisma.enrollment.findUnique({
        where: { 
            studentId_courseId: { studentId, courseId }
        }
    });

    return !!enrollment;
}

/**
 * Validates that an assignment belongs to an instructor's course.
 */
export async function validateAssignmentOwnership(assignmentId: string, instructorId: string) {
    const assignment = await prisma.assignment.findFirst({
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
export async function validateQuizOwnership(quizId: string, instructorId: string) {
    const quiz = await prisma.quiz.findFirst({
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
export async function validateSubmissionOwnership(submissionId: string, instructorId: string) {
    const submission = await prisma.assignmentSubmission.findFirst({
        where: {
            id: submissionId,
            assignment: { lesson: { module: { course: { instructorId: instructorId } } } }
        }
    });
    
    return !!submission;
}
