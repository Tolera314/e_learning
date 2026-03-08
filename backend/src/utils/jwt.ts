import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'super-secret-development-key-please-change-in-prod';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access tokens

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-super-secret-please-change-in-prod';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export const generateToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, SECRET, { expiresIn: EXPIRES_IN as any });
};

export const generateRefreshToken = () => {
  // Cryptographically random opaque token — stored as hashed in DB
  return crypto.randomBytes(64).toString('hex');
};

export const hashRefreshToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
