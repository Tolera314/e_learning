"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Public routes
router.get('/', courseController_1.getCourses);
// Protected routes (Instructor only)
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), courseController_1.createCourse);
router.get('/instructor', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), courseController_1.getInstructorCourses);
exports.default = router;
