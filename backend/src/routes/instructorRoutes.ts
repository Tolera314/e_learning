import { Router } from "express";
import { 
  getLiveClassAnalytics, 
  getStudentProgressReport, 
  getQuizPerformance, 
  logSystemPerformance, 
  getSystemMetrics 
} from "../controllers/instructorController";
import { protect, authorize } from "../middlewares/authMiddleware";

const router = Router();

// All instructor routes require authentication and INSTRUCTOR or ADMIN role
router.use(protect as any);
router.use(authorize('INSTRUCTOR', 'ADMIN') as any);

// Live Classes
router.get("/live-sessions", getLiveClassAnalytics);

// Student Progress
router.get("/progress/:courseId", getStudentProgressReport);

// Quiz Performance
router.get("/quizzes/:quizId/analytics", getQuizPerformance);

// System Performance
router.post("/performance/log", logSystemPerformance);
router.get("/performance/metrics", getSystemMetrics);

export default router;
