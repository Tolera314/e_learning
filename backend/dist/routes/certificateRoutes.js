"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const certificateController_1 = require("../controllers/certificateController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Public routes
router.get('/verify/:code', certificateController_1.verifyCertificate);
// Protected routes
router.use(authMiddleware_1.protect);
router.get('/my', certificateController_1.getMyCertificates);
router.post('/generate', certificateController_1.generateCertificate);
exports.default = router;
