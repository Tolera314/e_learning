"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
exports.getSocketServer = getSocketServer;
const socket_io_1 = require("socket.io");
const chatService_1 = require("./services/chatService");
const jwt_1 = require("./utils/jwt");
const logger_1 = __importDefault(require("./utils/logger"));
let ioInstance = null;
function initSocketServer(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });
    ioInstance = io;
    chatService_1.chatService.setSocketServer(io);
    // Auth middleware for WebSocket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        if (!token)
            return next(new Error('Authentication required'));
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            socket.user = decoded;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        logger_1.default.info({ userId: user.id }, 'WebSocket client connected');
        // Join a live session chat room
        socket.on('session:join', async (sessionId) => {
            socket.join(`session:${sessionId}`);
            // Subscribe PostgreSQL channel if not already listening
            await chatService_1.chatService.subscribeToSession(sessionId).catch(err => logger_1.default.error({ err }, 'Failed to subscribe to session channel'));
            // Send last 100 messages as history
            const history = await chatService_1.chatService.getHistory(sessionId).catch(() => []);
            socket.emit('chat:history', history);
            logger_1.default.debug({ userId: user.id, sessionId }, 'User joined session room');
        });
        // Leave a session room
        socket.on('session:leave', (sessionId) => {
            socket.leave(`session:${sessionId}`);
        });
        // Course room subscriptions for Discussions
        socket.on('course:join', (courseId) => {
            socket.join(`course_${courseId}`);
            logger_1.default.debug({ userId: user.id, courseId }, 'User joined course room');
        });
        socket.on('course:leave', (courseId) => {
            socket.leave(`course_${courseId}`);
        });
        // Global User Private Room
        socket.on('user:join', () => {
            socket.join(`user:${user.id}`);
            logger_1.default.debug({ userId: user.id }, 'User joined private socket room');
        });
        // Send a chat message
        socket.on('chat:send', async (data) => {
            if (!data.sessionId || !data.message?.trim())
                return;
            try {
                await chatService_1.chatService.sendMessage(data.sessionId, user.id, data.message.trim());
            }
            catch (err) {
                logger_1.default.error({ err }, 'Failed to send chat message');
                socket.emit('chat:error', { message: 'Failed to send message' });
            }
        });
        // Instructor live session controls
        socket.on('session:control', (data) => {
            if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')
                return;
            io.to(`session:${data.sessionId}`).emit('session:control', {
                action: data.action,
                instructorId: user.id,
                timestamp: new Date().toISOString(),
            });
        });
        socket.on('disconnect', () => {
            logger_1.default.info({ userId: user.id }, 'WebSocket client disconnected');
        });
    });
    return io;
}
function getSocketServer() {
    return ioInstance;
}
