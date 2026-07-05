import { Server, Socket } from 'socket.io';
import { logger } from '../../config/logger';

export function registerAlertGateway(io: Server, socket: Socket): void {
  socket.on('alert:subscribe', (zoneId?: string) => {
    const room = zoneId ? `alert:zone:${zoneId}` : 'alert:all';
    socket.join(room);
    logger.debug(`Socket ${socket.id} subscribed to ${room}`);
  });

  socket.on('alert:unsubscribe', (zoneId?: string) => {
    const room = zoneId ? `alert:zone:${zoneId}` : 'alert:all';
    socket.leave(room);
    logger.debug(`Socket ${socket.id} unsubscribed from ${room}`);
  });

  socket.on('alert:acknowledge', (data: { alertId: string }) => {
    io.to(`alert:all`).emit('alert:acknowledged', data);
    logger.info(`Alert ${data.alertId} acknowledged via socket`);
  });
}

export function emitAlert(io: Server, alert: Record<string, unknown>): void {
  io.to('alert:all').emit('alert:new', alert);
  if (alert.zoneId) {
    io.to(`alert:zone:${alert.zoneId}`).emit('alert:new', alert);
  }
}

export function emitAlertResolved(io: Server, alertId: string): void {
  io.to('alert:all').emit('alert:resolved', { alertId });
}
