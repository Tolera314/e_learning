import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * INSTRUCTOR: Create a new Quiz
 */
export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) return res.status(401).json({ error: 'Unauthorized' });
    const { lessonId, title, passingScore, durationMinutes, questions } = req.body;

    // Validate lesson belongs to instructor
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } }
    });

    if (!lesson || lesson.module.course.instructorId !== instructorId) {
      return res.status(403).json({ error: 'Unauthorized to add quiz to this course' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        title,
        passingScore: Number(passingScore) || 50,
        durationMinutes: Number(durationMinutes) || null,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            points: Number(q.points) || 1,
            options: {
              create: q.options.map((o: any) => ({
                text: o.text,
                isCorrect: Boolean(o.isCorrect)
              }))
            }
          }))
        }
      },
      include: {
        questions: { include: { options: true } }
      }
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

/**
 * INSTRUCTOR: Get all Quizzes created by the instructor
 */
export const getMyQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    const instructorId = req.user?.id;
    const { courseId } = req.params;
    if (!instructorId) return res.status(401).json({ error: 'Unauthorized' });

    const quizzes = await prisma.quiz.findMany({
      where: {
        lesson: { 
          module: { 
            course: { 
              instructorId,
              ...(courseId ? { id: courseId as string } : {})
            } 
          } 
        }
      },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
        _count: { select: { questions: true } },
        questions: { include: { options: true } } // Include questions for the editor
      }
    });

    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Get instructor quizzes error:', error);
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
};

/**
 * INSTRUCTOR/STUDENT: Get Quiz Details (Admin/Instructor get correct answers, students do not)
 */
export const getQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const role = req.user?.role;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: role === 'INSTRUCTOR' || role === 'ADMIN' 
              ? true 
              : { select: { id: true, text: true, questionId: true } }
          }
        }
      }
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Expert Feature: Randomize questions and options for students to prevent cheating
    if (role === 'STUDENT') {
      quiz.questions = quiz.questions.sort(() => Math.random() - 0.5);
      quiz.questions.forEach(q => {
        q.options = q.options.sort(() => Math.random() - 0.5);
      });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
};

/**
 * STUDENT: Submit Quiz for Auto-Grading & Detailed Feedback
 */
export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = (req.user as any)?.id;
    const id = req.params.id as string; 
    const { answers } = req.body; 

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { 
        questions: { 
          include: { 
            options: true 
          } 
        } 
      }
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // HIGH-01: Block re-submission brute-force — one attempt per student per quiz
    const existingSubmission = await (prisma as any).quizSubmission.findFirst({
      where: { quizId: id, studentId },
      select: { id: true, score: true, createdAt: true }
    });
    if (existingSubmission) {
      return res.status(409).json({
        error: 'You have already submitted this quiz.',
        code: 'QUIZ_ALREADY_SUBMITTED',
        previousScore: existingSubmission.score,
        submittedAt: existingSubmission.createdAt,
      });
    }

    let score = 0;
    const detailedResults = [];
    const answerRecords = [];
    const questions = quiz.questions || [];

    for (const q of questions) {
      const studentAnswer = answers.find((a: any) => a.questionId === q.id);
      const selectedOptionId = studentAnswer?.selectedOptionId || null;
      
      const correctOption = q.options.find((o: any) => o.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      if (isCorrect) score += q.points;

      // Expert Feature: Return full context for "Review Mode"
      detailedResults.push({
        questionId: q.id,
        questionText: q.text,
        selectedOptionId,
        correctOptionId: correctOption?.id,
        isCorrect,
        explanation: q.explanation || "No explanation provided."
      });

      if (selectedOptionId) {
        answerRecords.push({
          questionId: q.id,
          selectedOptionId,
          isCorrect
        });
      }
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const scorePercentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = scorePercentage >= quiz.passingScore;

    const submission = await (prisma as any).quizSubmission.create({
      data: {
        quizId: id,
        studentId,
        score: scorePercentage,
        answers: {
          create: answerRecords
        }
      }
    });

    // Mark lesson as completed if passed
    if (passed) {
      await prisma.lessonProgress.upsert({
        where: { studentId_lessonId: { studentId, lessonId: quiz.lessonId } },
        update: { isCompleted: true },
        create: { studentId, lessonId: quiz.lessonId, isCompleted: true }
      });

      // Update enrollment progress (Expert: triggering background recalculation)
      const lesson = await prisma.lesson.findUnique({
        where: { id: quiz.lessonId },
        include: { module: { include: { course: true } } }
      });

      if (lesson) {
        const courseId = lesson.module.courseId;
        const [total, completed] = await Promise.all([
          prisma.lesson.count({ where: { module: { courseId } } }),
          prisma.lessonProgress.count({ where: { studentId, isCompleted: true, lesson: { module: { courseId } } } })
        ]);
        await prisma.enrollment.updateMany({
          where: { studentId, courseId },
          data: { progressPercent: total > 0 ? (completed / total) * 100 : 0 }
        });
      }
    }

    // Log Activity
    await (prisma as any).studentActivityLog.create({
      data: {
        studentId,
        action: "SUBMIT_QUIZ",
        metadata: JSON.stringify({ quizId: id, score: scorePercentage, passed })
      }
    });

    res.status(201).json({
      submissionId: submission.id,
      score: scorePercentage,
      passed,
      results: detailedResults 
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

/**
 * INSTRUCTOR: Get Quiz Submissions
 */
export const getQuizSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const instructorId = req.user?.id;

    // HIGH-02: Verify this quiz belongs to a course owned by the requesting instructor
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: { select: { instructorId: true, title: true } }
              }
            }
          }
        }
      }
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (quiz.lesson.module.course.instructorId !== instructorId) {
      return res.status(403).json({ error: 'You do not have permission to view submissions for this quiz.' });
    }

    const submissions = await (prisma as any).quizSubmission.findMany({
      where: { quizId: id },
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
};
