"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const instructorController_1 = require("../controllers/instructorController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// All instructor routes require authentication and INSTRUCTOR or ADMIN role
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.authorize)('INSTRUCTOR', 'ADMIN'));
// Live Classes
router.get("/live-sessions", instructorController_1.getLiveClassAnalytics);
// Student Progress
router.get("/progress/:courseId", instructorController_1.getStudentProgressReport);
// Quiz Performance
router.get("/quizzes/:quizId/analytics", instructorController_1.getQuizPerformance);
// System Performance
router.post("/performance/log", instructorController_1.logSystemPerformance);
router.get("/performance/metrics", instructorController_1.getSystemMetrics);
exports.default = router;
