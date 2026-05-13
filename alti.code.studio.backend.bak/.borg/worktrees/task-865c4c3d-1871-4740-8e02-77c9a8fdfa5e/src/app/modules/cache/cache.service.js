/**
 * Copyright (c) 2024 Alti.Code.Studio
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
        this.defaultTTL = 60; // 60 seconds
    }

    async init() {
        if (this.isConnected) return;

        try {
            this.client = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });

            this.client.on('error', (err) => logger.error('Redis Cache Error', err));
            this.client.on('connect', () => logger.info('✅ Redis Cache Connected'));

            await this.client.connect();
            this.isConnected = true;
        } catch (error) {
            logger.warn('Redis Cache failed to connect. Caching will be disabled.', error.message);
            this.isConnected = false;
        }
    }

    /**
     * Get value from cache
     * @param {string} key 
     * @returns {Promise<any>}
     */
    async get(key) {
        if (!this.isConnected) return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error(`Cache GET error for ${key}`, error);
            return null;
        }
    }

        return async (req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    const cachedResponse = await this.get(key);

    if (cachedResponse) {
        // logger.info(`Cache HIT: ${key}`);
        return res.json(cachedResponse);
    }

    // Capture the original send to cache the response
    const originalSend = res.json;
    res.json = (body) => {
        // logger.info(`Cache MISS: ${key}`);
        this.set(key, body, duration);
        return originalSend.call(res, body);
    };

    next();
};
    }
}

export const cacheService = new CacheService();
// Auto-init for convenience, or call in app.js
// cacheService.init(); 
