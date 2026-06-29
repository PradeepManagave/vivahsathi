import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../../config/logger';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class SocketService {
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map();

  initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingInterval: 25000,
      pingTimeout: 20000,
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      try {
        const decoded = jwt.verify(token as string, config.JWT_SECRET) as any;
        (socket as AuthenticatedSocket).userId = decoded.id;
        (socket as AuthenticatedSocket).userRole = decoded.role;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      logger.debug(`Socket connected: ${socket.id} (user: ${userId})`);

      this.addUserSocket(userId, socket.id);
      socket.join(`user:${userId}`);

      socket.on('join:conversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
      });

      socket.on('leave:conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
      });

      socket.on('typing:start', (data: { conversationId: string; userId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('typing:start', { userId: data.userId });
      });

      socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('typing:stop', { userId: data.userId });
      });

      socket.on('disconnect', () => {
        logger.debug(`Socket disconnected: ${socket.id} (user: ${userId})`);
        this.removeUserSocket(userId, socket.id);
      });
    });

    logger.info('Socket.IO initialized');
  }

  private addUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
    this.userSockets.get(userId)!.add(socketId);
  }

  private removeUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) this.userSockets.delete(userId);
    }
  }

  sendToUser(userId: string, event: string, data: any): void {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  sendToConversation(conversationId: string, event: string, data: any): void {
    this.io?.to(`conversation:${conversationId}`).emit(event, data);
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}

export const socketService = new SocketService();
