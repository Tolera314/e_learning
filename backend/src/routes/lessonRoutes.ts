import express from 'express';
import { 
  getCourseCurriculum, 
  createLesson, 
  updateLesson, 
  deleteLesson,
  createModule,
  updateModule,
  deleteModule,
  getRecentLessons
} from '../controllers/lessonController';
import { protect, authorize } from '../middlewares/authMiddleware';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary';

const router = express.Router();

// Video storage config
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => ({
      folder: "eda/lessons",
      resource_type: "video",
      allowed_formats: ["mp4", "webm", "mov"],
      public_id: `lesson_${Date.now()}`,
  }),
} as any);

const upload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
});

// Public / Student access
router.get('/recent', protect, getRecentLessons);
router.get('/courses/:courseId/curriculum', getCourseCurriculum);

// Instructor only management (Modules)
router.post('/modules/:courseId', protect, authorize('INSTRUCTOR'), createModule);
router.patch('/modules/:moduleId', protect, authorize('INSTRUCTOR'), updateModule);
router.delete('/modules/:moduleId', protect, authorize('INSTRUCTOR'), deleteModule);

// Instructor only management (Lessons)
router.post('/modules/:moduleId/lessons', protect, authorize('INSTRUCTOR'), upload.single('video'), createLesson);
router.patch('/:lessonId', protect, authorize('INSTRUCTOR'), upload.single('video'), updateLesson);
router.delete('/:lessonId', protect, authorize('INSTRUCTOR'), deleteLesson);

export default router;
