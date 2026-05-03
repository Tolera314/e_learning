import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getSocketServer } from '../socket';
import { AuthRequest } from '../middlewares/authMiddleware';
import { validateEnrollment, validateCourseOwnership } from '../utils/security';
import logger from '../utils/logger';

export const createPoll = async (req: AuthRequest, res: Response) => {
  try {
    const { liveSessionId, question, options, isAnonymous } = req.body;
    const instructorId = req.user?.id;

    if (!instructorId) return res.status(401).json({ error: "Unauthorized" });

    // Verify ownership of the live session's course
    const session = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
      include: { lesson: { include: { module: { select: { courseId: true } } } } }
    });

    if (!session || !(await validateCourseOwnership(session.lesson.module.courseId, instructorId))) {
      return res.status(403).json({ error: "Access denied: Not your session" });
    }

    if (!liveSessionId || !question || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: 'Invalid poll data' });
    }

    const poll = await prisma.poll.create({
      data: {
        liveSessionId,
        question,
        isAnonymous: !!isAnonymous,
        options: {
          create: options.map((opt: string, index: number) => ({
            text: opt,
            order: index
          }))
        }
      },
      include: {
        options: true
      }
    });

    // Broadcast poll creation
    const io = getSocketServer();
    if (io) {
      io.to(`session:${liveSessionId}`).emit('poll:new', poll);
    }

    res.status(201).json(poll);
  } catch (error) {
    logger.error({ error }, 'Failed to create poll');
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

export const getSessionPolls = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.id;

  try {
    const polls = await prisma.poll.findMany({
      where: { liveSessionId: String(sessionId) },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { responses: true }
            }
          }
        },
        responses: {
          where: { userId } // Check if current user has voted
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format polls to include totals and user choice
    const formattedPolls = polls.map((poll: any) => {
      const totalVotes = poll.options.reduce((acc: number, opt: any) => acc + opt._count.responses, 0);
      return {
        ...poll,
        totalVotes,
        userHasVoted: poll.responses.length > 0,
        userOptionId: poll.responses[0]?.optionId,
        options: poll.options.map((opt: any) => ({
          ...opt,
          votes: opt._count.responses,
          percentage: totalVotes > 0 ? Math.round((opt._count.responses / totalVotes) * 100) : 0
        }))
      };
    });

    res.json(formattedPolls);
  } catch (error) {
    logger.error({ error, sessionId }, 'Failed to fetch session polls');
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
};

export const votePoll = async (req: AuthRequest, res: Response) => {
  try {
    const { pollId, optionId } = req.body;
    const studentId = req.user?.id;

    if (!studentId) return res.status(401).json({ error: "Unauthorized" });

    // Security: Verify student is enrolled in the session's course
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { liveSession: { include: { lesson: { include: { module: { select: { courseId: true } } } } } } }
    });

    if (!poll || !(await validateEnrollment(poll.liveSession.lesson.module.courseId, studentId))) {
      return res.status(403).json({ error: "Access denied: Enrollment required to vote" });
    }

    if (!pollId || !optionId) {
      return res.status(400).json({ error: 'Invalid vote data' });
    }

    if (!poll.isOpen) {
      return res.status(400).json({ error: 'Poll is closed' });
    }

    // Upsert response
    const response = await prisma.pollResponse.upsert({
      where: {
        userId_pollId: {
          userId: studentId,
          pollId
        }
      },
      update: { optionId },
      create: {
        userId: studentId,
        pollId,
        optionId
      }
    });

    // Fetch updated results
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: { select: { responses: true } }
          }
        }
      }
    });

    if (updatedPoll) {
      const totalVotes = updatedPoll.options.reduce((acc: number, opt: any) => acc + opt._count.responses, 0);
      const results = {
        pollId,
        totalVotes,
        options: updatedPoll.options.map((opt: any) => ({
          id: opt.id,
          votes: opt._count.responses,
          percentage: totalVotes > 0 ? Math.round((opt._count.responses / totalVotes) * 100) : 0
        }))
      };

      // Broadcast results
      const io = getSocketServer();
      if (io) {
        io.to(`session:${updatedPoll.liveSessionId}`).emit('poll:results', results);
      }
    }

    res.json(response);
  } catch (error) {
    logger.error({ error }, 'Failed to record poll vote');
    res.status(500).json({ error: 'Failed to vote' });
  }
};

export const closePoll = async (req: Request, res: Response) => {
  const { pollId } = req.params;
  const instructorId = (req as any).user.id;

  try {
    const poll = await prisma.poll.findUnique({
      where: { id: String(pollId) },
      include: {
        liveSession: {
          include: {
            lesson: {
              include: {
                module: {
                  include: { course: true }
                }
              }
            }
          }
        }
      }
    });

    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    
    if ((poll as any).liveSession.lesson.module.course.instructorId !== instructorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedPoll = await prisma.poll.update({
      where: { id: String(pollId) },
      data: { isOpen: false }
    });

    // Broadcast close event
    const io = getSocketServer();
    if (io) {
      io.to(`session:${poll.liveSessionId}`).emit('poll:closed', { pollId });
    }

    res.json(updatedPoll);
  } catch (error) {
    logger.error({ error, pollId }, 'Failed to close poll');
    res.status(500).json({ error: 'Failed to close poll' });
  }
};
