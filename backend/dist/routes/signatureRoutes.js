"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const signatureController_1 = require("../controllers/signatureController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/ceo', signatureController_1.getCEOSignature); // Public/Shared access
router.use(authMiddleware_1.protect);
router.get('/me', signatureController_1.getMySignature);
router.post('/upload', signatureController_1.updateSignature);
router.get('/course/:courseId', signatureController_1.getCertificateSignatures);
exports.default = router;
