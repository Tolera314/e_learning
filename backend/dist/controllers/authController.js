"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = exports.completeOnboarding = exports.resendOTP = exports.verifyOTP = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const jwt_1 = require("../utils/jwt");
const mail_1 = require("../utils/mail");
// Validation Schemas
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email().optional(),
    phoneNumber: zod_1.z.string().min(9),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['STUDENT', 'INSTRUCTOR']).nullable().optional(),
});
const loginSchema = zod_1.z.object({
    identifier: zod_1.z.string(), // email or phone
    password: zod_1.z.string(),
});
const register = async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        // Check if user exists
        const existingUser = await prisma_1.prisma.user.findFirst({
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
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(data.password, salt);
        // Generate 6-digit OTP using cryptographically secure random
        const { randomInt } = await import('crypto');
        const otp = randomInt(100000, 1000000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const user = await prisma_1.prisma.user.create({
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
            const mailResult = await (0, mail_1.sendOTPEmail)(data.email, otp, data.name);
            if (mailResult.success) {
                console.log(`[DEBUG] OTP email sent successfully to ${data.email}`);
            }
            else {
                console.warn(`[DEBUG] Failed to send OTP email to ${data.email}. Check Resend API key.`);
            }
        }
        // Audit log — OTP is intentionally NOT logged in production
        console.log(`[AUTH] New registration: ${data.name} | ${data.phoneNumber} | ${expires.toISOString()}`);
        res.status(201).json({
            message: 'User registered successfully. Please verify OTP.',
            userId: user.id
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ errors: error.errors });
        }
        else {
            console.error('Registration Error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    }
};
exports.register = register;
const verifyOtpSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    otp: zod_1.z.string().length(6),
});
const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = verifyOtpSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({
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
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
                verificationCode: null,
                verificationExpires: null
            }
        });
        const token = (0, jwt_1.generateToken)(user.id, user.role);
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ errors: error.errors });
        }
        else {
            res.status(500).json({ message: 'Verification error' });
        }
    }
};
exports.verifyOTP = verifyOTP;
const resendOtpSchema = zod_1.z.object({
    userId: zod_1.z.string(),
});
const resendOTP = async (req, res) => {
    try {
        const { userId } = resendOtpSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { randomInt } = await import('crypto');
        const otp = randomInt(100000, 1000000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                verificationCode: otp,
                verificationExpires: expires
            }
        });
        if (user.email) {
            await (0, mail_1.sendOTPEmail)(user.email, otp, user.name);
        }
        console.log(`[AUTH] OTP resent for user: ${user.id}`);
        res.json({ message: 'OTP resent successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error resending OTP' });
    }
};
exports.resendOTP = resendOTP;
const completeOnboarding = async (req, res) => {
    try {
        const { userId, ...data } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { studentProfile: true, instructorProfile: true }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.role === 'STUDENT') {
            await prisma_1.prisma.studentProfile.upsert({
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
        }
        else if (user.role === 'INSTRUCTOR') {
            await prisma_1.prisma.instructorProfile.upsert({
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
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { onboardingCompleted: true }
        });
        // AUTO-PROVISION 3-DAY FREE TRIAL FOR STUDENTS
        if (user.role === 'STUDENT' && !user.trialUsed) {
            const trialExpiry = new Date();
            trialExpiry.setDate(trialExpiry.getDate() + 3);
            await prisma_1.prisma.subscription.create({
                data: {
                    studentId: userId,
                    segmentAccess: data.educationLevel || 'UNIVERSITY', // Default or chosen segment
                    startsAt: new Date(),
                    expiresAt: trialExpiry,
                    isTrial: true,
                    planType: 'MONTHLY'
                }
            });
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { trialUsed: true }
            });
            console.log(`[SUBSCRIPTION] 3-Day Trial provisioned for user ${userId}`);
        }
        res.json({ message: 'Onboarding completed successfully' });
    }
    catch (error) {
        console.error('Onboarding Error:', error);
        res.status(500).json({ message: 'Server error during onboarding' });
    }
};
exports.completeOnboarding = completeOnboarding;
const login = async (req, res) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findFirst({
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
        const isMatch = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = (0, jwt_1.generateToken)(user.id, user.role);
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ errors: error.errors });
        }
        else {
            res.status(500).json({ message: 'Server error during login' });
        }
    }
};
exports.login = login;
// ─────────────────────────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────────────────────────
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: rawToken } = req.body;
        if (!rawToken) {
            res.status(400).json({ message: 'Refresh token required' });
            return;
        }
        const hashed = (0, jwt_1.hashRefreshToken)(rawToken);
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                refreshToken: hashed,
                refreshTokenExpires: { gt: new Date() }
            }
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }
        // Rotate the refresh token
        const newRaw = (0, jwt_1.generateRefreshToken)();
        const newHashed = (0, jwt_1.hashRefreshToken)(newRaw);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: newHashed,
                refreshTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
        res.json({
            token: (0, jwt_1.generateToken)(user.id, user.role),
            refreshToken: newRaw,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error refreshing token' });
    }
};
exports.refreshToken = refreshToken;
// ─────────────────────────────────────────────────────────────────
// Logout (invalidate refresh token)
// ─────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
    try {
        const { refreshToken: rawToken } = req.body;
        if (rawToken) {
            const hashed = (0, jwt_1.hashRefreshToken)(rawToken);
            await prisma_1.prisma.user.updateMany({
                where: { refreshToken: hashed },
                data: { refreshToken: null, refreshTokenExpires: null }
            });
        }
        res.json({ message: 'Logged out successfully' });
    }
    catch {
        res.status(500).json({ message: 'Logout error' });
    }
};
exports.logout = logout;
