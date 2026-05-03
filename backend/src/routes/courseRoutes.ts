import express from 'express';
import { createCourse, getCourses, getInstructorCourses, updateCourse, getCourse } from '../controllers/courseController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { checkSubscription } from '../middlewares/subscriptionMiddleware';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary';

const router = express.Router();

// Cloudinary storage for course thumbnails
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => ({
      folder: "eda/courses",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1280, height: 720, crop: "fill" }],
      public_id: `course_${Date.now()}`,
  }),
} as any);

const upload = multer({
  storage: thumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes (Instructor only)
router.post('/', protect, authorize('INSTRUCTOR'), upload.single('thumbnail'), createCourse);
router.patch('/:id', protect, authorize('INSTRUCTOR'), upload.single('thumbnail'), updateCourse);
router.get('/instructor', protect, authorize('INSTRUCTOR'), getInstructorCourses);

// Student content access (Subscription Protected)
router.get('/:courseId/lessons', protect, checkSubscription, (req, res) => { /* lesson fetch logic here or in controller */ });

export default router;
