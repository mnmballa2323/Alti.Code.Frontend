/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { memorystoreService } from '../gcpCloud/gcpCache.service.js';
import { sentinelService } from './sentinel.service.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

let rateLimiter = null;
const limiterCache = new Map();

const init = async () => {
  if (rateLimiter) return rateLimiter;

  try {
    // Ensure Memorystore is initialized and connected
    if (!memorystoreService.isInitialized) {
      await memorystoreService.init();
    }

    const storeClient = memorystoreService.publisher;

    if (!storeClient || storeClient.status !== 'ready') {
      throw new Error('Memorystore client is not ready.');
    }

    logger.info('🛡️ RateLimitService: Connected to Google Cloud Memorystore.');

    rateLimiter = new RateLimiterRedis({
      storeClient: storeClient,
      keyPrefix: 'rate_limit',
      points: 100,
      duration: 60,
    });
  } catch (err) {
    logger.warn(
      `⚠️ RateLimitService: Cloud Memorystore unreachable (${err.message}). Using In-Memory fallback.`,
    );

    rateLimiter = new RateLimiterMemory({
      points: 100,
      duration: 60,
    });
  }

  return rateLimiter;
};

const middleware = (points = 10, duration = 60) => {
  return async (req, res, next) => {
    if (!rateLimiter) await init();

    // If using Memory, we might need a separate instance for different points/duration?
    // rate-limiter-flexible usually shares the store.
    // For simplicity, we stick to the global limiter instance but consume points based on arguments?
    // Actually, creating new limiters sharing the client is better for different rules.

    // Let's create specific limiters on demand or use the global one.
    // For the purpose of "Phase 16", let's make a robust limiter factory.

    try {
      // Check if we already created a limiter for this path
      const routePath = req.route?.path || 'global';
      const cacheKey = `${routePath}_${points}_${duration}`;

      let specificLimiter = limiterCache.get(cacheKey);

      if (!specificLimiter) {
        const storeClient = memorystoreService.publisher;
        if (storeClient && storeClient.status === 'ready') {
          specificLimiter = new RateLimiterRedis({
            storeClient: storeClient,
            keyPrefix: `rl:${routePath}`,
            points: points,
            duration: duration,
          });
        } else {
          specificLimiter = new RateLimiterMemory({
            points: points,
            duration: duration,
          });
        }
        limiterCache.set(cacheKey, specificLimiter);
      }

      await specificLimiter.consume(req.ip);
      next();
    } catch (rejRes) {
      // Report to Sentinel Layer
      sentinelService
        .reportEvent('RATE_LIMIT_EXCEEDED', 'MEDIUM', {
          ip: req.ip,
          route: req.originalUrl,
          points,
          duration,
        })
        .catch(err =>
          logger.error('Failed to report rate limit event to Sentinel:', err),
        );

      res.status(429).json({
        success: false,
        message: 'Too Many Requests',
      });
    }
  };
};

const consume = async (key, points = 1) => {
  if (!rateLimiter) await init();
  return rateLimiter.consume(key, points);
};

export const RateLimitService = {
  init,
  middleware,
  consume,
};
