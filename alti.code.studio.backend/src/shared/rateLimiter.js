import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { cacheStrategy } from './cacheStrategy.js';
import { tenantManager } from './tenantManager.js';

class RateLimiter {
  constructor() {
    this.limits = {
      'Cloud': 100,
      'Dedicated': 1000,
      'Sovereign': 10000
    };
  }

  async init() {
    logger.info('[RateLimiter] Initialized');
  }

  async checkLimit(tenantId, endpointType) {
    if (!tenantId) {
      return true;
    }

    try {
      const tenant = await tenantManager.getTenant(tenantId);
      const tier = tenant?.tier || 'Cloud';
      const limit = this.limits[tier] || this.limits['Cloud'];

      const key = `rate_limit:${tenantId}:${endpointType}`;
      
      // Simple sliding window / token bucket simulation using cache
      // In a real implementation this would use Redis INCR and EXPIRE or a Lua script
      const currentCount = await cacheStrategy.get(key) || 0;
      
      if (currentCount >= limit) {
        metrics.incrementCounter('rate_limit_exceeded', 1, { tenant: tenantId, tier });
        logger.warn(`[RateLimiter] Limit exceeded for tenant ${tenantId} on ${endpointType}`);
        return false;
      }

      await cacheStrategy.set(key, currentCount + 1, { ttl: 1 }); // 1 second window
      return true;
    } catch (err) {
      logger.error(`[RateLimiter] Error checking limit for ${tenantId}:`, err.message);
      // Fail open to avoid blocking legitimate traffic during cache failures
      return true;
    }
  }
}

export const rateLimiter = new RateLimiter();
