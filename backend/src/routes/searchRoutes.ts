import { Router } from 'express';
import { searchCourses, getTrendingSearches, getRecommendedCourses } from '../controllers/searchController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.get('/', protect, searchCourses); // Optional auth to log user ID if available
router.get('/trending', getTrendingSearches);

// Private routes
router.get('/recommended', protect, getRecommendedCourses);

export default router;
