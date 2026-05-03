"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lessonController_1 = require("../controllers/lessonController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const router = express_1.default.Router();
// Video storage config
const videoStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => ({
        folder: "eda/lessons",
        resource_type: "video",
        allowed_formats: ["mp4", "webm", "mov"],
        public_id: `lesson_${Date.now()}`,
    }),
});
const upload = (0, multer_1.default)({
    storage: videoStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
});
// Public / Student access
router.get('/recent', authMiddleware_1.protect, lessonController_1.getRecentLessons);
router.get('/courses/:courseId/curriculum', lessonController_1.getCourseCurriculum);
// Instructor only management (Modules)
router.post('/modules/:courseId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), lessonController_1.createModule);
router.patch('/modules/:moduleId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), lessonController_1.updateModule);
router.delete('/modules/:moduleId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), lessonController_1.deleteModule);
// Instructor only management (Lessons)
router.post('/modules/:moduleId/lessons', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), upload.single('video'), lessonController_1.createLesson);
router.patch('/:lessonId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), upload.single('video'), lessonController_1.updateLesson);
router.delete('/:lessonId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), lessonController_1.deleteLesson);
exports.default = router;
