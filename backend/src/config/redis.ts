// ============================================================
// Redis Configuration
// ============================================================

import Redis from 'ioredis';
import { config } from './index';
import logger from './logger';

// Create Redis client
const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  db: config.REDIS_DB,
  keyPrefix: config.REDIS_KEY_PREFIX,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
});

// Event handlers
redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('ready', () => {
  logger.info('Redis ready');
});

redis.on('error', (error) => {
  logger.error('Redis error', { error: error.message });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Cache helpers
export const cache = {
  // Get with optional parser
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
  
  // Set with optional expiry
  async set(key: string, value: unknown, expirySeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (expirySeconds) {
      await redis.setex(key, expirySeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },
  
  // Delete
  async del(key: string): Promise<void> {
    await redis.del(key);
  },
  
  // Delete by pattern
  async delByPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
  
  // Increment
  async incr(key: string): Promise<number> {
    return redis.incr(key);
  },

  // Atomic increment with expiry (Lua script)
  async incrWithExpiry(key: string, expirySeconds: number): Promise<number> {
    const luaScript = `
      local count = redis.call('INCR', KEYS[1])
      if count == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
      end
      return count
    `;
    return redis.eval(luaScript, 1, key, expirySeconds) as Promise<number>;
  },
  
  // Decrement
  async decr(key: string): Promise<number> {
    return redis.decr(key);
  },
  
  // Check exists
  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },
  
  // Set expiry
  async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  },
  
  // Get TTL
  async ttl(key: string): Promise<number> {
    return redis.ttl(key);
  }
};

// Rate limiting helper
export const rateLimit = {
  async check(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `${key}:${Math.floor(now / windowSeconds)}`;
    const resetAt = (Math.floor(now / windowSeconds) + 1) * windowSeconds;
    
    const current = await redis.incr(windowKey);
    
    if (current === 1) {
      await redis.expire(windowKey, windowSeconds);
    }
    
    const remaining = Math.max(0, limit - current);
    
    return {
      allowed: current <= limit,
      remaining,
      resetAt
    };
  }
};

// Session store
export const sessions = {
  async create(userId: string, sessionData: Record<string, unknown>): Promise<string> {
    const sessionId = `sess:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    await cache.set(`session:${sessionId}`, { userId, ...sessionData }, 86400); // 24 hours
    return sessionId;
  },
  
  async get(sessionId: string): Promise<{ userId: string; [key: string]: unknown } | null> {
    return cache.get(`session:${sessionId}`);
  },
  
  async destroy(sessionId: string): Promise<void> {
    await cache.del(`session:${sessionId}`);
  },
  
  async refresh(sessionId: string): Promise<void> {
    await cache.expire(`session:${sessionId}`, 86400);
  }
};

// Graceful shutdown
export async function closeRedisConnection(): Promise<void> {
  try {
    await redis.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection', { error });
  }
}

export { redis };
