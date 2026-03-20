import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getSocketServer } from '../socket';

export const getCourseDiscussions = async (req: Request, res: Response) => {
  try {
    const courseId = String(req.params.courseId);
    const { status, search } = req.query;

    const query: any = {
      where: {
        courseId,
        status: status ? String(status) : { not: 'DELETED' }
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        _count: { select: { replies: { where: { isDeleted: false } }, reactions: true } }
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ]
    };

    if (search) {
      query.where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { content: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    const threads = await prisma.discussionThread.findMany(query);
    res.status(200).json(threads);
  } catch (error) {
    console.error("Fetch threads error:", error);
    res.status(500).json({ error: "Failed to fetch discussion threads" });
  }
};

export const createThread = async (req: any, res: Response) => {
  try {
    const courseId = String(req.params.courseId);
    const { title, content } = req.body;
    const { id: authorId, role } = req.user;

    const isInstructor = role === 'INSTRUCTOR' || role === 'ADMIN';

    const thread = await prisma.discussionThread.create({
      data: {
        courseId,
        authorId,
        title: String(title),
        content: String(content),
        isPinned: isInstructor && req.body.isPinned ? true : false,
        isAnnouncement: isInstructor && req.body.isAnnouncement ? true : false
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        _count: { select: { replies: true, reactions: true } }
      }
    });

    const io = getSocketServer();
    if (io) {
      io.to(`course_${courseId}`).emit('new_thread', thread);
    }

    res.status(201).json(thread);
  } catch (error) {
    console.error("Create thread error:", error);
    res.status(500).json({ error: "Failed to create discussion thread" });
  }
};

export const getThreadDetails = async (req: Request, res: Response) => {
  try {
    const threadId = String(req.params.threadId);

    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        reactions: { select: { userId: true, type: true } },
        replies: {
          where: { isDeleted: false, parentId: null },
          include: {
            author: { select: { id: true, name: true, avatar: true, role: true } },
            reactions: { select: { userId: true, type: true } },
            children: {
              where: { isDeleted: false },
              include: {
                author: { select: { id: true, name: true, avatar: true, role: true } },
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!thread || thread.status === 'DELETED') {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.status(200).json(thread);
  } catch (error) {
    console.error("Get thread error:", error);
    res.status(500).json({ error: "Failed to fetch thread details" });
  }
};

export const addReply = async (req: any, res: Response) => {
  try {
    const threadId = String(req.params.threadId);
    const { content, parentId } = req.body;
    const authorId = req.user.id;

    const thread = await prisma.discussionThread.findUnique({ where: { id: threadId } });
    if (!thread || thread.status === 'LOCKED' || thread.status === 'DELETED') {
      return res.status(400).json({ error: "Cannot reply to this thread" });
    }

    const reply = await prisma.discussionReply.create({
      data: {
        threadId,
        authorId,
        content: String(content),
        parentId: parentId ? String(parentId) : undefined,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
      }
    });

    // Update thread's updatedAt to bump it to the top
    await prisma.discussionThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() }
    });

    const io = getSocketServer();
    if (io) {
      io.to(`course_${thread.courseId}`).emit('new_reply', reply);
    }

    res.status(201).json(reply);
  } catch (error) {
    console.error("Add reply error:", error);
    res.status(500).json({ error: "Failed to add reply" });
  }
};

export const toggleReaction = async (req: any, res: Response) => {
  try {
    const threadId = String(req.params.threadId);
    const { replyId, type } = req.body; // type defaults to 'LIKE'
    const userId = req.user.id;
    const reactionType = String(type || 'LIKE');

    let currentReaction;
    if (replyId) {
      currentReaction = await prisma.discussionReaction.findUnique({
        where: { userId_replyId_type: { userId, replyId: String(replyId), type: reactionType } }
      });
    } else {
      currentReaction = await prisma.discussionReaction.findUnique({
        where: { userId_threadId_type: { userId, threadId, type: reactionType } }
      });
    }

    if (currentReaction) {
      await prisma.discussionReaction.delete({ where: { id: currentReaction.id } });
      return res.status(200).json({ message: "Reaction removed", added: false });
    } else {
      await prisma.discussionReaction.create({
        data: {
          userId,
          threadId: replyId ? undefined : threadId,
          replyId: replyId ? String(replyId) : undefined,
          type: reactionType
        }
      });
      return res.status(201).json({ message: "Reaction added", added: true });
    }
  } catch (error) {
    console.error("Toggle reaction error:", error);
    res.status(500).json({ error: "Failed to toggle reaction" });
  }
};

// Instructor / Admin Methods
export const moderateThread = async (req: any, res: Response) => {
  try {
    const threadId = String(req.params.threadId);
    const { action, reason } = req.body; // PIN, UNPIN, LOCK, DELETE
    const adminId = req.user.id;

    let updateData: any = {};
    if (action === 'PIN') updateData.isPinned = true;
    if (action === 'UNPIN') updateData.isPinned = false;
    if (action === 'LOCK') updateData.status = 'LOCKED';
    if (action === 'DELETE') updateData.status = 'DELETED';

    const thread = await prisma.discussionThread.update({
      where: { id: threadId },
      data: updateData
    });

    if (action === 'DELETE' || action === 'LOCK') {
      await prisma.moderationLog.create({
        data: {
          adminId,
          action: `THREAD_${action}`,
          targetId: threadId,
          targetType: 'THREAD',
          reason: reason ? String(reason) : undefined
        }
      });
      const io = getSocketServer();
      if (io) {
        io.to(`course_${thread.courseId}`).emit('thread_moderated', { threadId, action });
      }
    }

    res.status(200).json(thread);
  } catch (error) {
    console.error("Moderate thread error:", error);
    res.status(500).json({ error: "Failed to apply moderation" });
  }
};

export const deleteReply = async (req: any, res: Response) => {
  try {
    const replyId = String(req.params.replyId);
    const { reason } = req.body;
    const adminId = req.user.id;

    const reply = await prisma.discussionReply.update({
      where: { id: replyId },
      data: { isDeleted: true, content: "[This reply was removed by a moderator]" }
    });

    await prisma.moderationLog.create({
      data: {
        adminId,
        action: 'REPLY_DELETE',
        targetId: replyId,
        targetType: 'REPLY',
        reason: reason ? String(reason) : undefined
      }
    });

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Delete reply error:", error);
    res.status(500).json({ error: "Failed to delete reply" });
  }
};
