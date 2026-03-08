import express from 'express';
import { register, login, verifyOTP, resendOTP, completeOnboarding, refreshToken, logout } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/complete-onboarding', completeOnboarding);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
