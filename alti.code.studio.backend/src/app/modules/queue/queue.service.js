/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Queue } from 'bullmq';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

class QueueService {
    constructor() {
        /** @type {Map<string, Queue>} */
        this.queues = new Map();
        this.isInitialized = false;

        // Parse Redis connection from REDIS_URL if provided, otherwise use discrete env vars.
        if (process.env.REDIS_URL) {
            const url = new URL(process.env.REDIS_URL);
            this.redisConfig = {
                host: url.hostname,
                port: Number(url.port) || 6379,
                password: url.password || undefined,
            };
        } else {
            this.redisConfig = {
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT) || 6379,
                password: process.env.REDIS_PASSWORD || undefined,
            };
        }
    }

    init() {
        if (this.isInitialized) return;
        if (process.env.DISABLE_REDIS === 'true') {
            this.isInitialized = true;
            logger.info('⚠️ QueueService: Redis disabled via env. Bypassing queue initialization.');
            return;
        }

        try {
            for (const name of ['audit', 'notifications', 'refactor-queue']) {
                this._createQueue(name);
            }
            this.isInitialized = true;
            logger.info('✅ QueueService: Initialized BullMQ Queues');
        } catch (error) {
            logger.error('❌ QueueService: Failed to initialize queues', error);
        }
    }

    /** @private Create and register a named queue with error handling. */
    _createQueue(name) {
        if (process.env.DISABLE_REDIS === 'true') return null;
        const queue = new Queue(name, { connection: this.redisConfig });
        queue.on('error', (err) => logger.error(`❌ Queue [${name}] Error`, err));
        this.queues.set(name, queue);
        return queue;
    }

    /**
     * Get or lazily create a queue by name.
     * @param {string} queueName
     * @returns {Queue}
     */
    _getOrCreateQueue(queueName) {
        if (process.env.DISABLE_REDIS === 'true') return null;
        if (!this.isInitialized) this.init();
        if (!this.queues.has(queueName)) {
            logger.info(`🔧 QueueService: Lazily creating queue "${queueName}"`);
            this._createQueue(queueName);
        }
        return this.queues.get(queueName);
    }

    /**
     * Add a job to a named queue.
     * The queue is created on-demand if it does not already exist.
     *
     * @param {string} queueName
     * @param {object} data
     * @param {object} [opts]
     * @returns {Promise<import('bullmq').Job>}
     */
    async addJob(queueName, data, opts = {}) {
        if (process.env.DISABLE_REDIS === 'true') {
            logger.info(`[Mock Queue] Bypassed adding job to ${queueName}`);
            return { id: `mock-${Date.now()}`, name: queueName, data };
        }
        if (!queueName || typeof queueName !== 'string') {
            throw new Error('QueueService: queueName must be a non-empty string.');
        }
        if (!data || typeof data !== 'object') {
            throw new Error('QueueService: data must be a non-null object.');
        }
        const queue = this._getOrCreateQueue(queueName);
        try {
            return await queue.add(queueName, data, {
                removeOnComplete: true,
                removeOnFail: 50,
                ...opts,
            });
        } catch (error) {
            logger.error(`❌ QueueService: Failed to add job to "${queueName}"`, error);
            throw error;
        }
    }

    /**
     * Get a job by ID from a named queue.
     * @param {string} queueName
     * @param {string} jobId
     * @returns {Promise<import('bullmq').Job | null>}
     */
    async getJob(queueName, jobId) {
        if (process.env.DISABLE_REDIS === 'true') return null;
        const queue = this._getOrCreateQueue(queueName);
        try {
            return await queue.getJob(jobId);
        } catch (error) {
            logger.error(`❌ QueueService: Failed to get job "${jobId}" from "${queueName}"`, error);
            return null;
        }
    }

    /**
     * Get counts of jobs in various states for a named queue.
     * @param {string} queueName
     * @returns {Promise<object>}
     */
    async getQueueStats(queueName) {
        if (process.env.DISABLE_REDIS === 'true') {
            return { queueName, waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
        }
        const queue = this._getOrCreateQueue(queueName);
        try {
            const [waiting, active, completed, failed, delayed] = await Promise.all([
                queue.getWaitingCount(),
                queue.getActiveCount(),
                queue.getCompletedCount(),
                queue.getFailedCount(),
                queue.getDelayedCount(),
            ]);
            return { queueName, waiting, active, completed, failed, delayed };
        } catch (error) {
            logger.error(`❌ QueueService: Failed to get stats for "${queueName}"`, error);
            return { queueName, error: error.message };
        }
    }
}

export const queueService = new QueueService();
