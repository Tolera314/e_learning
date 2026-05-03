import express from 'express';
import { register, login, verifyOTP, resendOTP, completeOnboarding, refreshToken, logout, forgotPassword, resetPassword } from '../controllers/authController';

import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/complete-onboarding', protect as any, completeOnboarding);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
