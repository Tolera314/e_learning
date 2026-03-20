"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', authMiddleware_1.protect, searchController_1.searchCourses); // Optional auth to log user ID if available
router.get('/trending', searchController_1.getTrendingSearches);
// Private routes
router.get('/recommended', authMiddleware_1.protect, searchController_1.getRecommendedCourses);
exports.default = router;
