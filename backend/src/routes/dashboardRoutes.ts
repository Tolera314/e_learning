import express from 'express';
import { getStudentDashboard, getInstructorDashboard, getAdminDashboard } from '../controllers/dashboardController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/student', protect, authorize('STUDENT'), getStudentDashboard);
router.get('/instructor', protect, authorize('INSTRUCTOR'), getInstructorDashboard);
router.get('/admin', protect, authorize('ADMIN'), getAdminDashboard);

export default router;
