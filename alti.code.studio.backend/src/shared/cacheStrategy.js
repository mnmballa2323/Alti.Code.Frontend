/**
 * Cache Strategy Service
 * 
 * Production-grade Redis cache-aside pattern:
 * - Automatic TTL management
 * - Cache warming
 * - Cache invalidation
 * - Fallback to in-memory if Redis unavailable
 * - Metrics tracking
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';

class CacheStrategy {
  constructor() {
    this.redis = null;
    this.memoryCache = new Map();
    this.isRedisAvailable = false;
    this.defaultTTL = 300; // 5 minutes
  }

  async init(redisClient) {
    if (redisClient) {
      this.redis = redisClient;
      this.isRedisAvailable = true;
      logger.info('[Cache] Redis cache strategy initialized');
    } else {
      logger.warn('[Cache] Redis not available, using in-memory fallback');
    }
  }

  /**
   * Cache-aside pattern: check cache first, then fetch from source
   */
  async getOrSet(key, fetchFn, options = {}) {
    const { ttl = this.defaultTTL, prefix = 'alti' } = options;
    const fullKey = `${prefix}:${key}`;

    // 1. Try cache first
    const cached = await this._get(fullKey);
    if (cached !== null) {
      metrics.incrementCounter('cache_hits_total', 1, { prefix });
      return cached;
    }

    // 2. Cache miss — fetch from source
    metrics.incrementCounter('cache_misses_total', 1, { prefix });
    const value = await fetchFn();

    // 3. Store in cache
    if (value !== null && value !== undefined) {
      await this._set(fullKey, value, ttl);
    }

    return value;
  }

  async get(key, prefix = 'alti') {
    return this._get(`${prefix}:${key}`);
  }

  async set(key, value, ttl = this.defaultTTL, prefix = 'alti') {
    return this._set(`${prefix}:${key}`, value, ttl);
  }

  async invalidate(key, prefix = 'alti') {
    const fullKey = `${prefix}:${key}`;
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(fullKey);
      }
      this.memoryCache.delete(fullKey);
      metrics.incrementCounter('cache_invalidations_total', 1);
    } catch (err) {
      logger.warn(`[Cache] Invalidation failed for ${fullKey}:`, err.message);
    }
  }

  async invalidatePattern(pattern, prefix = 'alti') {
    const fullPattern = `${prefix}:${pattern}`;
    try {
      if (this.isRedisAvailable && this.redis) {
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      // Clear matching memory cache keys
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(fullPattern.replace('*', ''))) {
          this.memoryCache.delete(key);
        }
      }
    } catch (err) {
      logger.warn(`[Cache] Pattern invalidation failed:`, err.message);
    }
  }

  // Pre-defined cache strategies for common data
  strategies = {
    userSession: { ttl: 3600, prefix: 'session' },      // 1 hour
    agentConfig: { ttl: 600, prefix: 'agent' },          // 10 minutes
    gcpCredentials: { ttl: 1800, prefix: 'gcp' },        // 30 minutes
    apiRateCounter: { ttl: 60, prefix: 'rate' },          // 1 minute
    tenantConfig: { ttl: 300, prefix: 'tenant' },         // 5 minutes
    modelPricing: { ttl: 86400, prefix: 'pricing' },      // 24 hours
    healthCheck: { ttl: 30, prefix: 'health' },            // 30 seconds
  };

  async _get(key) {
    try {
      if (this.isRedisAvailable && this.redis) {
        const val = await this.redis.get(key);
        if (val) return JSON.parse(val);
      }
    } catch {
      // Fallback to memory
    }

    const memVal = this.memoryCache.get(key);
    if (memVal && memVal.expires > Date.now()) {
      return memVal.data;
    }
    this.memoryCache.delete(key);
    return null;
  }

  async _set(key, value, ttl) {
    const serialized = JSON.stringify(value);
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.set(key, serialized, 'EX', ttl);
      }
    } catch {
      // Fallback to memory
    }
    // Always set memory cache as L1
    this.memoryCache.set(key, { data: value, expires: Date.now() + ttl * 1000 });

    // Memory cache size guard (prevent leaks)
    if (this.memoryCache.size > 10000) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
  }

  getStats() {
    return {
      memoryCacheSize: this.memoryCache.size,
      redisAvailable: this.isRedisAvailable,
    };
  }
}

export const cacheStrategy = new CacheStrategy();
