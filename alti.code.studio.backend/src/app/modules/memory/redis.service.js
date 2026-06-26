import { Redis } from 'ioredis';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

class RedisCacheService {
  constructor() {
    if (process.env.DISABLE_REDIS === 'true') {
      this.client = {
        get: async () => null,
        set: async () => {},
        del: async () => {},
        on: () => {},
      };
      return;
    }

    // Fallback to local Redis if no ElastiCache / managed redis is configured
    const redisUrl = config.redis?.url || 'redis://localhost:6379';

    this.client = new Redis(redisUrl, {
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', err => {
      logger.warn(`⚠️ [ElastiCache/Redis] Connection Error: ${err.message}`);
    });

    this.client.on('connect', () => {
      logger.info(
        `⚡ [ElastiCache/Redis] Connected successfully for distributed Agent Swarm state.`,
      );
    });
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error(`[ElastiCache] Get failed for key ${key}:`, err);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 86400) {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.error(`[ElastiCache] Set failed for key ${key}:`, err);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      logger.error(`[ElastiCache] Delete failed for key ${key}:`, err);
    }
  }
}

export const redisCacheService = new RedisCacheService();
