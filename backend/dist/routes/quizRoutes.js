"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quizController_1 = require("../controllers/quizController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const subscriptionMiddleware_1 = require("../middlewares/subscriptionMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
// Instructor Routes
router.post('/instructor', (0, authMiddleware_1.authorize)('INSTRUCTOR', 'ADMIN'), quizController_1.createQuiz);
router.get('/instructor/:id/submissions', (0, authMiddleware_1.authorize)('INSTRUCTOR', 'ADMIN'), quizController_1.getQuizSubmissions);
// Shared/Student Routes (Subscription Required)
router.get('/:id', subscriptionMiddleware_1.checkSubscription, quizController_1.getQuiz);
router.post('/:id/submit', subscriptionMiddleware_1.checkSubscription, quizController_1.submitQuiz);
exports.default = router;
