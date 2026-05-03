import { Router } from 'express';
import * as pollController from '../controllers/pollController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Protect all poll routes
router.use(protect);

router.post('/', authorize('INSTRUCTOR', 'ADMIN'), pollController.createPoll);
router.get('/session/:sessionId', pollController.getSessionPolls);
router.post('/:pollId/vote', pollController.votePoll);
router.patch('/:pollId/close', authorize('INSTRUCTOR', 'ADMIN'), pollController.closePoll);

export default router;
