import express from 'express';
import { generateCertificate, verifyCertificate, getMyCertificates } from '../controllers/certificateController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/verify/:code', verifyCertificate);

// Protected routes
router.use(protect);
router.get('/my', getMyCertificates);
router.post('/generate', generateCertificate);

export default router;
