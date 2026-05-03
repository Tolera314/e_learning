"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const discussionController_1 = require("../controllers/discussionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const router = (0, express_1.Router)();
// Cloudinary storage for assignment submissions
const cloudinaryStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => ({
        folder: "eda/submissions",
        allowed_formats: ["pdf", "docx", "zip"],
        resource_type: "raw",
        public_id: `submission_${req.user?.id}_${Date.now()}`,
    }),
});
const upload = (0, multer_1.default)({
    storage: cloudinaryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
// Cloudinary storage for profile photos
const avatarStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => ({
        folder: "eda/avatars",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 400, height: 400, crop: "fill" }],
        public_id: `avatar_${req.user?.id}`,
    }),
});
const uploadAvatar = (0, multer_1.default)({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.authorize)("STUDENT"));
// Dashboard
router.get("/dashboard/summary", studentController_1.getStudentDashSummary);
router.get("/dashboard/activity", studentController_1.getStudentActivity);
// Live Classes
router.get("/live-classes/today", studentController_1.getStudentLiveClassesToday);
router.get("/live-classes/upcoming", studentController_1.getStudentLiveClassesUpcoming);
router.get("/live-classes/recordings", studentController_1.getStudentPastRecordings);
router.post("/live-classes/:sessionId/reminder", studentController_1.toggleLiveReminder);
// Courses (enrolled)
router.get("/courses", studentController_1.getStudentEnrolledCourses);
router.get("/courses/:courseId", studentController_1.getStudentCourseDetail);
router.get("/courses/:courseId/assignments", studentController_1.getStudentAssignments);
// Wishlist
router.get("/wishlist", studentController_1.getWishlist);
router.post("/wishlist/toggle/:courseId", studentController_1.toggleWishlist);
// Discussions
router.get("/courses/:courseId/discussions", discussionController_1.getCourseDiscussions);
router.post("/courses/:courseId/discussions", discussionController_1.createDiscussionThread);
router.get("/discussions/thread/:threadId", discussionController_1.getThreadDetails);
router.get("/discussions/thread/:threadId/replies", discussionController_1.getThreadReplies);
router.post("/discussions/thread/:threadId/replies", discussionController_1.addReply);
router.post("/discussions/thread/:threadId/react", discussionController_1.toggleReaction);
// Progress
router.get("/progress", studentController_1.getStudentProgress);
// Assignments & Tasks
router.get("/tasks", studentController_1.getStudentTasks);
router.get("/assignments", studentController_1.getMyAssignments);
router.post("/assignments/:assignmentId/submit", upload.single("submission"), studentController_1.submitAssignment);
router.get("/submissions/:submissionId", studentController_1.getSubmissionStatus);
// Reviews
router.post("/reviews", studentController_1.submitReview);
router.get("/reviews", studentController_1.getMyReviews);
// Profile avatar
router.post("/avatar", uploadAvatar.single("avatar"), async (req, res) => {
    try {
        const fileUrl = req.file?.path;
        if (!fileUrl)
            return res.status(400).json({ error: "No file uploaded" });
        const { prisma } = await import("../utils/prisma.js");
        await prisma.user.update({ where: { id: req.user.id }, data: { avatar: fileUrl } });
        res.status(200).json({ avatar: fileUrl });
    }
    catch (e) {
        res.status(500).json({ error: "Avatar upload failed" });
    }
});
// Following
router.post("/follow/:instructorId", studentController_1.toggleFollowInstructor);
// Support tickets
router.post("/support/ticket", studentController_1.submitSupportTicket);
router.get("/support/tickets", studentController_1.getSupportTickets);
// Profile
router.get("/profile", studentController_1.getStudentProfile);
router.patch("/profile", studentController_1.updateStudentProfile);
router.get("/recommendations", studentController_1.getStudentRecommendations);
router.get("/home/messages", studentController_1.getStudentHomeMessages);
// Certificates
router.post("/certificates/claim/:courseId", studentController_1.claimCertificate);
router.get("/certificates", async (req, res) => {
    try {
        const { prisma } = await import("../utils/prisma.js");
        const certs = await prisma.certificate.findMany({
            where: { studentId: req.user.id },
            include: { course: { select: { title: true, thumbnailUrl: true } } }
        });
        res.status(200).json(certs);
    }
    catch (e) {
        res.status(500).json({ error: "Failed to fetch certificates" });
    }
});
exports.default = router;
