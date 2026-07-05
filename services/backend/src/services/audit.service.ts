import { AuditLog } from '../models/AuditLog';
import { AuditAction } from '../types';
import { logger } from '../config/logger';

interface AuditEntry {
  user: string;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  description: string;
  details?: Record<string, unknown>;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  success: boolean;
  errorMessage?: string;
}

export async function recordAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await AuditLog.create(entry);
  } catch (error) {
    logger.error('Failed to record audit log', { error, entry });
  }
}

export async function getAuditLogs(
  filter: Record<string, unknown> = {},
  pagination: { page?: number; limit?: number } = {},
): Promise<{
  data: unknown[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}> {
  const page = Math.max(1, pagination.page || 1);
  const limit = Math.min(100, Math.max(1, pagination.limit || 20));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email')
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getAuditStats(days: number = 30): Promise<{
  totalLogs: number;
  actions: Record<string, number>;
  resources: Record<string, number>;
  successRate: number;
  topUsers: { _id: string; count: number }[];
  hourlyDistribution: { _id: number; count: number }[];
}> {
  const since = new Date(Date.now() - days * 86400000);
  const [totalLogs, actionAgg, resourceAgg, successAgg, topUsers, hourlyAgg] = await Promise.all([
    AuditLog.countDocuments({ createdAt: { $gte: since } }),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: 1 }, success: { $sum: { $cond: ['$success', 1, 0] } } } },
    ]),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const successRate = successAgg[0]
    ? Math.round((successAgg[0].success / successAgg[0].total) * 100)
    : 100;

  return {
    totalLogs,
    actions: Object.fromEntries(actionAgg.map((a: { _id: string; count: number }) => [a._id, a.count])),
    resources: Object.fromEntries(resourceAgg.map((r: { _id: string; count: number }) => [r._id, r.count])),
    successRate,
    topUsers,
    hourlyDistribution: hourlyAgg,
  };
}

export async function cleanupAuditLogs(retentionDays: number = 90): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 86400000);
  const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
  logger.info(`Cleaned up ${result.deletedCount} audit logs older than ${retentionDays} days`);
  return result.deletedCount;
}
