import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../config/logger';
import { IAuthPayload } from '../types';

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token as string, config.jwt.accessSecret) as IAuthPayload;
      (socket as Socket & { user: IAuthPayload }).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as Socket & { user: IAuthPayload }).user;
    logger.info(`Socket connected: ${user.userId}`);

    socket.join(`user:${user.userId}`);

    if (user.role === 'admin' || user.role === 'supervisor') {
      socket.join('supervisors');
    }
    socket.join('monitor:live');

    socket.on('join:incident', (incidentId: string) => {
      socket.join(`incident:${incidentId}`);
    });

    socket.on('leave:incident', (incidentId: string) => {
      socket.leave(`incident:${incidentId}`);
    });

    socket.on('monitor:subscribe', (rooms: string[]) => {
      rooms.forEach((room) => {
        if (['worker-updates', 'fusion-events', 'emergency-events', 'sensor-stream'].includes(room)) {
          socket.join(`monitor:${room}`);
        }
      });
    });

    socket.on('monitor:unsubscribe', (rooms: string[]) => {
      rooms.forEach((room) => {
        socket.leave(`monitor:${room}`);
      });
    });

    socket.on('sensor:ingest', (data: unknown) => {
      if (user.role === 'admin' || user.role === 'supervisor') {
        io.to('monitor:sensor-stream').emit('sensor:reading', {
          ...(data as object),
          receivedAt: new Date(),
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${user.userId}`);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function emitIncidentUpdate(incidentId: string, event: string, data: unknown): void {
  io.to(`incident:${incidentId}`).emit(event, data);
  io.to('supervisors').emit(event, data);
}

export function emitWorkerStatusUpdate(data: unknown): void {
  io.to('monitor:worker-updates').emit('worker:status-update', data);
  io.to('supervisors').emit('worker:status-update', data);
}

export function emitFusionUpdate(data: unknown): void {
  io.to('monitor:fusion-events').emit('fusion:update', data);
  io.to('supervisors').emit('fusion:update', data);
}

export function emitSensorReading(data: unknown): void {
  io.to('monitor:sensor-stream').emit('sensor:reading', data);
}

export function emitEmergencyEvent(data: unknown): void {
  io.to('monitor:emergency-events').emit('emergency:new', data);
  io.to('supervisors').emit('emergency:new', data);
  io.emit('emergency:alert', data);
}
