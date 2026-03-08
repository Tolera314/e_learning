import dotenv from "dotenv";
dotenv.config();

import express, { Express, Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { initSocketServer } from "./socket";
import { chatService } from "./services/chatService";
import { startActivityFlusher, stopActivityFlusher } from "./services/activityService";
import logger from "./utils/logger";

const app: Express = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 8000;

// Trust proxy (required for correct IP resolution behind Nginx/load balancer)
app.set("trust proxy", 1);

// Security Middleware
app.use(helmet());

// Compression — reduces payload size by 60-80%
app.use(compression());

// CORS config tuned for the Next.js frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

// Payload parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Auth Rate Limiting — prevent brute-force attacks (20 requests per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests from this IP. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiting for general endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import courseRoutes from "./routes/courseRoutes";
import enrollmentRoutes from "./routes/enrollmentRoutes";
import instructorRoutes from "./routes/instructorRoutes";

// Routes — auth routes have stricter rate limits
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/dashboard", apiLimiter, dashboardRoutes);
app.use("/api/courses", apiLimiter, courseRoutes);
app.use("/api/enrollments", apiLimiter, enrollmentRoutes);
app.use("/api/instructor", apiLimiter, instructorRoutes);

// Basic Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Generic Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({ error: "Internal Server Error" });
});

// Initialise WebSocket server (shares HTTP port with REST API)
initSocketServer(httpServer);

// Start activity log batch flusher
startActivityFlusher();

// Connect PostgreSQL chat listener 
chatService.connect().catch(err =>
  logger.warn({ err: err.message }, 'Chat service unavailable — real-time chat disabled')
);

httpServer.listen(port, () => {
  logger.info({ port }, '🚀 Ethio-Digital-Academy API + WebSocket server started');
});

// Global Error Catchers for Scaling Issues
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'UNHANDLED REJECTION — system crashing');
  // In production, you might not want to exit(1) immediately, but here we need to see it.
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error({ err: err.message, stack: err.stack }, 'UNCAUGHT EXCEPTION — system crashing');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — graceful shutdown');
  await stopActivityFlusher();
  await chatService.disconnect();
  httpServer.close(() => process.exit(0));
});
