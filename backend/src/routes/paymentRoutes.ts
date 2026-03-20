import express from 'express';
import { createCheckoutSession, handleWebhook } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Webhook endpoint (Must be public, signature verified in controller)
// Use express.raw() to get the raw body needed for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected checkout sessions
router.post('/checkout', protect, createCheckoutSession);

export default router;
