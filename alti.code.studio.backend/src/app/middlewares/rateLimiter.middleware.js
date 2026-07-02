/**
 * Copyright (c) 2026 Inso Code
 *
 * rateLimiter.middleware.js — Token bucket rate limiting middleware using Redis.
 */

import { redisClient } from '../../shared/redis.client.js';
import httpStatus from 'http-status';
import { logger } from '../../shared/logger.js';

// In-memory fallback if Redis is offline
const memoryLimitStore = new Map();

/**
 * Enforces rate limiting per IP or User ID.
 * Tiers:
 * - Free / Anonymous: 30 requests per minute
 * - Paid / Authenticated: 120 requests per minute
 */
export const rateLimiter = (options = {}) => {
  return async (req, res, next) => {
    const userId = req.user?._id || req.user?.id;
    const ip =
      req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Choose key based on authentication status
    const key = userId ? `rate_limit:user:${userId}` : `rate_limit:ip:${ip}`;

    // Check if user is subscribed (paid tier)
    const isSubscribed = req.user?.isSubscribed || false;
    const limit = isSubscribed
      ? options.paidLimit || 120
      : options.freeLimit || 30;
    const windowSeconds = options.windowSeconds || 60;

    try {
      if (redisClient.isEnabled) {
        // Multi/Transaction to increment count and set TTL atomically
        const multi = redisClient.multi();
        multi.incr(key);
        multi.ttl(key);

        const replies = await multi.exec();
        const count = replies[0];
        const ttl = replies[1];

        // Set TTL on first request
        if (count === 1 || ttl === -1) {
          await redisClient.expire(key, windowSeconds);
        }

        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));

        if (count > limit) {
          logger.warn(`Rate limit exceeded for client: ${key}`);
          return res.status(httpStatus.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many requests. Please slow down.',
          });
        }
      } else {
        // In-memory fallback
        const now = Date.now();
        const record = memoryLimitStore.get(key) || {
          count: 0,
          resetTime: now + windowSeconds * 1000,
        };

        if (now > record.resetTime) {
          record.count = 1;
          record.resetTime = now + windowSeconds * 1000;
        } else {
          record.count += 1;
        }

        memoryLimitStore.set(key, record);

        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader(
          'X-RateLimit-Remaining',
          Math.max(0, limit - record.count),
        );

        if (record.count > limit) {
          logger.warn(`Rate limit (in-memory) exceeded for client: ${key}`);
          return res.status(httpStatus.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many requests. Please slow down.',
          });
        }
      }
    } catch (err) {
      logger.error('Rate limiting middleware error:', err);
      // Fallback: allow request to proceed if rate limiter breaks to avoid hard blocking
    }

    next();
  };
};
export default rateLimiter;
