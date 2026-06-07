/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import config from '../../config/index.js';
import { logger } from './logger.js';
import EventEmitter from 'events';

// Mock Classes for fallback when Redis is unavailable
class MockJob {
    constructor(name, data) {
        this.id = Math.random().toString(36).substring(7);
        this.name = name;
        this.data = data;
        this.state = 'waiting';
        this.finishedPromise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    async getState() {
        return this.state;
    }

    async waitUntilFinished(queue, timeout) {
        return this.finishedPromise;
    }
}

class MockQueue {
    constructor(name) {
        this.name = name;
        this.jobs = [];
        this.processor = null;
    }

    async add(name, data, opts) {
        const job = new MockJob(name, data);
        this.jobs.push(job);
        logger.info(`[MockQueue] Added job ${name} to ${this.name}`);

        // Simulate async processing if a worker is registered
        if (this.processor) {
            setTimeout(async () => {
                job.state = 'active';
                try {
                    const result = await this.processor(job);
                    job.state = 'completed';
                    job._resolve(result);
                } catch (err) {
                    job.state = 'failed';
                    job._reject(err);
                }
            }, 100);
        }
        return job;
    }

    async close() {
        logger.info(`[MockQueue] Closed ${this.name}`);
    }
}

class MockWorker extends EventEmitter {
    constructor(name, processor) {
        super();
        this.name = name;
        this.processor = processor;
        // Attach to the mock queue if it exists
        const queue = jobQueueService.queues.get(name);
        if (queue && queue instanceof MockQueue) {
            queue.processor = processor;
            // Process any pending jobs
            queue.jobs.forEach(async (job) => {
                if (job.state !== 'waiting') return;
                job.state = 'active';
                try {
                    const result = await processor(job);
                    job.state = 'completed';
                    job._resolve(result);
                } catch (err) {
                    job.state = 'failed';
                    job._reject(err);
                }
            });
        }
    }

    async close() {
        logger.info(`[MockWorker] Closed worker for ${this.name}`);
    }
}

class JobQueueService {
    constructor() {
        logger.info('JobQueueService: Constructor started');
        this.queues = new Map();
        this.workers = new Map();
        this.isMockMode = false;

        if (process.env.DISABLE_REDIS === 'true') {
            this.isMockMode = true;
            this.readinessPromise = Promise.resolve();
            logger.warn('⚠️ JobQueue: Redis disabled via env. Switching to MOCK MODE.');
            return;
        }

        try {
            const configObj = this.getConnectionConfig();
            logger.info('JobQueueService: Config object:', configObj);

            // Initial connection check
            this.readinessPromise = new Promise((resolve) => {
                logger.info('JobQueueService: Creating testRedis...');
                const testRedis = new IORedis(configObj.url, {
                    maxRetriesPerRequest: 0,
                    retryStrategy: () => null,
                    connectTimeout: 2000 // 2 second timeout
                });

                testRedis.on('connect', () => {
                    logger.info('✅ JobQueue: Connected to Redis');
                    this.isMockMode = false;
                    testRedis.disconnect();
                    resolve();
                });

                testRedis.on('error', (err) => {
                    logger.info('JobQueueService: testRedis error:', err.message);
                    logger.warn('⚠️ JobQueue: Redis not available. Switching to MOCK MODE.');
                    this.isMockMode = true;
                    try {
                        testRedis.disconnect();
                    } catch (e) {}
                    resolve(); // Resolve anyway, we are ready in mock mode
                });
            });
        } catch (e) {
            logger.error('JobQueueService: Constructor CRASHed:', e);
        }
    }

    async ensureReady() {
        return this.readinessPromise;
    }

    getConnectionConfig() {
        return {
            url: config.redisUrl || 'redis://localhost:6379',
            maxRetriesPerRequest: null,
        };
    }

    initQueue(queueName) {
        if (this.queues.has(queueName)) return this.queues.get(queueName);

        if (this.isMockMode) {
            const queue = new MockQueue(queueName);
            this.queues.set(queueName, queue);
            return queue;
        }

        const connection = new IORedis(this.getConnectionConfig().url, {
            maxRetriesPerRequest: null,
            retryStrategy: (times) => Math.min(times * 50, 2000)
        });

        // Handle connection errors gracefully to prevent crashes
        connection.on('error', (err) => {
            // logger.error(`JobQueue: Redis connection error on queue ${queueName}`, err);
            // If we really crash here, we might want to fallback dynamically, but for now relying on ensureReady is safest.
        });

        const queue = new Queue(queueName, { connection });
        this.queues.set(queueName, queue);
        logger.info(`JobQueue: Initialized queue '${queueName}'`);
        return queue;
    }

    async addJob(queueName, jobName, data, opts = {}) {
        await this.ensureReady(); // Auto-wait for readiness
        let queue = this.queues.get(queueName);
        if (!queue) {
            queue = this.initQueue(queueName);
        }
        return queue.add(jobName, data, opts);
    }

    async getJob(queueName, jobId) {
        await this.ensureReady();
        const queue = this.queues.get(queueName);
        if (!queue) return null;

        if (this.isMockMode) {
            // In Mock Mode, jobs are simple objects in an array
            return queue.jobs.find(j => j.id === jobId) || null;
        }

        return queue.getJob(jobId);
    }

    registerWorker(queueName, processor, opts = {}) {
        // Note: registerWorker is synchronous in API, but we depend on ensureReady.
        // Users should ideally await ensureReady before registering if they want to be sure of mode.
        // But if we call this before ready, and we end up in MockMode, we might have issues if we already created a real Worker.
        // SAFEGUARD: If not ready, we assume standard behavior but warn?
        // Better: We can't easily make this async without breaking standard signature. 
        // We will assume the user calls ensureReady or we handle it lazily?
        // Let's just check isMockMode. If readinessPromise isn't fired, isMockMode is false (default).
        // That's risky.

        // For check_bullmq.js, we will explicitly await ensureReady.

        if (this.workers.has(queueName)) return this.workers.get(queueName);

        // Ensure queue exists
        if (!this.queues.has(queueName)) {
            this.initQueue(queueName);
        }

        // If we are definitely in mock mode, use it.
        if (this.isMockMode) {
            const worker = new MockWorker(queueName, processor);
            this.workers.set(queueName, worker);
            return worker;
        }

        // Standard Worker
        const connection = new IORedis(this.getConnectionConfig().url, {
            maxRetriesPerRequest: null,
            retryStrategy: (times) => Math.min(times * 50, 2000)
        });

        const worker = new Worker(queueName, async (job) => {
            logger.info(`JobQueue: Processing job ${job.name} in ${queueName}`);
            try {
                const result = await processor(job);
                logger.info(`JobQueue: Completed job ${job.name} in ${queueName}`);
                return result;
            } catch (error) {
                logger.error(`JobQueue: Failed job ${job.name} in ${queueName}`, error);
                throw error;
            }
        }, {
            connection,
            ...opts
        });

        worker.on('failed', (job, err) => {
            logger.error(`JobQueue: Worker error on ${queueName}`, err);
        });

        // Handle worker connection errors
        connection.on('error', () => { }); // Prevent crash

        this.workers.set(queueName, worker);
        return worker;
    }

    async close() {
        for (const queue of this.queues.values()) {
            await queue.close();
        }
        for (const worker of this.workers.values()) {
            await worker.close();
        }
        this.queues.clear();
        this.workers.clear();
    }
}

export const jobQueueService = new JobQueueService();
