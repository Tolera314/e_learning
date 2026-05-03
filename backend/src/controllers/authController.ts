import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { generateToken, generateRefreshToken, hashRefreshToken } from '../utils/jwt';
import { sendOTPEmail } from '../utils/mail';
import { emailQueue } from '../queues/emailQueue';
import logger from '../utils/logger';

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(9),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'INSTRUCTOR']).nullable().optional(),
});

const loginSchema = z.object({
  identifier: z.string(), // email or phone
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: data.phoneNumber },
          ...(data.email ? [{ email: data.email }] : [])
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ message: 'User with this phone number or email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Generate 6-digit OTP using cryptographically secure random
    const { randomInt } = await import('crypto');
    const otp = randomInt(100000, 1000000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash: hashedPassword,
        role: data.role || 'STUDENT',
        isVerified: false,
        onboardingCompleted: false,
        verificationCode: otp,
        verificationExpires: expires,
      }
    });

    // Send OTP via Email if provided (Queueing job)
    if (data.email) {
      await emailQueue.add(`otp-${user.id}`, {
        email: data.email,
        otp: otp,
        name: data.name
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      });
    }

    // Structured Audit Log
    logger.info({ 
      userId: user.id, 
      role: user.role, 
      event: 'user_registered' 
    }, 'New user registered');

    res.status(201).json({
      message: 'User registered successfully. Please verify OTP.',
      userId: user.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
};

const verifyOtpSchema = z.object({
  userId: z.string(),
  otp: z.string().length(6),
});

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, otp } = verifyOtpSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: 'User already verified' });
      return;
    }

    if (user.verificationCode !== otp || !user.verificationExpires || user.verificationExpires < new Date()) {
      res.status(401).json({ message: 'Invalid or expired OTP' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null
      }
    });

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Email/Phone verified successfully',
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isVerified: true,
        onboardingCompleted: user.onboardingCompleted
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(500).json({ message: 'Verification error' });
    }
  }
};

const resendOtpSchema = z.object({
  userId: z.string(),
});

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = resendOtpSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { randomInt } = await import('crypto');
    const otp = randomInt(100000, 1000000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode: otp,
        verificationExpires: expires
      }
    });

    if (user.email) {
      await emailQueue.add(`resend-otp-${user.id}`, {
        email: user.email,
        otp: otp,
        name: user.name
      });
    }

    logger.info({ userId: user.id }, 'OTP resent');

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resending OTP' });
  }
};

export const completeOnboarding = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Use authenticated userId, not from body
    const data = req.body;
 
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
 
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { studentProfile: true, instructorProfile: true }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.onboardingCompleted) {
      res.status(400).json({ message: 'Onboarding is already completed. This can only be done once.' });
      return;
    }

    if (user.role === 'STUDENT') {
      await prisma.studentProfile.upsert({
        where: { userId },
        create: {
          userId,
          gender: data.gender,
          dob: data.dob ? new Date(data.dob) : null,
          region: data.region,
          educationLevel: data.educationLevel,
          currentGrade: data.currentGrade,
          universityName: data.universityName,
          fieldOfStudy: data.fieldOfStudy,
          yearOfStudy: data.yearOfStudy ? parseInt(data.yearOfStudy) : null,
          subjectsOfInterest: data.subjectsOfInterest || [],
          parentName: data.parentName,
          parentPhone: data.parentPhone,
        },
        update: {
          gender: data.gender,
          dob: data.dob ? new Date(data.dob) : null,
          region: data.region,
          educationLevel: data.educationLevel,
          currentGrade: data.currentGrade,
          universityName: data.universityName,
          fieldOfStudy: data.fieldOfStudy,
          yearOfStudy: data.yearOfStudy ? parseInt(data.yearOfStudy) : null,
          subjectsOfInterest: data.subjectsOfInterest || [],
          parentName: data.parentName,
          parentPhone: data.parentPhone,
        }
      });
    } else if (user.role === 'INSTRUCTOR') {
      await prisma.instructorProfile.upsert({
        where: { userId },
        create: {
          userId,
          gender: data.gender,
          highestEducation: data.highestEducation,
          teachingExperience: data.teachingExperience ? parseInt(data.teachingExperience) : null,
          bio: data.bio,
          subjects: data.subjects || [],
          languagePreference: data.languagePreference,
        },
        update: {
          gender: data.gender,
          highestEducation: data.highestEducation,
          teachingExperience: data.teachingExperience ? parseInt(data.teachingExperience) : null,
          bio: data.bio,
          subjects: data.subjects || [],
          languagePreference: data.languagePreference,
        }
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true }
    });

    // AUTO-PROVISION 3-DAY FREE TRIAL FOR STUDENTS
    if (user.role === 'STUDENT' && !user.trialUsed) {
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 3);

      await prisma.subscription.create({
        data: {
          studentId: userId,
          segmentAccess: data.educationLevel || 'UNIVERSITY', // Default or chosen segment
          startsAt: new Date(),
          expiresAt: trialExpiry,
          isTrial: true,
          planType: 'MONTHLY' as any
        }
      });

      await prisma.user.update({
        where: { id: userId },
        data: { trialUsed: true }
      });

      logger.info({ userId, event: 'trial_provisioned' }, '3-Day Trial provisioned');
    }

    res.json({ message: 'Onboarding completed successfully' });
  } catch (error) {
    console.error('Onboarding Error:', error);
    res.status(500).json({ message: 'Server error during onboarding' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.identifier },
          { phoneNumber: data.identifier }
        ]
      }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);
    let refreshToken: string | undefined;

    if (data.rememberMe) {
      refreshToken = generateRefreshToken();
      const hashed = hashRefreshToken(refreshToken);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: hashed,
          refreshTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted
      },
      token,
      refreshToken
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(500).json({ message: 'Server error during login' });
    }
  }
};

// ─────────────────────────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: rawToken } = req.body;
    if (!rawToken) { res.status(400).json({ message: 'Refresh token required' }); return; }

    const hashed = hashRefreshToken(rawToken);

    const user = await prisma.user.findFirst({
      where: {
        refreshToken: hashed,
        refreshTokenExpires: { gt: new Date() }
      }
    });

    if (!user) { res.status(401).json({ message: 'Invalid or expired refresh token' }); return; }

    // Rotate the refresh token
    const newRaw = generateRefreshToken();
    const newHashed = hashRefreshToken(newRaw);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newHashed,
        refreshTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      token: generateToken(user.id, user.role),
      refreshToken: newRaw,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error refreshing token' });
  }
};

// ─────────────────────────────────────────────────────────────────
// Forgot Password & Reset Password
// ─────────────────────────────────────────────────────────────────
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't leak whether user exists or not
      res.json({ message: 'If an account with that email exists, we have sent a reset link.' });
      return;
    }

    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashed,
        resetTokenExpires: expires
      }
    });

    await emailQueue.add(`reset-${user.id}`, {
      email: user.email!,
      otp: resetToken, 
      name: user.name,
      isPasswordReset: true
    });

    res.json({ message: 'If an account with that email exists, we have sent a reset link.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: { gt: new Date() }
      }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// ─────────────────────────────────────────────────────────────────
// Logout (invalidate refresh token)
// ─────────────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: rawToken } = req.body;
    if (rawToken) {
      const hashed = hashRefreshToken(rawToken);
      await prisma.user.updateMany({
        where: { refreshToken: hashed },
        data: { refreshToken: null, refreshTokenExpires: null }
      });
    }
    res.json({ message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ message: 'Logout error' });
  }
};
