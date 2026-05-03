"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const instructorController_1 = require("../controllers/instructorController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const router = (0, express_1.Router)();
// Cloudinary storage for instructor avatars
const avatarStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => ({
        folder: "eda/avatars",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 400, height: 400, crop: "fill" }],
        public_id: `avatar_instructor_${req.user?.id}`,
    }),
});
const uploadAvatar = (0, multer_1.default)({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
// All instructor routes require authentication and INSTRUCTOR or ADMIN role
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.authorize)('INSTRUCTOR', 'ADMIN'));
// Profile
router.get("/profile", instructorController_1.getInstructorProfile);
router.patch("/profile", instructorController_1.updateInstructorProfile);
router.post("/avatar", uploadAvatar.single("avatar"), async (req, res) => {
    try {
        const fileUrl = req.file?.path;
        if (!fileUrl)
            return res.status(400).json({ error: "No file uploaded" });
        await prisma_1.prisma.user.update({ where: { id: req.user.id }, data: { avatar: fileUrl } });
        res.status(200).json({ avatar: fileUrl });
    }
    catch (e) {
        res.status(500).json({ error: "Avatar upload failed" });
    }
});
// Courses
router.get("/courses", instructorController_1.getInstructorCourses);
// Live Classes
router.get("/live-sessions", instructorController_1.getLiveClassAnalytics);
router.post("/live-sessions", instructorController_1.createLiveSession);
// Student Progress
router.get("/progress/:courseId", instructorController_1.getStudentProgressReport);
// Quiz Performance
router.get("/quizzes/:quizId/analytics", instructorController_1.getQuizPerformance);
// System Performance
router.post("/performance/log", instructorController_1.logSystemPerformance);
router.get("/performance/metrics", instructorController_1.getSystemMetrics);
// Assignments
// TODO: Implement assignment controllers
router.get("/monetization/stats", instructorController_1.getMonetizationStats);
router.get("/dashboard/stats", instructorController_1.getInstructorDashboardStats);
router.get("/dashboard/activity", instructorController_1.getRecentActivity);
router.get("/dashboard-analytics", instructorController_1.getInstructorDashboardAnalytics);
// Reviews
router.get("/reviews", instructorController_1.getInstructorReviews);
router.post("/reviews/:id/reply", instructorController_1.replyToReview);
// Students
router.get("/students", instructorController_1.getInstructorStudents);
// Earnings
router.get("/earnings", instructorController_1.getInstructorEarnings);
// Direct Live (TikTok Style)
router.post("/go-live", instructorController_1.startDirectLive);
router.post("/end-live/:sessionId", instructorController_1.endDirectLive);
exports.default = router;
