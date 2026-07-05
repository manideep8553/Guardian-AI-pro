import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  scan: vi.fn(),
};

vi.mock('../config/redis', () => ({
  getRedis: vi.fn(() => mockRedis),
}));

vi.mock('../config/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

import {
  getCached,
  setCache,
  invalidateCache,
  invalidateCachePattern,
  getOrSetCache,
  CacheTTL,
  CachePrefix,
} from '../services/cache.service';

describe('Cache Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCached', () => {
    it('should return parsed data when cache hit', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ name: 'test', value: 42 }));

      const result = await getCached<{ name: string; value: number }>('test', '123');

      expect(result).toEqual({ name: 'test', value: 42 });
      expect(mockRedis.get).toHaveBeenCalledWith('guardianai:test:123');
    });

    it('should return null on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await getCached('test', 'nonexistent');

      expect(result).toBeNull();
    });

    it('should return null and log warning on Redis error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection error'));
      const logger = await import('../config/logger');

      const result = await getCached('test', '123');

      expect(result).toBeNull();
      expect(logger.logger.warn).toHaveBeenCalled();
    });
  });

  describe('setCache', () => {
    it('should store serialized data with default TTL', async () => {
      const data = { foo: 'bar', num: 123 };

      await setCache('test', '456', data);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'guardianai:test:456',
        JSON.stringify(data),
        'EX',
        300,
      );
    });

    it('should store serialized data with custom TTL', async () => {
      const data = { ping: 'pong' };

      await setCache('test', '789', data, 600);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'guardianai:test:789',
        JSON.stringify(data),
        'EX',
        600,
      );
    });

    it('should log warning on Redis error and not throw', async () => {
      mockRedis.set.mockRejectedValue(new Error('set failed'));
      const logger = await import('../config/logger');

      await expect(setCache('test', 'err', { data: 1 })).resolves.toBeUndefined();
      expect(logger.logger.warn).toHaveBeenCalled();
    });
  });

  describe('invalidateCache', () => {
    it('should delete a specific key when identifier is provided', async () => {
      await invalidateCache('user', '123');

      expect(mockRedis.del).toHaveBeenCalledWith('guardianai:user:123');
    });

    it('should scan and delete all keys for a prefix when no identifier', async () => {
      const scanResults: Record<string, [string, string[]]> = {
        '0': ['1', ['guardianai:user:1', 'guardianai:user:2']],
        '1': ['0', ['guardianai:user:3']],
      };
      mockRedis.scan.mockImplementation((cursor: string) => {
        const result = scanResults[cursor] || ['0', []];
        return Promise.resolve(result);
      });

      await invalidateCache('user');

      expect(mockRedis.scan).toHaveBeenCalledWith(
        '0',
        'MATCH',
        'guardianai:user:*',
        'COUNT',
        100,
      );
      expect(mockRedis.del).toHaveBeenCalledWith('guardianai:user:1', 'guardianai:user:2');
      expect(mockRedis.del).toHaveBeenCalledWith('guardianai:user:3');
    });

    it('should handle Redis error gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('del failed'));
      const logger = await import('../config/logger');

      await expect(invalidateCache('test', 'key')).resolves.toBeUndefined();
      expect(logger.logger.warn).toHaveBeenCalled();
    });
  });

  describe('invalidateCachePattern', () => {
    it('should scan and delete keys matching pattern', async () => {
      const scan = vi.fn()
        .mockResolvedValueOnce(['1', ['guardianai:dashboard:stats']])
        .mockResolvedValueOnce(['0', ['guardianai:dashboard:overview']]);
      const del = vi.fn().mockResolvedValue(undefined);
      mockRedis.scan = scan;
      mockRedis.del = del;

      await invalidateCachePattern('dashboard:*');

      expect(scan).toHaveBeenCalledTimes(2);
      expect(del).toHaveBeenCalledWith('guardianai:dashboard:stats');
      expect(del).toHaveBeenCalledWith('guardianai:dashboard:overview');
    });
  });

  describe('getOrSetCache', () => {
    it('should return cached data when available', async () => {
      const cachedData = { from: 'cache', ts: 1 };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const fetcher = vi.fn().mockResolvedValue({ from: 'fetcher', ts: 2 });

      const result = await getOrSetCache('test', 'key', fetcher);

      expect(result).toEqual(cachedData);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should fetch and cache data on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      const freshData = { from: 'fetcher', ts: 2 };
      const fetcher = vi.fn().mockResolvedValue(freshData);

      const result = await getOrSetCache('test', 'key', fetcher);

      expect(result).toEqual(freshData);
      expect(fetcher).toHaveBeenCalledOnce();
      expect(mockRedis.set).toHaveBeenCalledWith(
        'guardianai:test:key',
        JSON.stringify(freshData),
        'EX',
        300,
      );
    });

    it('should use custom TTL when provided', async () => {
      mockRedis.get.mockResolvedValue(null);
      const fetcher = vi.fn().mockResolvedValue({ data: true });

      await getOrSetCache('test', 'custom-ttl', fetcher, 900);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'guardianai:test:custom-ttl',
        JSON.stringify({ data: true }),
        'EX',
        900,
      );
    });

    it('should handle Redis error in get and fallback to fetcher', async () => {
      mockRedis.get.mockRejectedValue(new Error('get failed'));
      const freshData = { fallback: true };
      const fetcher = vi.fn().mockResolvedValue(freshData);

      const result = await getOrSetCache('test', 'faulty', fetcher);

      expect(result).toEqual(freshData);
      expect(fetcher).toHaveBeenCalledOnce();
    });
  });

  describe('CacheTTL constants', () => {
    it('should have expected TTL values', () => {
      expect(CacheTTL.SHORT).toBe(60);
      expect(CacheTTL.DEFAULT).toBe(300);
      expect(CacheTTL.MEDIUM).toBe(900);
      expect(CacheTTL.LONG).toBe(3600);
      expect(CacheTTL.FIFTEEN_MIN).toBe(900);
      expect(CacheTTL.ONE_HOUR).toBe(3600);
      expect(CacheTTL.SIX_HOURS).toBe(21600);
      expect(CacheTTL.ONE_DAY).toBe(86400);
    });
  });

  describe('CachePrefix constants', () => {
    it('should have all expected prefixes', () => {
      expect(CachePrefix.USER).toBe('user');
      expect(CachePrefix.WORKER).toBe('worker');
      expect(CachePrefix.DEVICE).toBe('device');
      expect(CachePrefix.INCIDENT).toBe('incident');
      expect(CachePrefix.FACTORY).toBe('factory');
      expect(CachePrefix.SENSOR).toBe('sensor');
      expect(CachePrefix.ALERT).toBe('alert');
      expect(CachePrefix.ANALYTICS).toBe('analytics');
      expect(CachePrefix.DASHBOARD).toBe('dashboard');
      expect(CachePrefix.LIST).toBe('list');
    });
  });
});
