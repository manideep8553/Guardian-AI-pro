import { Server, Socket } from 'socket.io';
import { logger } from '../../config/logger';

export function registerSensorGateway(io: Server, socket: Socket): void {
  socket.on('sensor:subscribe', (sensorId: string) => {
    const room = `sensor:${sensorId}`;
    socket.join(room);
    logger.debug(`Socket ${socket.id} subscribed to sensor ${sensorId}`);
  });

  socket.on('sensor:unsubscribe', (sensorId: string) => {
    const room = `sensor:${sensorId}`;
    socket.leave(room);
  });

  socket.on('sensor:subscribeZone', (zoneId: string) => {
    socket.join(`sensor:zone:${zoneId}`);
    logger.debug(`Socket ${socket.id} subscribed to sensor zone ${zoneId}`);
  });

  socket.on('sensor:unsubscribeZone', (zoneId: string) => {
    socket.leave(`sensor:zone:${zoneId}`);
  });
}

export function emitSensorReading(
  io: Server,
  data: { sensorId: string; value: number; unit: string; timestamp: Date; zoneId?: string },
): void {
  io.to(`sensor:${data.sensorId}`).emit('sensor:reading', data);
  if (data.zoneId) {
    io.to(`sensor:zone:${data.zoneId}`).emit('sensor:reading', data);
  }
  io.to('sensor:all').emit('sensor:reading', data);
}

export function emitSensorAlert(
  io: Server,
  data: { sensorId: string; message: string; severity: string; zoneId?: string },
): void {
  io.to(`sensor:${data.sensorId}`).emit('sensor:alert', data);
  if (data.zoneId) {
    io.to(`sensor:zone:${data.zoneId}`).emit('sensor:alert', data);
  }
}
