import { Router } from "express";
import {
  getLiveClassAnalytics,
  getStudentProgressReport,
  getQuizPerformance,
  logSystemPerformance,
  getSystemMetrics,
  createLiveSession,
  getInstructorCourses,
  createAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  getAssignmentStats,
  getMonetizationStats,
  getInstructorDashboardStats,
  getRecentActivity
} from "../controllers/instructorController";
import { protect, authorize } from "../middlewares/authMiddleware";

const router = Router();

// All instructor routes require authentication and INSTRUCTOR or ADMIN role
router.use(protect as any);
router.use(authorize('INSTRUCTOR', 'ADMIN') as any);

// Courses
router.get("/courses", getInstructorCourses);

// Live Classes
router.get("/live-sessions", getLiveClassAnalytics);
router.post("/live-sessions", createLiveSession);

// Student Progress
router.get("/progress/:courseId", getStudentProgressReport);

// Quiz Performance
router.get("/quizzes/:quizId/analytics", getQuizPerformance);

// System Performance
router.post("/performance/log", logSystemPerformance);
router.get("/performance/metrics", getSystemMetrics);

// Assignments
router.post("/assignments", createAssignment);
router.get("/assignments/:assignmentId/submissions", getAssignmentSubmissions);
router.patch("/submissions/:submissionId/grade", gradeSubmission);
router.get("/assignments/analytics", authorize('ADMIN') as any, getAssignmentStats);
router.get("/monetization/stats", getMonetizationStats);
router.get("/dashboard/stats", getInstructorDashboardStats);
router.get("/dashboard/activity", getRecentActivity);

export default router;
