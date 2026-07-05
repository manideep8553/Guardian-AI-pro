import { getRedis } from '../config/redis';
import { logger } from '../config/logger';

const DEFAULT_TTL = 300;
const SHORT_TTL = 60;
const MEDIUM_TTL = 900;
const LONG_TTL = 3600;

export const CacheTTL = {
  SHORT: SHORT_TTL,
  DEFAULT: DEFAULT_TTL,
  MEDIUM: MEDIUM_TTL,
  LONG: LONG_TTL,
  FIFTEEN_MIN: 900,
  ONE_HOUR: 3600,
  SIX_HOURS: 21600,
  ONE_DAY: 86400,
} as const;

function buildKey(prefix: string, identifier: string): string {
  return `guardianai:${prefix}:${identifier}`;
}

export async function getCached<T>(prefix: string, identifier: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const key = buildKey(prefix, identifier);
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    logger.warn('Cache get failed', { prefix, identifier, error });
    return null;
  }
}

export async function setCache<T>(
  prefix: string,
  identifier: string,
  data: T,
  ttl: number = DEFAULT_TTL,
): Promise<void> {
  try {
    const redis = getRedis();
    const key = buildKey(prefix, identifier);
    const serialized = JSON.stringify(data);
    await redis.set(key, serialized, 'EX', ttl);
  } catch (error) {
    logger.warn('Cache set failed', { prefix, identifier, ttl, error });
  }
}

export async function invalidateCache(prefix: string, identifier?: string): Promise<void> {
  try {
    const redis = getRedis();
    if (identifier) {
      const key = buildKey(prefix, identifier);
      await redis.del(key);
    } else {
      let cursor = '0';
      do {
        const result = await redis.scan(cursor, 'MATCH', `guardianai:${prefix}:*`, 'COUNT', 100);
        cursor = result[0];
        const keys = result[1];
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== '0');
    }
  } catch (error) {
    logger.warn('Cache invalidation failed', { prefix, identifier, error });
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    let cursor = '0';
    do {
      const result = await redis.scan(cursor, 'MATCH', `guardianai:${pattern}`, 'COUNT', 100);
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    logger.warn('Cache pattern invalidation failed', { pattern, error });
  }
}

export async function getOrSetCache<T>(
  prefix: string,
  identifier: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
): Promise<T> {
  const cached = await getCached<T>(prefix, identifier);
  if (cached !== null) return cached;
  const data = await fetcher();
  await setCache(prefix, identifier, data, ttl);
  return data;
}

export async function withCacheInvalidation<T>(
  prefix: string,
  identifier: string | undefined,
  operation: () => Promise<T>,
): Promise<T> {
  const result = await operation();
  await invalidateCache(prefix, identifier);
  return result;
}

export const CachePrefix = {
  USER: 'user',
  WORKER: 'worker',
  DEVICE: 'device',
  INCIDENT: 'incident',
  FACTORY: 'factory',
  BUILDING: 'building',
  FLOOR: 'floor',
  ZONE: 'zone',
  DEPARTMENT: 'department',
  SHIFT: 'shift',
  ATTENDANCE: 'attendance',
  CERTIFICATION: 'certification',
  FIRMWARE: 'firmware',
  SENSOR: 'sensor',
  SENSOR_READING: 'sensor_reading',
  CAMERA: 'camera',
  ALERT: 'alert',
  NOTIFICATION: 'notification',
  REPORT: 'report',
  RISK_PREDICTION: 'risk_prediction',
  WEARABLE_VITALS: 'wearable_vitals',
  ENVIRONMENTAL: 'environmental',
  EQUIPMENT_HEALTH: 'equipment_health',
  COMPLIANCE: 'compliance',
  AUDIT_LOG: 'audit_log',
  AI_MODEL: 'ai_model',
  FUSION: 'fusion',
  EMERGENCY: 'emergency',
  ANALYTICS: 'analytics',
  DASHBOARD: 'dashboard',
  LIST: 'list',
} as const;
