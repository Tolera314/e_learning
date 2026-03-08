import express from 'express';
import { createCourse, getCourses, getInstructorCourses } from '../controllers/courseController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getCourses);

// Protected routes (Instructor only)
router.post('/', protect, authorize('INSTRUCTOR'), createCourse);
router.get('/instructor', protect, authorize('INSTRUCTOR'), getInstructorCourses);

export default router;
