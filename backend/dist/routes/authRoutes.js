"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/verify-otp', authController_1.verifyOTP);
router.post('/resend-otp', authController_1.resendOTP);
router.post('/complete-onboarding', authMiddleware_1.protect, authController_1.completeOnboarding);
router.post('/refresh', authController_1.refreshToken);
router.post('/logout', authController_1.logout);
router.post('/forgot-password', authController_1.forgotPassword);
router.post('/reset-password', authController_1.resetPassword);
exports.default = router;
