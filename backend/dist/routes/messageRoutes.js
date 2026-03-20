"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// All message routes require authentication
router.use(authMiddleware_1.protect);
router.get('/conversations', messageController_1.getConversations);
router.get('/conversations/:id', messageController_1.getMessages);
router.post('/', messageController_1.sendMessage);
router.patch('/conversations/:id/read', messageController_1.markConversationRead);
exports.default = router;
