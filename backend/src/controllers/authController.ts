import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { generateToken, generateRefreshToken, hashRefreshToken } from '../utils/jwt';
import { sendOTPEmail } from '../utils/mail';

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

    // Send OTP via Email if provided
    if (data.email) {
      console.log(`[DEBUG] Attempting to send OTP email to: ${data.email}`);
      const mailResult = await sendOTPEmail(data.email, otp, data.name);
      if (mailResult.success) {
        console.log(`[DEBUG] OTP email sent successfully to ${data.email}`);
      } else {
        console.warn(`[DEBUG] Failed to send OTP email to ${data.email}. Check Resend API key.`);
      }
    }

    // Audit log — OTP is intentionally NOT logged in production
    console.log(`[AUTH] New registration: ${data.name} | ${data.phoneNumber} | ${expires.toISOString()}`);

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
        isVerified: true
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
      await sendOTPEmail(user.email, otp, user.name);
    }

    console.log(`[AUTH] OTP resent for user: ${user.id}`);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resending OTP' });
  }
};

export const completeOnboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, ...data } = req.body;
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { studentProfile: true, instructorProfile: true }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
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

      console.log(`[SUBSCRIPTION] 3-Day Trial provisioned for user ${userId}`);
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

    res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted
      },
      token
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
