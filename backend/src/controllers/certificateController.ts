import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * GENERATE CERTIFICATE
 */
export const generateCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });
    const { courseId } = req.body;

    // 1. Verify course completion
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId }
      }
    });

    if (!enrollment || !enrollment.isCompleted) {
      return res.status(400).json({ error: 'Course must be 100% completed to issue a certificate' });
    }

    // 2. Check if certificate already exists
    const existing = await prisma.certificate.findFirst({
      where: { studentId, courseId }
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    // 3. Generate a unique verification code (Short and professional)
    const verificationCode = `EDA-${uuidv4().split('-')[0].toUpperCase()}`;

    // 4. Create certificate record
    // In a real app, pdfUrl would be a link to a S3 bucket or similar after generation
    // Here, we'll store a placeholder and let the frontend handle the dynamic rendering
    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        courseId,
        verificationCode,
        pdfUrl: `/api/certificates/view/${verificationCode}` // placeholder route
      }
    });

    res.status(201).json(certificate);
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

/**
 * PUBLIC VERIFICATION
 */
export const verifyCertificate = async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;

    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        student: { select: { name: true, avatar: true } },
        course: { 
          select: { 
            title: true, 
            instructor: { 
              select: { 
                name: true,
                signature: true 
              } 
            } 
          } 
        }
      }
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found or invalid code' });
    }

    res.status(200).json(certificate);
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
};

/**
 * GET STUDENT CERTIFICATES
 */
export const getMyCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });
    const certificates = await prisma.certificate.findMany({
      where: { studentId },
      include: { 
        student: { select: { name: true } },
        course: { 
          include: { 
            instructor: { 
              select: { 
                name: true,
                signature: true 
              } 
            } 
          } 
        } 
      }
    });
    res.status(200).json(certificates);
  } catch (error) {
    console.error('Get my certificates error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};
