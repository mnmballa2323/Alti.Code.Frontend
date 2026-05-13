/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { createClient } from 'redis';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

let rateLimiter = null;
let redisClient = null;

const init = async () => {
    if (rateLimiter) return rateLimiter;

    try {
        const redisUrl = config.redis?.url || 'redis://localhost:6379';
        // Disable auto-reconnect to avoid log spam when service is down
        redisClient = createClient({
            url: redisUrl,
            enableOfflineQueue: false,
            socket: {
                reconnectStrategy: false, // Do not reconnect automatically
                connectTimeout: 2000 // 2 seconds timeout
            }
        });

        redisClient.on('error', (err) => {
            // Only log if we expect it to be working
            if (redisClient?.isOpen) {
                logger.warn(`Redis RateLimit Error: ${err.message}`);
            }
        });

        await redisClient.connect();
        logger.info('🛡️ RateLimitService: Connected to Redis');

        rateLimiter = new RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: 'rate_limit',
            points: 100,
            duration: 60,
        });
    } catch (err) {
        logger.warn(`⚠️ RateLimitService: Redis unreachable (${err.message}). Using In-Memory fallback.`);
        // Disconnect to stop any background attempts
        if (redisClient) {
            try {
                if (redisClient.isOpen) {
                    await redisClient.disconnect();
                }
            } catch (e) { /* ignore disconnect error */ }
            redisClient = null;
        }

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
            // We use the initialized client to create a specific limiter for this route
            // If fallback, we use memory
            let specificLimiter;

            if (redisClient && redisClient.isOpen) {
                specificLimiter = new RateLimiterRedis({
                    storeClient: redisClient,
                    keyPrefix: `rl:${req.route?.path || 'global'}`,
                    points: points,
                    duration: duration,
                });
            } else {
                // Return a new memory limiter, OR strictly reuse the global if we want shared limits (but simplified here)
                specificLimiter = new RateLimiterMemory({
                    points: points,
                    duration: duration,
                });
            }

            await specificLimiter.consume(req.ip);
            next();
        } catch (rejRes) {
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
    consume
};
