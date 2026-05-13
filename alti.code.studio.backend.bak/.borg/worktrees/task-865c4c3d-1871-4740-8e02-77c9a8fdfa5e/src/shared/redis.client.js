/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import Redis from 'ioredis';
import { logger } from './logger.js';

class RedisClientWrapper {
    constructor() {
        this.client = null;
        this.isEnabled = false;
    }

    init() {
        if (this.client) return;

        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        try {
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => {
                    if (times > 3) {
                        return null; // Stop retrying
                    }
                    return Math.min(times * 50, 2000);
                }
            });

            this.client.on('connect', () => {
                this.isEnabled = true;
                // logger.info('Redis Connected');
            });

            this.client.on('error', (err) => {
                // logger.warn('Redis Connection Error (Mock Mode Active)', err.message);
                this.isEnabled = false;
            });

        } catch (error) {
            logger.error('Failed to initialize Redis', error);
            this.isEnabled = false;
        }
    }

    async get(key) {
        if (!this.isEnabled) return null;
        return await this.client.get(key);
    }

    async set(key, value) {
        if (!this.isEnabled) return null;
        return await this.client.set(key, value);
    }

    async quit() {
        if (this.client) {
            await this.client.quit();
        }
    }
}

export const redisClient = new RedisClientWrapper();
// Auto-init on import to check status
redisClient.init();
