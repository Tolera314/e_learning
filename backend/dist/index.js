"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const socket_1 = require("./socket");
const chatService_1 = require("./services/chatService");
const activityService_1 = require("./services/activityService");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
const port = process.env.PORT || 8000;
// Trust proxy (required for correct IP resolution behind Nginx/load balancer)
app.set("trust proxy", 1);
// Security Middleware
app.use((0, helmet_1.default)());
// Compression — reduces payload size by 60-80%
app.use((0, compression_1.default)());
// CORS config tuned for the Next.js frontend
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));
// Payload parsing
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
// Auth Rate Limiting — prevent brute-force attacks (20 requests per 15 min)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many requests from this IP. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});
// API rate limiting for general endpoints
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 300,
    message: { error: "Too many requests. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const enrollmentRoutes_1 = __importDefault(require("./routes/enrollmentRoutes"));
const instructorRoutes_1 = __importDefault(require("./routes/instructorRoutes"));
// Routes — auth routes have stricter rate limits
app.use("/api/auth", authLimiter, authRoutes_1.default);
app.use("/api/dashboard", apiLimiter, dashboardRoutes_1.default);
app.use("/api/courses", apiLimiter, courseRoutes_1.default);
app.use("/api/enrollments", apiLimiter, enrollmentRoutes_1.default);
app.use("/api/instructor", apiLimiter, instructorRoutes_1.default);
// Basic Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
// Generic Error Handler
app.use((err, req, res, next) => {
    logger_1.default.error({ err: err.message, stack: err.stack }, 'Unhandled error');
    res.status(500).json({ error: "Internal Server Error" });
});
// Initialise WebSocket server (shares HTTP port with REST API)
(0, socket_1.initSocketServer)(httpServer);
// Start activity log batch flusher
(0, activityService_1.startActivityFlusher)();
// Connect PostgreSQL chat listener 
chatService_1.chatService.connect().catch(err => logger_1.default.warn({ err: err.message }, 'Chat service unavailable — real-time chat disabled'));
httpServer.listen(port, () => {
    logger_1.default.info({ port }, '🚀 Ethio-Digital-Academy API + WebSocket server started');
});
// Global Error Catchers for Scaling Issues
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error({ reason, promise }, 'UNHANDLED REJECTION — system crashing');
    // In production, you might not want to exit(1) immediately, but here we need to see it.
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    logger_1.default.error({ err: err.message, stack: err.stack }, 'UNCAUGHT EXCEPTION — system crashing');
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.default.info('SIGTERM received — graceful shutdown');
    await (0, activityService_1.stopActivityFlusher)();
    await chatService_1.chatService.disconnect();
    httpServer.close(() => process.exit(0));
});
