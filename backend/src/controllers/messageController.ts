import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getSocketServer } from '../socket';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * Get all conversations for a user
 */
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: userId } },
              include: { user: { select: { id: true, name: true, avatar: true } } }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      },
      orderBy: { conversation: { updatedAt: 'desc' } }
    });

    const formattedConversations = participations.map((p: any) => {
      const conv = p.conversation;
      const otherParticipant = conv.participants[0]?.user;
      const lastMessage = conv.messages[0];
      
      return {
        id: conv.id,
        title: conv.title || otherParticipant?.name || 'Unknown User',
        avatar: otherParticipant?.avatar || null,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isRead: lastMessage.isRead,
          senderId: lastMessage.senderId
        } : null,
        unreadCount: 0 // Mocked for simplicity, could do a count query for unread
      };
    });

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

/**
 * Get messages for a specific conversation
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    
    // Verify user is in conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: String(id),
          userId
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not a member of this conversation' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: String(id) },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

/**
 * Send a new message (creates conversation if it implies a new 1-on-1)
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.id;
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });
    const { receiverId, conversationId, content } = req.body;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    let activeConversationId = conversationId;

    // If no conversationId but receiverId is provided, check if a 1-on-1 thread exists or create it
    if (!activeConversationId && receiverId) {
      // Find a conversation containing both participants exactly
      // For simplicity, we create a new one, or you can query for an existing intersection
      
      const newConversation = await prisma.conversation.create({
        data: {
          isGroup: false,
          participants: {
            create: [
              { userId: senderId },
              { userId: receiverId }
            ]
          }
        }
      });
      activeConversationId = newConversation.id;
    }

    if (!activeConversationId) {
      return res.status(400).json({ error: 'Must provide conversationId or receiverId' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: activeConversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: activeConversationId },
      data: { updatedAt: new Date() }
    });

    // WebSocket Emission
    const io = getSocketServer();
    if (io) {
      // Find all participants except sender to notify them
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId: activeConversationId, userId: { not: senderId } }
      });
      
      for (const p of participants) {
        io.to(`user:${p.userId}`).emit('new_message', message);
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Mark a conversation as read
 */
export const markConversationRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;

    await prisma.message.updateMany({
      where: {
        conversationId: String(id),
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark conversation read error:', error);
    res.status(500).json({ error: 'Failed to mark conversation read' });
  }
};
