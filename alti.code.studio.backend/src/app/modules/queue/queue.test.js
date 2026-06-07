/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { queueService } from './queue.service.js';
import { workerService } from './worker.service.js';

// Mock Logger
vi.mock('../../../shared/logger.js', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    }
}));

// Mock BullMQ using vi.hoisted
const mocks = vi.hoisted(() => {
    return {
        queueInstance: {
            add: vi.fn().mockResolvedValue({ id: 'job_123' }),
            on: vi.fn(),
        },
        workerInstance: {
            on: vi.fn(),
        }
    };
});

vi.mock('bullmq', () => {
    return {
        Queue: class {
            constructor() { }
            add(...args) { return mocks.queueInstance.add(...args); }
            on(...args) { return mocks.queueInstance.on(...args); }
        },
        Worker: class {
            constructor() { }
            on(...args) { return mocks.workerInstance.on(...args); }
        },
    };
});

describe('QueueService & WorkerService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset singletons if possible, or just rely on state
        queueService.isInitialized = false;
        queueService.queues = new Map();
    });

    describe('QueueService', () => {
        it('should initialize queues', () => {
            queueService.init();
            expect(queueService.isInitialized).toBe(true);
            expect(queueService.queues.get('audit')).toBeDefined();
        });

        it('should add job to queue', async () => {
            queueService.init();
            const result = await queueService.addJob('audit', { foo: 'bar' });

            expect(mocks.queueInstance.add).toHaveBeenCalledWith('audit', { foo: 'bar' }, expect.any(Object));
            expect(result).toEqual({ id: 'job_123' });
        });
    });

    describe('WorkerService', () => {
        it('should initialize workers', async () => {
            await workerService.init();
            expect(workerService.workers['audit']).toBeDefined();
        });
    });
});
