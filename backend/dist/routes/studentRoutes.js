"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Configure Multer for secure file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/submissions/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|docx|zip/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error("Only .pdf, .docx, and .zip files are allowed!"));
    }
});
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.authorize)('STUDENT'));
router.get("/dashboard/summary", studentController_1.getStudentDashSummary);
router.get("/dashboard/activity", studentController_1.getStudentActivity);
router.get("/courses/:courseId/assignments", studentController_1.getStudentAssignments);
router.post("/assignments/:assignmentId/submit", upload.single('submission'), studentController_1.submitAssignment);
router.get("/submissions/:submissionId", studentController_1.getSubmissionStatus);
router.post("/follow/:instructorId", studentController_1.toggleFollowInstructor);
router.post("/lessons/:lessonId/progress", studentController_1.recordLessonProgress);
exports.default = router;
