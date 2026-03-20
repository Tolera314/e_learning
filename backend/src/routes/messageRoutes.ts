import express from 'express';
import { getConversations, getMessages, sendMessage, markConversationRead } from '../controllers/messageController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All message routes require authentication
router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversations/:id', getMessages);
router.post('/', sendMessage);
router.patch('/conversations/:id/read', markConversationRead);

export default router;
