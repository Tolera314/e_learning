import { Router } from 'express';
import { 
  enrollInCourse, 
  getMyEnrolledCourses, 
  updateProgress 
} from '../controllers/enrollmentController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// All enrollment routes are protected
router.use(protect);

router.post('/', enrollInCourse);
router.get('/my-courses', getMyEnrolledCourses);
router.post('/progress', updateProgress);

export default router;
