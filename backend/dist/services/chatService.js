"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const pg_1 = require("pg");
const prisma_1 = require("../utils/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * PostgreSQL LISTEN/NOTIFY based real-time chat service.
 * Free alternative to Redis pub/sub.
 *
 * Architecture:
 *   1. Chat message is written to `live_session_chat_logs` table.
 *   2. A DB trigger (or manual NOTIFY in this service) fires on INSERT.
 *   3. A dedicated pg.Client listens on a channel per session.
 *   4. Node.js receives the notification and emits to connected WebSocket clients.
 *
 * Latency: ~5–20ms (acceptable for LMS chat, vs ~1ms for Redis).
 */
const CHANNEL_PREFIX = 'chat_session_';
class ChatService {
    connectionString;
    notifyClient = null;
    io = null;
    subscribedChannels = new Set();
    constructor(connectionString) {
        this.connectionString = connectionString;
    }
    async connect() {
        if (!this.connectionString) {
            throw new Error('PostgreSQL connection string is missing for ChatService');
        }
        // Sanitize connection string: pg.Client sometimes struggles with Prisma query params
        const sanitizedUrl = this.connectionString.split('?')[0];
        this.notifyClient = new pg_1.Client({ connectionString: sanitizedUrl });
        // CRITICAL: Unhandled error events will crash the entire Node.js process.
        this.notifyClient.on('error', (err) => {
            logger_1.default.error({ err }, 'PostgreSQL Chat Service connection error');
        });
        try {
            await this.notifyClient.connect();
            logger_1.default.info({ host: sanitizedUrl.split('@')[1]?.split('/')[0] }, 'PostgreSQL LISTEN/NOTIFY chat service connected');
        }
        catch (err) {
            logger_1.default.error({ err: err.message }, 'Failed to connect to PostgreSQL Chat Service');
            this.notifyClient = null;
            throw err; // Re-throw so index.ts .catch() handles it
        }
        // Handle incoming NOTIFY events from PostgreSQL
        this.notifyClient.on('notification', (msg) => {
            if (!msg.payload)
                return;
            try {
                const payload = JSON.parse(msg.payload);
                const channel = msg.channel;
                const sessionId = channel.replace(CHANNEL_PREFIX, '');
                // Emit to all WebSocket clients in this session room
                this.io?.to(`session:${sessionId}`).emit('chat:message', payload);
            }
            catch (err) {
                logger_1.default.error({ err }, 'Failed to parse NOTIFY payload');
            }
        });
    }
    setSocketServer(io) {
        this.io = io;
    }
    async subscribeToSession(sessionId) {
        if (!this.notifyClient)
            return;
        const channel = `${CHANNEL_PREFIX}${sessionId}`;
        if (this.subscribedChannels.has(channel))
            return;
        await this.notifyClient.query(`LISTEN "${channel}"`);
        this.subscribedChannels.add(channel);
        logger_1.default.debug({ sessionId }, 'Subscribed to session chat channel');
    }
    async unsubscribeFromSession(sessionId) {
        if (!this.notifyClient)
            return;
        const channel = `${CHANNEL_PREFIX}${sessionId}`;
        if (!this.subscribedChannels.has(channel))
            return;
        await this.notifyClient.query(`UNLISTEN "${channel}"`);
        this.subscribedChannels.delete(channel);
    }
    /**
     * Send a chat message:
     * 1. Persist to PostgreSQL
     * 2. NOTIFY the channel so all Node.js instances receive it
     */
    async sendMessage(liveSessionId, senderId, message) {
        const chatLog = await prisma_1.prisma.liveSessionChatLog.create({
            data: { liveSessionId, senderId, message },
            include: { sender: { select: { name: true } } }
        });
        const payload = {
            id: chatLog.id,
            liveSessionId,
            senderId,
            senderName: chatLog.sender.name,
            message,
            createdAt: chatLog.createdAt.toISOString(),
        };
        const channel = `${CHANNEL_PREFIX}${liveSessionId}`;
        if (this.notifyClient) {
            await this.notifyClient.query(`SELECT pg_notify($1, $2)`, [channel, JSON.stringify(payload)]);
        }
        return chatLog;
    }
    /**
     * Get paginated chat history for a session
     */
    async getHistory(liveSessionId, limit = 100) {
        return prisma_1.prisma.liveSessionChatLog.findMany({
            where: { liveSessionId },
            include: { sender: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
    }
    async disconnect() {
        if (this.notifyClient) {
            await this.notifyClient.end();
            this.notifyClient = null;
        }
    }
}
exports.ChatService = ChatService;
// Singleton instance
exports.chatService = new ChatService(process.env.DATABASE_URL || '');
