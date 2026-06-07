/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createClient } from 'redis';
import { logger } from '../../../shared/logger.js';

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.defaultTTL = 60; // seconds
    }

    async init() {
        if (this.isConnected) return;

        try {
            this.client = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
            });

            this.client.on('error', (err) => logger.error('Redis Cache Error', err));
            this.client.on('connect', () => logger.info('✅ Redis Cache Connected'));

            await this.client.connect();
            this.isConnected = true;
        } catch (error) {
            logger.warn(`Redis Cache failed to connect — caching disabled. (${error.message})`);
            this.isConnected = false;
        }
    }

    /**
     * Get a JSON-parsed value from the cache.
     * Returns null on miss, disconnection, or parse failure.
     * @param {string} key
     * @returns {Promise<any>}
     */
    async get(key) {
        if (!this.isConnected) return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error(`Cache GET error for key "${key}"`, error);
            return null;
        }
    }

    /**
     * Store a JSON-serialized value in the cache.
     * @param {string} key
     * @param {any}    value
     * @param {number} [ttl] - Time-to-live in seconds (defaults to this.defaultTTL)
     */
    async set(key, value, ttl = this.defaultTTL) {
        if (!this.isConnected) return;
        try {
            await this.client.set(key, JSON.stringify(value), { EX: ttl });
        } catch (error) {
            logger.error(`Cache SET error for key "${key}"`, error);
        }
    }

    /**
     * Delete a key from the cache.
     * @param {string} key
     */
    async del(key) {
        if (!this.isConnected) return;
        try {
            await this.client.del(key);
        } catch (error) {
            logger.error(`Cache DEL error for key "${key}"`, error);
        }
    }

    /**
     * Express middleware for transparent HTTP response caching.
     * Only caches GET requests with 2xx responses.
     *
     * @param {number} [duration] - Override TTL in seconds
     * @returns {Function} Express middleware
     */
    cacheMiddleware(duration = this.defaultTTL) {
        return async (req, res, next) => {
            if (req.method !== 'GET') return next();

            const key = `cache:${req.originalUrl || req.url}`;
            const cached = await this.get(key);

            if (cached !== null) {
                logger.debug(`Cache HIT: ${key}`);
                return res.json(cached);
            }

            logger.debug(`Cache MISS: ${key}`);

            // Intercept res.json to cache the response on the way out
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    this.set(key, body, duration);
                }
                return originalJson(body);
            };

            next();
        };
    }
}

export const cacheService = new CacheService();
