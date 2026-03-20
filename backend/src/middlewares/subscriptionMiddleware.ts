import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from './authMiddleware';

/**
 * Middleware to enforce active subscriptions and trials
 * Students are allowed access if:
 * 1. They are within their 3-day free trial period
 * 2. They have an active, non-expired subscription for the requested content
 */
export const checkSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Instructors and Admins have full bypass
    if (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') {
      return next();
    }

    const userId = user.id;

    // Check for any active subscription (Trial or Paid)
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        studentId: userId,
        expiresAt: {
          gt: new Date(), // Has not expired
        },
      },
    });

    if (!activeSubscription) {
      return res.status(403).json({ 
        error: 'Subscription Required', 
        message: 'Your free trial has expired or you do not have an active subscription.',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    // Attach subscription info to request for downstream use (e.g. segment mapping)
    (req as any).subscription = activeSubscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Internal server error during subscription check' });
  }
};
