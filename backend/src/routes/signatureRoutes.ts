import express from 'express';
import { updateSignature, getCertificateSignatures, getMySignature, getCEOSignature, getGlobalSignatures } from '../controllers/signatureController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/ceo', getCEOSignature); // Public/Shared access
router.get('/certificate-data', getGlobalSignatures); // Used for fetching CEO data during rendering


router.use(protect);

router.get('/me', getMySignature);
router.post('/upload', updateSignature);
router.get('/course/:courseId', getCertificateSignatures);

export default router;
