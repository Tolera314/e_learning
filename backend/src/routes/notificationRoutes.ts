import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
