import { createServer } from 'http';
import app from './app';
import { config } from './config';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initializeSocket } from './sockets/incidentSocket';

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    await connectRedis();

    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(config.port, () => {
      logger.info(`GuardianAI Pro API running on port ${config.port}`);
      logger.info(`API Docs available at http://localhost:${config.port}/api-docs`);
      logger.info(`Environment: ${config.env}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection', { error: reason.message, stack: reason.stack });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

startServer();
