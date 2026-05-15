import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { validateEnrollment } from "../utils/security";

export const getStudentTasks = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            select: { courseId: true }
        });
        const courseIds = enrollments.map((e: any) => e.courseId);

        if (courseIds.length === 0) {
            return res.status(200).json([]);
        }

        const [assignments, quizzes] = await Promise.all([
            prisma.assignment.findMany({
                where: { lesson: { module: { courseId: { in: courseIds } } } },
                include: {
                    lesson: { select: { title: true, module: { select: { course: { select: { title: true } } } } } },
                    submissions: { where: { studentId }, take: 1, orderBy: { submittedAt: 'desc' }}
                }
            }),
            prisma.quiz.findMany({
                where: { lesson: { module: { courseId: { in: courseIds } } } },
                include: {
                    lesson: { select: { title: true, module: { select: { course: { select: { title: true } } } } } },
                    submissions: { where: { studentId }, take: 1, orderBy: { createdAt: 'desc' }},
                    _count: { select: { questions: true } }
                }
            })
        ]);

        const formattedAssignments = assignments.map((a: any) => {
            const sub = a.submissions[0];
            const isLate = a.deadline && new Date() > new Date(a.deadline) && !sub;
            return {
                id: a.id,
                title: a.instructions || "Assignment", // some title 
                course: a.lesson?.module?.course?.title || "Unknown Course",
                type: "assignment",
                status: sub ? (sub.grade ? "completed" : "submitted") : "todo",
                score: sub?.grade ? `${sub.grade}/${a.maxPoints}` : (sub ? "Pending" : "—"),
                date: isLate && !sub ? "Overdue" : (a.deadline ? `Due: ${new Date(a.deadline).toLocaleDateString()}` : "No Deadline"),
                rawDate: a.deadline ? new Date(a.deadline).getTime() : 0
            };
        });

        const formattedQuizzes = quizzes.map((q: any) => {
            const sub = q.submissions[0];
            return {
                id: q.id,
                title: q.title,
                course: q.lesson?.module?.course?.title || "Unknown Course",
                type: "quiz",
                status: sub ? (sub.score >= q.passingScore ? "completed" : "submitted") : "todo",
                score: sub ? `${sub.score}%` : "—",
                date: `Duration: ${q.durationMinutes || 15} min`,
                questions: q._count.questions,
                timeLimit: q.durationMinutes || 15,
                rawDate: 0 
            };
        });

        const allTasks = [...formattedAssignments, ...formattedQuizzes].sort((a, b) => b.rawDate - a.rawDate);

        res.status(200).json(allTasks);
    } catch (error) {
        console.error("Failed to fetch student tasks:", error);
        res.status(500).json({ error: "Failed to fetch student tasks" });
    }
};

export const getStudentAssignments = async (req: any, res: Response) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;

        const isEnrolled = await validateEnrollment(courseId, studentId);
        if (!isEnrolled) return res.status(403).json({ error: "You are not enrolled in this course" });

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
        const file = req.file as any;

        // Security: Verify assignment belongs to a course the student is enrolled in
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { 
                lesson: { 
                    include: { 
                        module: { 
                            select: { courseId: true } 
                        } 
                    } 
                } 
            }
        });

        if (!assignment || !(await validateEnrollment(assignment.lesson.module.courseId, studentId))) {
            return res.status(403).json({ error: "Access denied: Enrollment required" });
        }

        const { textContent } = req.body;

        if (!file && !textContent) {
            return res.status(400).json({ error: "Please provide either a file or a text submission." });
        }

        const fileUrl = file ? (file.path || file.secure_url || `/uploads/${file.filename}`) : null;

        const submission = await prisma.assignmentSubmission.create({
            data: {
                assignmentId,
                studentId,
                fileUrl,
                textContent,
                originalName: file ? file.originalname : "Text Submission",
                fileSize: file ? file.size : null,
                status: "SUBMITTED",
            }
        });

        await prisma.studentActivityLog.create({
            data: {
                studentId,
                action: "SUBMIT_ASSIGNMENT",
                metadata: JSON.stringify({ assignmentId, submissionId: submission.id })
            }
        });

        res.status(201).json({ message: "Assignment submitted successfully", submission });
    } catch (error) {
        console.error("Assignment Submission Error:", error);
        res.status(500).json({ error: "Failed to submit assignment" });
    }
};

