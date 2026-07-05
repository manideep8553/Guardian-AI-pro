import { Response, NextFunction } from 'express';
import { IAuthRequest, AuditAction } from '../types';
import { recordAuditLog } from '../services/audit.service';

interface AuditLogConfig {
  action: AuditAction;
  resource: string;
  resourceId?: (req: IAuthRequest) => string | undefined;
  description: (req: IAuthRequest) => string;
  details?: (req: IAuthRequest) => Record<string, unknown>;
  getPreviousState?: (req: IAuthRequest) => Promise<Record<string, unknown>>;
  getNewState?: (req: IAuthRequest) => Record<string, unknown>;
}

export function auditLog(config: AuditLogConfig) {
  return async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();

    const originalEnd = res.end.bind(res) as (...args: unknown[]) => ReturnType<Response['end']>;
    let ended = false;

    res.end = function (this: Response, ...args: unknown[]): Response {
      if (ended) return originalEnd(...args);
      ended = true;

      const duration = Date.now() - startTime;
      const success = res.statusCode < 500;

      recordAuditLog({
        user: req.user?.userId || 'anonymous',
        userEmail: req.user?.userId || 'unknown',
        userRole: req.user?.role || 'unknown',
        action: config.action,
        resource: config.resource,
        resourceId: config.resourceId?.(req),
        description: config.description(req),
        details: config.details?.(req),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        requestId: req.headers['x-request-id'] as string,
        duration,
        success,
        ...(res.statusCode >= 400 ? { errorMessage: res.statusMessage } : {}),
      });

      return originalEnd(...args);
    };

    next();
  };
}
