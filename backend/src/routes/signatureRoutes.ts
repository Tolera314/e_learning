import express from 'express';
import { updateSignature, getCertificateSignatures, getMySignature, getCEOSignature } from '../controllers/signatureController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/ceo', getCEOSignature); // Public/Shared access

router.use(protect);

router.get('/me', getMySignature);
router.post('/upload', updateSignature);
router.get('/course/:courseId', getCertificateSignatures);

export default router;
