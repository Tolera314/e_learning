"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/student', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('STUDENT'), dashboardController_1.getStudentDashboard);
router.get('/instructor', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('INSTRUCTOR'), dashboardController_1.getInstructorDashboard);
router.get('/admin', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('ADMIN'), dashboardController_1.getAdminDashboard);
exports.default = router;
