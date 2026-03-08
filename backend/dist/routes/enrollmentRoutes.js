"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enrollmentController_1 = require("../controllers/enrollmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// All enrollment routes are protected
router.use(authMiddleware_1.protect);
router.post('/', enrollmentController_1.enrollInCourse);
router.get('/my-courses', enrollmentController_1.getMyEnrolledCourses);
router.post('/progress', enrollmentController_1.updateProgress);
exports.default = router;
