import { Router } from "express";
import {
    getStudentAssignments,
    submitAssignment,
    getSubmissionStatus,
    toggleFollowInstructor,
    recordLessonProgress,
    getStudentDashSummary,
    getStudentActivity
} from "../controllers/studentController";
import { protect, authorize } from "../middlewares/authMiddleware";
import multer from "multer";
import path from "path";

const router = Router();

// Configure Multer for secure file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/submissions/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|docx|zip/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error("Only .pdf, .docx, and .zip files are allowed!"));
    }
});

router.use(protect as any);
router.use(authorize('STUDENT') as any);

router.get("/dashboard/summary", getStudentDashSummary);
router.get("/dashboard/activity", getStudentActivity);
router.get("/courses/:courseId/assignments", getStudentAssignments);
router.post("/assignments/:assignmentId/submit", upload.single('submission'), submitAssignment);
router.get("/submissions/:submissionId", getSubmissionStatus);
router.post("/follow/:instructorId", toggleFollowInstructor);
router.post("/lessons/:lessonId/progress", recordLessonProgress);

export default router;
