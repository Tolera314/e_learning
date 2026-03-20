import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getSocketServer } from '../socket';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * Get user's notifications (paginated)
 */
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.status(200).json({ notifications, unreadCount, page, limit });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: String(id) },
    });

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id: String(id) },
      data: { isRead: true },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

/**
 * Internal helper to send notifications across domains
 */
export const sendNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  linkUrl?: string
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        linkUrl,
      },
    });

    // Fire websocket event
    const io = getSocketServer();
    if (io) {
      io.to(`user:${userId}`).emit('new_notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Send notification internal error:', error);
    // Don't throw, let the main request succeed even if notification fails
  }
};
