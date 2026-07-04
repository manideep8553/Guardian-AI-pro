import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ApiError } from '../utils/ApiError';
import { config } from '../config';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error('Error caught by handler', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(config.env === 'development' && { stack: err.stack }),
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
}
