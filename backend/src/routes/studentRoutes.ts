import { Router } from "express";
import {
    getStudentAssignments,
    submitAssignment,
    getSubmissionStatus,
    toggleFollowInstructor,
    recordLessonProgress,
    getStudentDashSummary,
    getStudentActivity,
    getStudentProgress,
    getStudentEnrolledCourses,
    submitReview,
    getMyReviews,
    submitSupportTicket,
    getSupportTickets,
    getStudentProfile,
    updateStudentProfile,
    getMyAssignments,
    getStudentTasks,
    getStudentLiveClassesToday,
    getStudentLiveClassesUpcoming,
    getStudentPastRecordings,
    getStudentRecommendations,
    getStudentHomeMessages,
    getStudentCourseDetail,
    claimCertificate,
    toggleWishlist,
    getWishlist,
    toggleLiveReminder,
} from "../controllers/studentController";
import {
    getCourseDiscussions,
    createDiscussionThread,
    getThreadReplies,
    getThreadDetails,
    addReply,
    toggleReaction
} from "../controllers/discussionController";
import { protect, authorize } from "../middlewares/authMiddleware";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary";

const router = Router();

// Cloudinary storage for assignment submissions
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file: any) => ({
        folder: "eda/submissions",
        allowed_formats: ["pdf", "docx", "zip"],
        resource_type: "raw",
        public_id: `submission_${req.user?.id}_${Date.now()}`,
    }),
} as any);

const upload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Cloudinary storage for profile photos
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file: any) => ({
        folder: "eda/avatars",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 400, height: 400, crop: "fill" }],
        public_id: `avatar_${req.user?.id}`,
    }),
} as any);

const uploadAvatar = multer({ 
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(protect as any);
router.use(authorize("STUDENT") as any);

// Dashboard
router.get("/dashboard/summary", getStudentDashSummary);
router.get("/dashboard/activity", getStudentActivity);

// Live Classes
router.get("/live-classes/today", getStudentLiveClassesToday);
router.get("/live-classes/upcoming", getStudentLiveClassesUpcoming);
router.get("/live-classes/recordings", getStudentPastRecordings);
router.post("/live-classes/:sessionId/reminder", toggleLiveReminder);

// Courses (enrolled)
router.get("/courses", getStudentEnrolledCourses);
router.get("/courses/:courseId", getStudentCourseDetail);
router.get("/courses/:courseId/assignments", getStudentAssignments);

// Wishlist
router.get("/wishlist", getWishlist);
router.post("/wishlist/toggle/:courseId", toggleWishlist);
// Discussions
router.get("/courses/:courseId/discussions", getCourseDiscussions);
router.post("/courses/:courseId/discussions", createDiscussionThread);
router.get("/discussions/thread/:threadId", getThreadDetails);
router.get("/discussions/thread/:threadId/replies", getThreadReplies);
router.post("/discussions/thread/:threadId/replies", addReply);
router.post("/discussions/thread/:threadId/react", toggleReaction);

// Progress
router.get("/progress", getStudentProgress);

// Assignments & Tasks
router.get("/tasks", getStudentTasks);
router.get("/assignments", getMyAssignments);
router.post("/assignments/:assignmentId/submit", upload.single("submission"), submitAssignment);
router.get("/submissions/:submissionId", getSubmissionStatus);

// Reviews
router.post("/reviews", submitReview);
router.get("/reviews", getMyReviews);

// Profile avatar
router.post("/avatar", uploadAvatar.single("avatar"), async (req: any, res: any) => {
    try {
        const fileUrl = (req.file as any)?.path;
        if (!fileUrl) return res.status(400).json({ error: "No file uploaded" });
        const { prisma } = await import("../utils/prisma.js");
        await prisma.user.update({ where: { id: req.user.id }, data: { avatar: fileUrl } });
        res.status(200).json({ avatar: fileUrl });
    } catch (e) {
        res.status(500).json({ error: "Avatar upload failed" });
    }
});

// Following
router.post("/follow/:instructorId", toggleFollowInstructor);

// Support tickets
router.post("/support/ticket", submitSupportTicket);
router.get("/support/tickets", getSupportTickets);

// Profile
router.get("/profile", getStudentProfile);
router.patch("/profile", updateStudentProfile);

router.get("/recommendations", getStudentRecommendations);
router.get("/home/messages", getStudentHomeMessages);

// Certificates
router.post("/certificates/claim/:courseId", claimCertificate);
router.get("/certificates", async (req: any, res: any) => {
  try {
    const { prisma } = await import("../utils/prisma.js");
    const certs = await prisma.certificate.findMany({
      where: { studentId: req.user.id },
      include: { course: { select: { title: true, thumbnailUrl: true } } }
    });
    res.status(200).json(certs);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

export default router;
