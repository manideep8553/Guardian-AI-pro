import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../config/logger';
import { authenticateSocket } from '../middleware/auth';
import { registerAlertGateway } from './gateways/alertGateway';
import { registerNotificationGateway } from './gateways/notificationGateway';
import { registerSensorGateway } from './gateways/sensorGateway';

let io: Server | null = null;

export function initializeSocketGateway(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use(authenticateSocket);

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.userId;
    logger.info(`Socket connected: ${socket.id} user:${userId || 'anonymous'}`);

    if (userId) {
      socket.join(`user:${userId}`);
    }

    registerAlertGateway(io as Server, socket);
    registerNotificationGateway(io as Server, socket);
    registerSensorGateway(io as Server, socket);

    socket.on('subscribe:room', (room: string) => {
      socket.join(room);
    });

    socket.on('unsubscribe:room', (room: string) => {
      socket.leave(room);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} reason:${reason}`);
    });
  });

  logger.info('Socket.IO gateway initialized');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitToRoom(room: string, event: string, data: unknown): void {
  io?.to(room).emit(event, data);
}

export function emitToAll(event: string, data: unknown): void {
  io?.emit(event, data);
}
