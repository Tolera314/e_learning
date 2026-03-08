import { Server as HTTPServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { chatService } from './services/chatService';
import { verifyToken } from './utils/jwt';
import logger from './utils/logger';

export function initSocketServer(httpServer: HTTPServer): IOServer {
  const io = new IOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  chatService.setSocketServer(io);

  // Auth middleware for WebSocket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = verifyToken(token) as { id: string; role: string };
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as { id: string; role: string };
    logger.info({ userId: user.id }, 'WebSocket client connected');

    // Join a live session chat room
    socket.on('session:join', async (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      // Subscribe PostgreSQL channel if not already listening
      await chatService.subscribeToSession(sessionId).catch(err =>
        logger.error({ err }, 'Failed to subscribe to session channel')
      );
      // Send last 100 messages as history
      const history = await chatService.getHistory(sessionId).catch(() => []);
      socket.emit('chat:history', history);
      logger.debug({ userId: user.id, sessionId }, 'User joined session room');
    });

    // Leave a session room
    socket.on('session:leave', (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
    });

    // Send a chat message
    socket.on('chat:send', async (data: { sessionId: string; message: string }) => {
      if (!data.sessionId || !data.message?.trim()) return;
      try {
        await chatService.sendMessage(data.sessionId, user.id, data.message.trim());
      } catch (err) {
        logger.error({ err }, 'Failed to send chat message');
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    // Instructor live session controls
    socket.on('session:control', (data: { sessionId: string; action: string }) => {
      if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') return;
      io.to(`session:${data.sessionId}`).emit('session:control', {
        action: data.action,
        instructorId: user.id,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      logger.info({ userId: user.id }, 'WebSocket client disconnected');
    });
  });

  return io;
}
