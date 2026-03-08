"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.hashRefreshToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const SECRET = process.env.JWT_SECRET || 'super-secret-development-key-please-change-in-prod';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access tokens
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-super-secret-please-change-in-prod';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const generateToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ id: userId, role }, SECRET, { expiresIn: EXPIRES_IN });
};
exports.generateToken = generateToken;
const generateRefreshToken = () => {
    // Cryptographically random opaque token — stored as hashed in DB
    return crypto_1.default.randomBytes(64).toString('hex');
};
exports.generateRefreshToken = generateRefreshToken;
const hashRefreshToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashRefreshToken = hashRefreshToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, SECRET);
};
exports.verifyToken = verifyToken;
