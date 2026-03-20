import express from 'express';
import { createCourse, getCourses, getInstructorCourses } from '../controllers/courseController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { checkSubscription } from '../middlewares/subscriptionMiddleware';

const router = express.Router();

// Public routes
router.get('/', getCourses);

// Protected routes (Instructor only)
router.post('/', protect, authorize('INSTRUCTOR'), createCourse);
router.get('/instructor', protect, authorize('INSTRUCTOR'), getInstructorCourses);

// Student content access (Subscription Protected)
router.get('/:courseId/lessons', protect, checkSubscription, (req, res) => { /* lesson fetch logic here or in controller */ });

export default router;
