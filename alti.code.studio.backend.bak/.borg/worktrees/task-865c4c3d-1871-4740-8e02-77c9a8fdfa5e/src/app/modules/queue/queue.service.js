/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Queue } from 'bullmq';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

class QueueService {
    constructor() {
        this.queues = {};
        this.isInitialized = false;

        // Redis connection config (BullMQ specific)
        this.redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        };

        // Handle production Redis URL parsing if needed
        if (process.env.REDIS_URL) {
            const url = new URL(process.env.REDIS_URL);
            this.redisConfig = {
                host: url.hostname,
                port: Number(url.port),
                password: url.password,
            };
        }
    }

    init() {
        if (this.isInitialized) return;

        try {
            this.queues['audit'] = new Queue('audit-queue', { connection: this.redisConfig });
            this.queues['notifications'] = new Queue('notification-queue', { connection: this.redisConfig });

            this.isInitialized = true;
            logger.info('✅ QueueService: Initialized BullMQ Queues');
        } catch (error) {
            logger.error('❌ QueueService: Failed to initialize queues', error);
        }
    }

    /**
     * Add a job to a queue
     * @param {string} queueName 
     * @param {object} data 
     * @param {object} opts 
     */
    async addJob(queueName, data, opts = {}) {
        if (!this.isInitialized) this.init();

        const queue = this.queues[queueName];
        if (!queue) {
            logger.error(`❌ QueueService: Queue ${queueName} not found`);
            return null;
        }

        try {
            return await queue.add(queueName, data, {
                removeOnComplete: true, // Auto-cleanup to save Redis memory
                removeOnFail: 50, // Keep last 50 failed jobs for debugging
                ...opts
            });
        } catch (error) {
            logger.error(`❌ QueueService: Failed to add job to ${queueName}`, error);
            return null;
        }
    }
}

export const queueService = new QueueService();
