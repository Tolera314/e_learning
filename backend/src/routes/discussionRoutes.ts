import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware';
import rateLimit from 'express-rate-limit';
import {
  getCourseDiscussions,
  createThread,
  getThreadDetails,
  addReply,
  toggleReaction,
  moderateThread,
  deleteReply
} from '../controllers/discussionController';

const router = express.Router();

// Rate limiter for posting threads/replies
const postLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // Limit each user to 15 forum actions per 5 mins
  message: { error: 'Too many posts created from this IP, please try again after 5 minutes.' },
});

// Protect all routes
router.use(protect);

// Shared Routes (Student & Instructor)
router.get('/courses/:courseId/discussions', getCourseDiscussions);
router.post('/courses/:courseId/discussions', postLimiter, createThread);

router.get('/discussions/:threadId', getThreadDetails);
router.post('/discussions/:threadId/replies', postLimiter, addReply);
router.post('/discussions/:threadId/react', toggleReaction);

// Instructor / Admin Only Moderation Routes
router.patch('/instructor/discussions/:threadId/moderate', authorize('INSTRUCTOR', 'ADMIN'), moderateThread);
router.delete('/instructor/replies/:replyId', authorize('INSTRUCTOR', 'ADMIN'), deleteReply);

export default router;
