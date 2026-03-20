"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = require("../utils/prisma");
const socket_1 = require("../socket");
/**
 * Get user's notifications (paginated)
 */
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const notifications = await prisma_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const unreadCount = await prisma_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
        res.status(200).json({ notifications, unreadCount, page, limit });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
exports.getNotifications = getNotifications;
/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        const notification = await prisma_1.prisma.notification.findUnique({
            where: { id: String(id) },
        });
        if (!notification || notification.userId !== userId) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        const updated = await prisma_1.prisma.notification.update({
            where: { id: String(id) },
            data: { isRead: true },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};
exports.markAsRead = markAsRead;
/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        await prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
};
exports.markAllAsRead = markAllAsRead;
/**
 * Internal helper to send notifications across domains
 */
const sendNotification = async (userId, type, title, message, linkUrl) => {
    try {
        const notification = await prisma_1.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                linkUrl,
            },
        });
        // Fire websocket event
        const io = (0, socket_1.getSocketServer)();
        if (io) {
            io.to(`user:${userId}`).emit('new_notification', notification);
        }
        return notification;
    }
    catch (error) {
        console.error('Send notification internal error:', error);
        // Don't throw, let the main request succeed even if notification fails
    }
};
exports.sendNotification = sendNotification;
