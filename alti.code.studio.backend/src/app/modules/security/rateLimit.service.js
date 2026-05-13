/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
<<<<<<< HEAD
import { createClient } from 'redis';
=======
import { memorystoreService } from '../googleCloud/memorystore.service.js';
import { sentinelService } from './sentinel.service.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

let rateLimiter = null;
<<<<<<< HEAD
let redisClient = null;
=======
const limiterCache = new Map();
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

const init = async () => {
    if (rateLimiter) return rateLimiter;

    try {
<<<<<<< HEAD
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
=======
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
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
            keyPrefix: 'rate_limit',
            points: 100,
            duration: 60,
        });
    } catch (err) {
<<<<<<< HEAD
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
=======
        logger.warn(`⚠️ RateLimitService: Cloud Memorystore unreachable (${err.message}). Using In-Memory fallback.`);
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

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
<<<<<<< HEAD
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
=======
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
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
            }

            await specificLimiter.consume(req.ip);
            next();
        } catch (rejRes) {
<<<<<<< HEAD
=======
            // Report to Sentinel Layer
            sentinelService.reportEvent('RATE_LIMIT_EXCEEDED', 'MEDIUM', {
                ip: req.ip,
                route: req.originalUrl,
                points,
                duration
            }).catch(err => logger.error('Failed to report rate limit event to Sentinel:', err));

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
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
