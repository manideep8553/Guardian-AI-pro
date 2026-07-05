import { Server, Socket } from 'socket.io';
import { logger } from '../../config/logger';

export function registerNotificationGateway(io: Server, socket: Socket): void {
  socket.on('notification:subscribe', () => {
    const userId = socket.data.user?.userId;
    if (userId) {
      socket.join(`notification:user:${userId}`);
      logger.debug(`Socket ${socket.id} subscribed to notifications for user ${userId}`);
    }
  });

  socket.on('notification:markread', (data: { notificationId: string }) => {
    const userId = socket.data.user?.userId;
    if (userId) {
      io.to(`notification:user:${userId}`).emit('notification:read', data);
    }
  });
}

export function emitNotification(io: Server, userId: string, notification: Record<string, unknown>): void {
  io.to(`notification:user:${userId}`).emit('notification:new', notification);
}

export function emitNotificationCount(io: Server, userId: string, count: number): void {
  io.to(`notification:user:${userId}`).emit('notification:count', { count });
}