export const getMyAssignments = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        
        // Find all courses student is enrolled in
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            select: { courseId: true }
        });
        const courseIds = enrollments.map((e: any) => e.courseId);

        const assignments = await prisma.assignment.findMany({
            where: {
                lesson: { module: { courseId: { in: courseIds } } }
            },
            include: {
                lesson: { select: { title: true, module: { select: { course: { select: { title: true } } } } } },
                submissions: { where: { studentId }, take: 1, orderBy: { submittedAt: 'desc' }}
            },
            orderBy: { deadline: 'asc' }
        });

        // Map to frontend-friendly format
        const result = assignments.map((a: any) => {
            const sub = a.submissions[0];
            const isLate = new Date() > new Date(a.deadline) && !sub;
            return {
                id: a.id,
                title: a.title,
                course: a.lesson.module.course.title,
                type: "assignment",
                status: sub ? (sub.grade ? "completed" : "submitted") : "todo",
                score: sub?.grade ? `${sub.grade}/${a.totalPoints}` : (sub ? "Pending — Awaiting grade" : "—"),
                date: isLate && !sub ? "Overdue" : `Due: ${new Date(a.deadline).toLocaleDateString()}`,
            };
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch assignments" });
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

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { 
                module: { 
                    select: { courseId: true } 
                } 
            }
        });

        if (!lesson) return res.status(404).json({ error: "Lesson not found" });
        const courseId = lesson.module.courseId;

        // Security: Verify enrollment
        const isEnrolled = await validateEnrollment(courseId, studentId);
        if (!isEnrolled) return res.status(403).json({ error: "You are not enrolled in this course" });

        // 1. Record/Update student progress
        const isNowCompleted = progress >= 90;
        
        await (prisma as any).lessonProgress.upsert({
            where: {
                studentId_lessonId: { studentId, lessonId }
            },
            update: {
                watchTimeSeconds: { increment: durationWatched || 0 },
                isCompleted: isNowCompleted
            },
            create: {
                studentId,
                lessonId,
                watchTimeSeconds: durationWatched || 0,
                isCompleted: isNowCompleted
            }
        });

        // 2. Recalculate Course progress if lesson was just completed
        if (isNowCompleted) {
            const [totalLessons, completedLessons] = await Promise.all([
                prisma.lesson.count({ where: { module: { courseId } } }),
                (prisma as any).lessonProgress.count({ 
                    where: { 
                        studentId, 
                        isCompleted: true, 
                        lesson: { module: { courseId } } 
                    } 
                })
            ]);

            const newProgressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

            await prisma.enrollment.update({
                where: { studentId_courseId: { studentId, courseId } },
                data: { 
                    progressPercent: newProgressPercent,
                    isCompleted: newProgressPercent >= 99 // Allow some floating point grace
                }
            });
        }

        // 3. Increment instructor watch time
        if (durationWatched && durationWatched > 0 && durationWatched < 3600) {
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { instructorId: true }
            });

            if (course?.instructorId) {
                const watchMinutes = durationWatched / 60;
                await (prisma.instructorProfile as any).update({
                    where: { userId: course.instructorId },
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

        // 1. Get followed instructor IDs
        const following = await (prisma as any).follower.findMany({
            where: { studentId },
            select: { instructorId: true }
        });
        const instructorIds = following.map((f: any) => f.instructorId);

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            enrolledCourses,
            completedLessons,
            quizAgg,
            upcomingLive,
            enrollments,
            activeLive,
            certificatesCount,
            pendingAssignmentCount,
            recentActivity,
            user
        ] = await Promise.all([
            prisma.enrollment.count({ where: { studentId } }),
            (prisma as any).lessonProgress.count({ where: { studentId, isCompleted: true } }),
            (prisma as any).quizSubmission.aggregate({ where: { studentId }, _avg: { score: true } }),
            prisma.liveSession.count({ where: { startTime: { gte: now }, isLive: false } }),
            prisma.enrollment.findMany({ where: { studentId }, select: { progressPercent: true } }),
            prisma.liveSession.findMany({
                where: {
                    isLive: true,
                    lesson: { module: { course: { instructorId: { in: instructorIds } } } }
                },
                include: {
                    lesson: { include: { module: { include: { course: { include: { instructor: true } } } } } }
                }
            }),
            prisma.certificate.count({ where: { studentId } }),
            // Pending assignments: enrolled courses' assignments with no submission
            prisma.assignment.count({
                where: {
                    lesson: { module: { course: { enrollments: { some: { studentId } } } } },
                    submissions: { none: { studentId } },
                    deadline: { gte: now }
                }
            }),
            // Activity logs for the last 30 days for streak calculation
            (prisma as any).studentActivityLog.findMany({
                where: {
                    studentId,
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                },
                select: { createdAt: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.findUnique({
                where: { id: studentId },
                select: { name: true, avatar: true }
            })
        ]);

        // Calculate login streak (consecutive days with activity)
        const activityDates = new Set(
            recentActivity.map((a: any) => new Date(a.createdAt).toDateString())
        );
        let streak = 0;
        const checkDate = new Date(todayStart);
        while (activityDates.has(checkDate.toDateString())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        const avgProgress = enrollments.length
            ? enrollments.reduce((sum: number, e: any) => sum + Number(e.progressPercent), 0) / enrollments.length
            : 0;

        res.status(200).json({
            studentName: user?.name || "Student",
            studentAvatar: user?.avatar || null,
            enrolledCourses,
            completedLessons,
            upcomingLive,
            certificatesCount,
            pendingTasksCount: pendingAssignmentCount,
            loginStreak: streak,
            overallProgress: `${Math.round(avgProgress)}%`,
            quizAvgScore: quizAgg._avg.score ? `${Math.round(quizAgg._avg.score)}%` : "0%",
            activeLive: activeLive.map((s: any) => ({
                id: s.id,
                title: s.lesson.title,
                instructor: s.lesson.module.course.instructor.name,
                course: s.lesson.module.course.title,
                thumbnail: s.lesson.module.course.thumbnailUrl || ""
            }))
        });
    } catch (error) {
        console.error("Student Summary Error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
};

export const getStudentLiveClassesToday = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const now = new Date();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const sessions = await prisma.liveSession.findMany({
            where: {
                startTime: { gte: now, lte: todayEnd },
                lesson: { module: { course: { enrollments: { some: { studentId } } } } }
            },
            include: {
                lesson: {
                    include: {
                        module: {
                            include: {
                                course: { include: { instructor: { select: { name: true, avatar: true } } } }
                            }
                        }
                    }
                }
            },
            orderBy: { startTime: 'asc' }
        });

        const result = sessions.map((s: any) => ({
            id: s.id,
            title: s.lesson.title,
            course: s.lesson.module.course.title,
            instructor: s.lesson.module.course.instructor.name,
            startTime: s.startTime,
            endTime: s.endTime,
            isLive: s.isLive,
            streamUrl: s.streamUrl || null,
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error("Live Classes Today Error:", error);
        res.status(500).json({ error: "Failed to fetch today's live classes" });
    }
};

export const getStudentLiveClassesUpcoming = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const now = new Date();

        const sessions = await prisma.liveSession.findMany({
            where: {
                startTime: { gte: now },
                isLive: false,
                lesson: { module: { course: { enrollments: { some: { studentId } } } } }
            },
            include: {
                lesson: {
                    include: {
                        module: {
                            include: {
                                course: { include: { instructor: { select: { name: true, avatar: true } } } }
                            }
                        }
                    }
                }
            },
            orderBy: { startTime: 'asc' },
            take: 10
        });

        const result = sessions.map((s: any) => ({
            id: s.id,
            title: s.lesson.title,
            course: s.lesson.module.course.title,
            instructor: s.lesson.module.course.instructor.name,
            startTime: s.startTime,
            endTime: s.endTime,
            isLive: s.isLive,
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error("Upcoming Live Classes Error:", error);
        res.status(500).json({ error: "Failed to fetch upcoming live classes" });
    }
};

export const getStudentPastRecordings = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const now = new Date();
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const sessions = await prisma.liveSession.findMany({
            where: {
                endTime: { lt: now },
                recordingUrl: { not: null },
                lesson: { module: { course: { enrollments: { some: { studentId } } } } }
            },
            include: {
                lesson: {
                    include: {
                        module: { include: { course: true } }
                    }
                }
            },
            orderBy: { endTime: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        });

        const result = sessions.map((s: any) => {
            const durationMs = s.endTime && s.startTime
                ? new Date(s.endTime).getTime() - new Date(s.startTime).getTime()
                : 0;
            const durationMin = Math.floor(durationMs / 60000);
            const hours = Math.floor(durationMin / 60);
            const mins = durationMin % 60;
            const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

            return {
                id: s.id,
                title: s.lesson.title,
                course: s.lesson.module.course.title,
                recordingUrl: s.recordingUrl,
                date: s.endTime,
                duration,
            };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Past Recordings Error:", error);
        res.status(500).json({ error: "Failed to fetch past recordings" });
    }
};

export const getStudentCourseDetail = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const { courseId } = req.params;

        const enrollment = await prisma.enrollment.findUnique({
            where: { studentId_courseId: { studentId, courseId } },
            include: {
                course: {
                    include: {
                        instructor: { select: { name: true, avatar: true } },
                        modules: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                lessons: {
                                    orderBy: { orderIndex: 'asc' },
                                    include: {
                                        progress: { where: { studentId } },
                                        quizzes: { select: { id: true, title: true } },
                                        assignment: { select: { id: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!enrollment) {
            return res.status(403).json({ error: "You are not enrolled in this course" });
        }

        const course = enrollment.course;
        
        // Map to a cleaner structure for the learning UI
        const curriculum = course.modules.map(module => ({
            id: module.id,
            title: module.title,
            lessons: module.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                type: lesson.type, // VIDEO, TEXT, QUIZ, ASSIGNMENT
                duration: lesson.type === 'VIDEO' ? `${Math.floor((lesson.durationSeconds || 0) / 60)}:${((lesson.durationSeconds || 0) % 60).toString().padStart(2, '0')}` : (lesson.type === 'QUIZ' ? "Quiz" : "Assignment"),
                completed: lesson.progress[0]?.isCompleted || false,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                quizId: lesson.quizzes[0]?.id || null,
                assignmentId: lesson.assignment?.id || null
            }))
        }));

        res.status(200).json({
            id: course.id,
            title: course.title,
            instructor: course.instructor.name,
            progress: Number(enrollment.progressPercent),
            isCompleted: enrollment.isCompleted,
            curriculum
        });
    } catch (error) {
        console.error("Get Course Detail Error:", error);
        res.status(500).json({ error: "Failed to fetch course details" });
    }
};

export const getStudentEnrolledCourses = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            include: {
                course: {
                    select: {
                        id: true, title: true, thumbnailUrl: true, category: true, level: true,
                        instructor: { select: { name: true, avatar: true } },
                        modules: { select: { lessons: { select: { id: true } } } }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const result = enrollments.map((e: any) => ({
            id: e.course.id,
            title: e.course.title,
            thumbnailUrl: e.course.thumbnailUrl,
            category: e.course.category,
            level: e.course.level,
            instructor: e.course.instructor.name,
            progress: Number(e.progressPercent),
            isCompleted: e.isCompleted,
            totalLessons: e.course.modules.reduce((s: number, m: any) => s + m.lessons.length, 0),
            lastAccessed: e.updatedAt,
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch enrolled courses" });
    }
};

export const getStudentProgress = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const timeframe = req.query.timeframe || '7d';

        // HIGH-07: Timeframe calculation
        let dateFilter = new Date();
        if (timeframe === '30d') {
            dateFilter.setDate(dateFilter.getDate() - 30);
        } else if (timeframe === '3m') {
            dateFilter.setMonth(dateFilter.getMonth() - 3);
        } else {
            dateFilter.setDate(dateFilter.getDate() - 7); // Default 7d
        }

        const [enrollments, allSubmissions, lessonProgressList, activityLogs] = await Promise.all([
            prisma.enrollment.findMany({
                where: { studentId },
                include: {
                    course: { select: { id: true, title: true, category: true, modules: { select: { lessons: { select: { id: true } } } } } }
                }
            }),
            (prisma as any).quizSubmission.findMany({ 
              where: { studentId, createdAt: { gte: dateFilter } }, 
              include: { 
                quiz: { 
                  include: { 
                    lesson: { 
                      include: { 
                        module: { include: { course: true } } 
                      } 
                    } 
                  } 
                } 
              },
              orderBy: { createdAt: 'desc' } 
            }),
            (prisma as any).lessonProgress.findMany({ 
              where: { studentId, updatedAt: { gte: dateFilter } } 
            }),
            (prisma as any).studentActivityLog.findMany({
                where: { studentId, createdAt: { gte: dateFilter } }
            }),
        ]);


        const totalLessons = lessonProgressList.length;
        const completedLessons = lessonProgressList.filter((l: any) => l.isCompleted).length;
        const totalWatchSeconds = lessonProgressList.reduce((s: number, l: any) => s + (l.watchTimeSeconds || 0), 0);
        
        // Aggregate Recent Quiz Scores (Limit to 7 for the chart)
        const recentQuizScores = allSubmissions.slice(0, 7).map((q: any) => q.score);
        const quizAvg = allSubmissions.length ? allSubmissions.reduce((s: number, q: any) => s + q.score, 0) / allSubmissions.length : 0;

        // EXPERT: Skill Distribution (Radar Chart Data)
        const categoriesMap: Record<string, { total: number; count: number }> = {};
        allSubmissions.forEach((q: any) => {
          const category = q.quiz?.lesson?.module?.course?.category || "General";
          if (!categoriesMap[category]) categoriesMap[category] = { total: 0, count: 0 };
          categoriesMap[category].total += q.score;
          categoriesMap[category].count += 1;
        });

        const skills = Object.entries(categoriesMap).map(([subject, { total, count }]) => ({
          subject,
          value: Math.round(total / count),
          fullMark: 100
        })).slice(0, 6); // Top 6 skills for clarity

        // AI Recommendations (Rule-Based)
        const recommendations = [];
        if (quizAvg < 60) {
          recommendations.push({
            type: "focus",
            text: "Your average quiz score is below 60%. Consider revisiting previous module summaries and taking practice tests again.",
            priority: "high"
          });
        }
        
        const weakestSkill = skills.sort((a,b) => a.value - b.value)[0];
        if (weakestSkill && weakestSkill.value < 70) {
          recommendations.push({
            type: "skill",
            text: `You are showing lower performance in ${weakestSkill.subject}. We've added some remedial materials to your recommendation feed.`,
            priority: "medium"
          });
        }

        if (totalWatchSeconds < 3600) {
          recommendations.push({
            type: "engagement",
            text: "Passive learning alert: Try spending more time on video lectures and interactive code labs this week.",
            priority: "low"
          });
        }

        const courseProgress = enrollments.map((e: any) => {
            const totalCourseLessons = e.course.modules.reduce((s: number, m: any) => s + m.lessons.length, 0);
            const courseQuizzes = allSubmissions.filter((q: any) => q.quiz?.lesson?.module?.courseId === e.course.id);
            const courseQuizAvg = courseQuizzes.length ? courseQuizzes.reduce((s: number, q: any) => s + q.score, 0) / courseQuizzes.length : 0;

            return {
                id: e.course.id,
                name: e.course.title,
                progress: Math.round(Number(e.progressPercent)),
                lessons: lessonProgressList.filter((lp: any) => lp.isCompleted && lp.lesson?.module?.courseId === e.course.id).length, 
                total: totalCourseLessons,
                quizScore: `${Math.round(courseQuizAvg)}%`,
            };
        });

        const dailyActivity = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
            const count = activityLogs.filter((a: any) => {
                const d = new Date(a.createdAt);
                return d.toDateString() === day.toDateString();
            }).length;
            return parseFloat((count * 1.5 + 0.5).toFixed(1)); 
        });

        res.status(200).json({
            overallProgress: enrollments.length ? Math.round(enrollments.reduce((s: number, e: any) => s + Number(e.progressPercent), 0) / enrollments.length) : 0,
            studyTimeHours: parseFloat((totalWatchSeconds / 3600).toFixed(1)),
            quizAccuracy: Math.round(quizAvg),
            completionRate: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
            courseProgress,
            dailyActivity,
            recentQuizScores,
            skills,
            recommendations
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch progress" });
    }
};

export const submitReview = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const { courseId, rating, comment } = req.body;
        if (!courseId || !rating) return res.status(400).json({ error: "courseId and rating are required" });

        const enrollment = await prisma.enrollment.findUnique({
            where: { studentId_courseId: { studentId, courseId } }
        });
        if (!enrollment) return res.status(403).json({ error: "You must be enrolled and have ≥50% progress to review" });
        if (Number(enrollment.progressPercent) < 50) return res.status(403).json({ error: "Complete at least 50% of the course before reviewing" });

        const existing = await (prisma.review as any).findFirst({ where: { studentId, courseId } });
        let review;
        if (existing) {
            review = await (prisma.review as any).update({ where: { id: existing.id }, data: { rating, comment } });
        } else {
            review = await (prisma.review as any).create({ data: { studentId, courseId, rating, comment } });
        }
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ error: "Failed to submit review" });
    }
};

export const getMyReviews = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const reviews = await (prisma.review as any).findMany({
            where: { studentId },
            include: { course: { select: { title: true, thumbnailUrl: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(reviews.map((r: any) => ({
            id: r.id,
            courseId: r.courseId,
            course: r.course.title,
            rating: r.rating,
            comment: r.comment,
            date: r.createdAt
        })));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};

export const submitSupportTicket = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const { subject, category, description } = req.body;
        if (!subject || !description) return res.status(400).json({ error: "Subject and description required" });

        const ticket = await (prisma as any).supportTicket.create({
            data: {
                studentId,
                subject,
                category: category || "general",
                description,
                status: "OPEN"
            }
        });

        res.status(201).json({ message: "Ticket submitted. We'll respond within 24 hours.", ticketId: ticket.id });
    } catch (error) {
        res.status(500).json({ error: "Failed to submit support ticket" });
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

export const getStudentProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { studentProfile: true }
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json({
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            bio: user.studentProfile?.subjectsOfInterest?.[0] || "",
            educationLevel: user.studentProfile?.educationLevel,
            currentGrade: user.studentProfile?.currentGrade,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

export const updateStudentProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { name, phoneNumber, bio, educationLevel } = req.body;

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { name, phoneNumber }
            }),
            prisma.studentProfile.upsert({
                where: { userId },
                create: { 
                    userId, 
                    educationLevel,
                    subjectsOfInterest: bio ? [bio] : []
                },
                update: { 
                    educationLevel,
                    subjectsOfInterest: bio ? [bio] : []
                }
            })
        ]);

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};

export const getSupportTickets = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const tickets = await (prisma as any).supportTicket.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' }
        });

        const mapped = tickets.map((t: any) => ({
            id: t.id,
            subject: t.subject,
            status: t.status,
            date: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        }));

        res.status(200).json(mapped);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
};

export const getStudentRecommendations = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;

        // Fetch student's enrolled course categories
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            include: { course: { select: { category: true } } }
        });

        const myCategories = enrollments.map((e: any) => e.course.category);
        const myCourseIds = enrollments.map((e: any) => e.courseId);

        // Simple algorithm: find highly rated courses in their categories of interest 
        // OR general popular courses they aren't enrolled in.
        const recommendations = await prisma.course.findMany({
            where: {
                visibility: 'PUBLISHED',
                id: { notIn: myCourseIds },
                OR: [
                    { category: { in: myCategories } },
                    { rating: { gte: 4.5 } }
                ]
            },
            include: { instructor: { select: { name: true } } },
            orderBy: [
                { rating: 'desc' },
                { enrollments: { _count: 'desc' } }
            ],
            take: 4
        });

        res.status(200).json(recommendations.map((c: any) => ({
            id: c.id,
            title: c.title,
            thumbnailUrl: c.thumbnailUrl,
            category: c.category,
            instructor: c.instructor.name,
            rating: c.rating,
            price: c.price,
            level: (c as any).level || "Beginner"
        })));
    } catch (error) {
        console.error("Recommendations Error:", error);
        res.status(200).json([]); // graceful fallback
    }
};

export const getStudentHomeMessages = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        
        // Fetch latest messages from the chat system involving this student
        const messages = await (prisma as any).message.findMany({
            where: {
                OR: [
                    { senderId: studentId },
                    { recipientId: studentId }
                ]
            },
            include: { 
                sender: { select: { name: true, avatar: true } },
                recipient: { select: { name: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        res.status(200).json(messages.map((m: any) => ({
            id: m.id,
            senderName: m.senderId === studentId ? "You" : m.sender.name,
            senderAvatar: m.senderId === studentId ? m.recipient.avatar : m.sender.avatar,
            recipientName: m.senderId === studentId ? m.recipient.name : "You",
            content: m.content,
            time: m.createdAt,
            isRead: m.isRead
        })));
    } catch (error) {
        res.status(200).json([]);
    }
};


export const claimCertificate = async (req: any, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { courseId } = req.params;

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    const course = await prisma.course.findUnique({ 
      where: { id: courseId },
      include: { instructor: { select: { name: true } } }
    });

    if (!student || !course) return res.status(404).json({ error: "Student or course not found" });

    const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } }
    });

    if (!enrollment || Number(enrollment.progressPercent) < 100) {
        return res.status(400).json({ error: "You must complete 100% of the course to claim your certificate." });
    }

    // Check existing
    let certificate = await prisma.certificate.findFirst({
        where: { studentId, courseId }
    });

    if (!certificate) {
      certificate = await prisma.certificate.create({
          data: {
              studentId,
              courseId,
              verificationCode: `EDA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
          }
      });
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // Landscape A4
    const { width, height } = page.getSize();
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Background and Borders
    page.drawRectangle({
      x: 20, y: 20, width: width - 40, height: height - 40,
      borderColor: rgb(0.12, 0.12, 0.12), borderWidth: 2,
    });
    page.drawRectangle({
      x: 35, y: 35, width: width - 70, height: height - 70,
      borderColor: rgb(0.5, 0.36, 0.96), borderWidth: 1,
    });

    // Header
    page.drawText('ETHIO-DIGITAL ACADEMY', {
      x: width / 2 - 130, y: height - 100, size: 28, font: boldFont, color: rgb(0.12, 0.12, 0.12)
    });
    page.drawText('CERTIFICATE OF COMPLETION', {
      x: width / 2 - 150, y: height - 140, size: 20, font: boldFont, color: rgb(0.4, 0.4, 0.4)
    });

    // Body
    page.drawText('This is to certify that', {
      x: width / 2 - 60, y: height - 220, size: 14, font: regularFont, color: rgb(0.5, 0.5, 0.5)
    });
    page.drawText(student.name.toUpperCase(), {
      x: width / 2 - (student.name.length * 7), y: height - 260, size: 34, font: boldFont, color: rgb(0.1, 0.1, 0.1)
    });
    page.drawLine({
      start: { x: width / 2 - 200, y: height - 275 },
      end: { x: width / 2 + 200, y: height - 275 },
      thickness: 2, color: rgb(0.8, 0.8, 0.8)
    });

    page.drawText(`has successfully completed the professional course`, {
      x: width / 2 - 160, y: height - 320, size: 14, font: regularFont, color: rgb(0.5, 0.5, 0.5)
    });
    page.drawText(course.title, {
      x: width / 2 - (course.title.length * 5), y: height - 355, size: 22, font: boldFont, color: rgb(0.5, 0.36, 0.96)
    });

    // Signatures
    page.drawText('INSTRUCTOR', { x: 150, y: 150, size: 10, font: boldFont, color: rgb(0.5, 0.5, 0.5) });
    page.drawText(course.instructor.name, { x: 150, y: 170, size: 14, font: regularFont, color: rgb(0.1, 0.1, 0.1) });
    
    page.drawText('DATE', { x: width - 250, y: 150, size: 10, font: boldFont, color: rgb(0.5, 0.5, 0.5) });
    page.drawText(new Date().toLocaleDateString(), { x: width - 250, y: 170, size: 14, font: regularFont, color: rgb(0.1, 0.1, 0.1) });

    // Footer / Verification
    page.drawText(`Verification Code: ${certificate.verificationCode}`, {
      x: width / 2 - 100, y: 50, size: 10, font: regularFont, color: rgb(0.6, 0.6, 0.6)
    });

    const pdfBase64 = await pdfDoc.saveAsBase64();
    res.status(200).json({ 
      ...certificate, 
      pdfData: `data:application/pdf;base64,${pdfBase64}` 
    });

  } catch (error) {
    console.error("Claim certificate failed:", error);
    res.status(500).json({ error: "Failed to claim certificate" });
  }
};

export const toggleWishlist = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const { courseId } = req.params;

        const existing = await (prisma as any).wishlist.findUnique({
            where: { studentId_courseId: { studentId, courseId } }
        });

        if (existing) {
            await (prisma as any).wishlist.delete({ where: { id: existing.id } });
            return res.status(200).json({ wishlisted: false });
        } else {
            await (prisma as any).wishlist.create({ data: { studentId, courseId } });
            return res.status(201).json({ wishlisted: true });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to toggle wishlist" });
    }
};

export const getWishlist = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const wishlist = await (prisma as any).wishlist.findMany({
            where: { studentId },
            include: { 
                course: {
                    select: {
                        id: true, title: true, thumbnailUrl: true, category: true, level: true,
                        instructor: { select: { name: true } },
                        modules: { select: { lessons: { select: { id: true } } } }
                    }
                } 
            }
        });

        const result = wishlist.map((w: any) => ({
            id: w.course.id,
            title: w.course.title,
            thumbnailUrl: w.course.thumbnailUrl,
            category: w.course.category,
            level: w.course.level,
            instructor: w.course.instructor.name,
            totalLessons: w.course.modules.reduce((s: number, m: any) => s + m.lessons.length, 0),
            isCompleted: false, // by definition if it's in wishlist it's probably not started
            progress: 0
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
};

export const toggleLiveReminder = async (req: any, res: Response) => {
    try {
        const studentId = req.user.id;
        const { sessionId } = req.params;

        const existing = await (prisma as any).liveReminder.findUnique({
            where: { studentId_liveSessionId: { studentId, liveSessionId: sessionId } }
        });

        if (existing) {
            await (prisma as any).liveReminder.delete({ where: { id: existing.id } });
            return res.status(200).json({ reminded: false });
        } else {
            await (prisma as any).liveReminder.create({ data: { studentId, liveSessionId: sessionId } });
            return res.status(201).json({ reminded: true });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to toggle reminder" });
    }
};
