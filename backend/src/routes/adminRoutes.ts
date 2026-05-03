import { Router } from 'express';
import { protect, authorize } from '../middlewares/authMiddleware';
import {
  getAllUsers,
  updateUserStatus,
  getInstructorApplications,
  approveInstructor,
  getSystemStats,
  getAllInstructors,
  getAllCourses,
  updateCourseStatus,
  getTransactions,
  getEnrollments,
  broadcastNotification,
  moderateContent,
  getDashboardFinancials,
  getServerPerformance
} from '../controllers/adminController';

const router = Router();

// All admin routes are protected and restricted to ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', getAllUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.get('/instructors', getAllInstructors);
router.get('/instructors/applications', getInstructorApplications);
router.post('/instructors/:profileId/approve', approveInstructor);
router.get('/courses', getAllCourses);
router.patch('/courses/:courseId/status', updateCourseStatus);
router.get('/transactions', getTransactions);
router.get('/enrollments', getEnrollments);
router.post('/notifications/broadcast', broadcastNotification);
router.post('/moderation', moderateContent);
router.get('/financials', getDashboardFinancials);
router.get('/stats', getSystemStats);
router.get('/performance', getServerPerformance);

export default router;
