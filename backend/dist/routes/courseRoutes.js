"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const subscriptionMiddleware_1 = require("../middlewares/subscriptionMiddleware");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const router = express_1.default.Router();
// Cloudinary storage for course thumbnails
const thumbnailStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => ({
        folder: "eda/courses",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 1280, height: 720, crop: "fill" }],
        public_id: `course_${Date.now()}`,
    }),
});
const upload = (0, multer_1.default)({
    storage: thumbnailStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
// Public routes
router.get('/', courseController_1.getCourses);
router.get('/:id', courseController_1.getCourse);
// Protected routes (Instructor only)
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), upload.single('thumbnail'), courseController_1.createCourse);
router.patch('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), upload.single('thumbnail'), courseController_1.updateCourse);
router.get('/instructor', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), courseController_1.getInstructorCourses);
// Student content access (Subscription Protected)
router.get('/:courseId/lessons', authMiddleware_1.protect, subscriptionMiddleware_1.checkSubscription, (req, res) => { });
exports.default = router;
