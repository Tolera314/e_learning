import express from 'express';
import { getStudentDashboard, getInstructorDashboard, getAdminDashboard, getPublicStats } from '../controllers/dashboardController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/public-stats', getPublicStats);
router.get('/student', protect, authorize('STUDENT'), getStudentDashboard);
router.get('/instructor', protect, authorize('INSTRUCTOR'), getInstructorDashboard);
router.get('/admin', protect, authorize('ADMIN'), getAdminDashboard);

export default router;
