import { Router } from "express";
import { prisma } from "../utils/prisma";
import {
  getLiveClassAnalytics,
  getStudentProgressReport,
  getQuizPerformance,
  logSystemPerformance,
  getSystemMetrics,
  createLiveSession,
  getInstructorCourses,
  getMonetizationStats,
  getInstructorDashboardStats,
  getRecentActivity,
  getInstructorDashboardAnalytics,
  getInstructorReviews,
  replyToReview,
  getInstructorStudents,
  getInstructorEarnings,
  getInstructorProfile,
  updateInstructorProfile,
  startDirectLive,
  endDirectLive
} from "../controllers/instructorController";
import { protect, authorize } from "../middlewares/authMiddleware";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary";

const router = Router();

// Cloudinary storage for instructor avatars
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file: any) => ({
        folder: "eda/avatars",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 400, height: 400, crop: "fill" }],
        public_id: `avatar_instructor_${req.user?.id}`,
    }),
} as any);

const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// All instructor routes require authentication and INSTRUCTOR or ADMIN role
router.use(protect as any);
router.use(authorize('INSTRUCTOR', 'ADMIN') as any);

// Profile
router.get("/profile", getInstructorProfile);
router.patch("/profile", updateInstructorProfile);
router.post("/avatar", uploadAvatar.single("avatar"), async (req: any, res: any) => {
  try {
      const fileUrl = (req.file as any)?.path;
      if (!fileUrl) return res.status(400).json({ error: "No file uploaded" });
      await prisma.user.update({ where: { id: req.user.id }, data: { avatar: fileUrl } });
      res.status(200).json({ avatar: fileUrl });
  } catch (e) {
      res.status(500).json({ error: "Avatar upload failed" });
  }
});

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
// TODO: Implement assignment controllers
router.get("/monetization/stats", getMonetizationStats);
router.get("/dashboard/stats", getInstructorDashboardStats);
router.get("/dashboard/activity", getRecentActivity);
router.get("/dashboard-analytics", getInstructorDashboardAnalytics);

// Reviews
router.get("/reviews", getInstructorReviews);
router.post("/reviews/:id/reply", replyToReview);

// Students
router.get("/students", getInstructorStudents);

// Earnings
router.get("/earnings", getInstructorEarnings);

// Direct Live (TikTok Style)
router.post("/go-live", startDirectLive);
router.post("/end-live/:sessionId", endDirectLive);

export default router;
