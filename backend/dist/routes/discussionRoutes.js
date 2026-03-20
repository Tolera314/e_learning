"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const discussionController_1 = require("../controllers/discussionController");
const router = express_1.default.Router();
// Rate limiter for posting threads/replies
const postLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 15, // Limit each user to 15 forum actions per 5 mins
    message: { error: 'Too many posts created from this IP, please try again after 5 minutes.' },
});
// Protect all routes
router.use(authMiddleware_1.protect);
// Shared Routes (Student & Instructor)
router.get('/courses/:courseId/discussions', discussionController_1.getCourseDiscussions);
router.post('/courses/:courseId/discussions', postLimiter, discussionController_1.createThread);
router.get('/discussions/:threadId', discussionController_1.getThreadDetails);
router.post('/discussions/:threadId/replies', postLimiter, discussionController_1.addReply);
router.post('/discussions/:threadId/react', discussionController_1.toggleReaction);
// Instructor / Admin Only Moderation Routes
router.patch('/instructor/discussions/:threadId/moderate', (0, authMiddleware_1.authorize)('INSTRUCTOR', 'ADMIN'), discussionController_1.moderateThread);
router.delete('/instructor/replies/:replyId', (0, authMiddleware_1.authorize)('INSTRUCTOR', 'ADMIN'), discussionController_1.deleteReply);
exports.default = router;
