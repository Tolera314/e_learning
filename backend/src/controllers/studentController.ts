import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getStudentAssignments = async (req: any, res: Response) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;

        const assignments = await prisma.assignment.findMany({
            where: {
                lesson: {
                    module: {
                        courseId: courseId
                    }
                }
            },
            include: {
                lesson: {
                    select: {
                        title: true,
                        moduleId: true,
                    }
                },
                submissions: {
                    where: { studentId: studentId },
                    take: 1,
                    orderBy: { submittedAt: 'desc' }
                }
            }
        });

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch student assignments" });
    }
};

export const submitAssignment = async (req: any, res: Response) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const submission = await prisma.assignmentSubmission.create({
            data: {
                assignmentId,
                studentId,
                fileUrl: `/uploads/submissions/${file.filename}`,
                originalName: file.originalname,
                fileSize: file.size,
                status: "SUBMITTED",
            }
        });

        // Log Activity
        await prisma.studentActivityLog.create({
            data: {
                studentId,
                action: "SUBMIT_ASSIGNMENT",
                metadata: JSON.stringify({ assignmentId, submissionId: submission.id })
            }
        });

        res.status(201).json({
            message: "Assignment submitted successfully",
            submission
        });
    } catch (error) {
        console.error("Assignment Submission Error:", error);
        res.status(500).json({ error: "Failed to submit assignment" });
    }
};

export const getSubmissionStatus = async (req: any, res: Response) => {
    try {
        const { submissionId } = req.params;
        const studentId = req.user.id;

        const submission = await prisma.assignmentSubmission.findFirst({
            where: {
                id: submissionId,
                studentId: studentId
            },
            include: {
                assignment: {
                    include: {
                        lesson: true
                    }
                }
            }
        });

        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch submission status" });
    }
};

export const toggleFollowInstructor = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const { instructorId } = req.params;

        const existingFollow = await prisma.follower.findUnique({
            where: {
                studentId_instructorId: { studentId, instructorId }
            }
        });

        if (existingFollow) {
            await prisma.$transaction([
                (prisma as any).follower.delete({ where: { id: existingFollow.id } }),
                (prisma as any).instructorProfile.update({
                    where: { userId: instructorId },
                    data: { followerCount: { decrement: 1 } }
                })
            ]);
            return res.status(200).json({ followed: false });
        } else {
            await prisma.$transaction([
                (prisma as any).follower.create({
                    data: { studentId, instructorId }
                }),
                (prisma as any).instructorProfile.update({
                    where: { userId: instructorId },
                    data: { followerCount: { increment: 1 } }
                })
            ]);
            return res.status(201).json({ followed: true });
        }
    } catch (error) {
        console.error("Toggle follow error:", error);
        res.status(500).json({ error: "Failed to process follow request" });
    }
};

export const recordLessonProgress = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const { lessonId } = req.params;
        const { progress, durationWatched } = req.body; // durationWatched in seconds

        if (!lessonId) return res.status(400).json({ error: "Lesson ID is required" });

        // 1. Record/Update student progress
        await (prisma as any).lessonProgress.upsert({
            where: {
                studentId_lessonId: { studentId, lessonId }
            },
            update: {
                watchTimeSeconds: { increment: durationWatched || 0 },
                isCompleted: progress >= 90
            },
            create: {
                studentId,
                lessonId,
                watchTimeSeconds: durationWatched || 0,
                isCompleted: progress >= 90
            }
        });

        // 2. Increment instructor watch time (only if durationWatched is valid)
        if (durationWatched && durationWatched > 0 && durationWatched < 3600) { // Sanity check max 1 hr per ping
            const lesson = await prisma.lesson.findUnique({
                where: { id: lessonId },
                include: { module: { include: { course: true } } }
            });

            if (lesson?.module?.course?.instructorId) {
                const watchMinutes = durationWatched / 60;
                await (prisma.instructorProfile as any).update({
                    where: { userId: lesson.module.course.instructorId },
                    data: { totalWatchMinutes: { increment: watchMinutes } }
                });
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Record progress error:", error);
        res.status(500).json({ error: "Failed to record progress" });
    }
};
export const getStudentDashSummary = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;

        // 1. Enrolled Courses
        const enrolledCourses = await prisma.enrollment.count({ where: { studentId } });

        // 2. Completed Lessons
        const completedLessons = await (prisma as any).lessonProgress.count({
            where: { studentId, isCompleted: true }
        });

        // 3. Quiz Avg Score
        const quizAgg = await (prisma as any).quizSubmission.aggregate({
            where: { studentId },
            _avg: { score: true }
        });

        res.status(200).json({
            enrolledCourses,
            completedLessons,
            learningStreak: "12 Days", // Mock
            quizAvgScore: quizAgg._avg.score ? `${quizAgg._avg.score.toFixed(0)}%` : "0%",
        });
    } catch (error) {
        console.error("Student Summary Error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
};

export const getStudentActivity = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;

        const activities = await (prisma as any).studentActivityLog.findMany({
            where: { studentId },
            include: { course: { select: { title: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Map internal log names to user-friendly titles
        const mappedActivities = activities.map((log: any) => {
            let title = log.action.replace(/_/g, " ").toLowerCase();
            if (log.course) title += ` in ${log.course.title}`;
            
            return {
                id: log.id,
                type: log.action.includes("QUIZ") ? "quiz" : (log.action.includes("ASSIGNMENT") ? "feedback" : "announcement"),
                title: title.charAt(0).toUpperCase() + title.slice(1),
                result: log.metadata ? JSON.parse(log.metadata).result || "" : "",
                time: log.createdAt
            };
        });

        res.status(200).json(mappedActivities);
    } catch (error) {
        console.error("Student Activity Error:", error);
        res.status(500).json({ error: "Failed to fetch student activity" });
    }
};
