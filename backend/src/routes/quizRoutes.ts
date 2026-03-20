import express from 'express';
import { createQuiz, getQuiz, submitQuiz, getQuizSubmissions } from '../controllers/quizController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { checkSubscription } from '../middlewares/subscriptionMiddleware';

const router = express.Router();

router.use(protect);

// Instructor Routes
router.post('/instructor', authorize('INSTRUCTOR', 'ADMIN'), createQuiz);
router.get('/instructor/:id/submissions', authorize('INSTRUCTOR', 'ADMIN'), getQuizSubmissions);

// Shared/Student Routes (Subscription Required)
router.get('/:id', checkSubscription, getQuiz);
router.post('/:id/submit', checkSubscription, submitQuiz);

export default router;
