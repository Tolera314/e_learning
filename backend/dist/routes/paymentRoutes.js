"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Webhook endpoint (Must be public, signature verified in controller)
// Use express.raw() to get the raw body needed for signature verification
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), paymentController_1.handleWebhook);
// Protected checkout sessions
router.post('/checkout', authMiddleware_1.protect, paymentController_1.createCheckoutSession);
exports.default = router;
