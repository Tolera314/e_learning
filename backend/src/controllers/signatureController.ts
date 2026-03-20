import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * UPLOAD/UPDATE SIGNATURE
 */
export const updateSignature = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { signatureUrl } = req.body;

    if (!signatureUrl) {
      return res.status(400).json({ error: 'Signature URL is required' });
    }

    // Role validation: Only Admin (for CEO) and Instructor can have signatures
    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return res.status(403).json({ error: 'Unauthorized to have a signature' });
    }

    const signatureRole = role === 'ADMIN' ? 'CEO' : 'INSTRUCTOR';

    const signature = await prisma.signature.upsert({
      where: { userId },
      update: { signatureUrl, role: signatureRole },
      create: { userId, signatureUrl, role: signatureRole }
    });

    res.status(200).json(signature);
  } catch (error) {
    console.error('Update signature error:', error);
    res.status(500).json({ error: 'Failed to update signature' });
  }
};

/**
 * GET SIGNATURES FOR CERTIFICATE (CEO + Instructor)
 */
export const getCertificateSignatures = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId as string;

    // 1. Fetch CEO signature (assuming there's one admin designated as CEO or just any admin signature)
    // For this context, we'll fetch the first signature marked as 'CEO'
    const ceoSignature = await prisma.signature.findFirst({
      where: { role: 'CEO' },
      include: { user: { select: { name: true } } }
    });

    // 2. Fetch the Course Instructor's signature
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const instructorSignature = await prisma.signature.findUnique({
      where: { userId: course.instructorId },
      include: { user: { select: { name: true } } }
    });

    res.status(200).json({
      ceo: ceoSignature,
      instructor: instructorSignature
    });
  } catch (error) {
    console.error('Get certificate signatures error:', error);
    res.status(500).json({ error: 'Failed to fetch signatures' });
  }
};

/**
 * GET OWN SIGNATURE
 */
export const getMySignature = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const signature = await prisma.signature.findUnique({
      where: { userId }
    });
    res.status(200).json(signature);
  } catch (error) {
    console.error('Get own signature error:', error);
    res.status(500).json({ error: 'Failed to fetch signature' });
  }
};

/**
 * GET CEO SIGNATURE
 */
export const getCEOSignature = async (req: Request, res: Response) => {
  try {
    const ceoSignature = await prisma.signature.findFirst({
      where: { role: 'CEO' }
    });
    res.status(200).json(ceoSignature);
  } catch (error) {
    console.error('Get CEO signature error:', error);
    res.status(500).json({ error: 'Failed to fetch CEO signature' });
  }
};
