/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workerService } from './worker.service.js';

// Mocks
vi.mock('../../../shared/logger.js', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    }
}));

// Mock BullMQ Workers
const mockWorkers = {};
vi.mock('bullmq', () => {
    return {
        Worker: class {
            constructor(queueName, processor) {
                mockWorkers[queueName] = processor;
                this.on = vi.fn();
            }
        },
        Queue: class { }
    };
});

// Mock Dependencies
vi.mock('../securityAgent/security.worker.js', () => ({
    securityWorkerProcessor: vi.fn()
}));
vi.mock('../devOpsAgent/devops.worker.js', () => ({
    devOpsWorkerProcessor: vi.fn()
}));
vi.mock('../refactorAgent/refactor.worker.js', () => ({
    refactorWorkerProcessor: vi.fn()
}));
vi.mock('../audit/audit.worker.js', () => ({
    auditWorkerProcessor: vi.fn()
}));

describe('Galactic Federation (Worker Swarm)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        // Clear mock registry
        for (const key in mockWorkers) delete mockWorkers[key];
    });

    it('should register all specialized agents upon initialization', async () => {
        await workerService.init();

        // Check if all queues have assigned processors
        expect(mockWorkers['audit-queue']).toBeDefined();
        expect(mockWorkers['refactor-queue']).toBeDefined();
        expect(mockWorkers['security-queue']).toBeDefined();
        expect(mockWorkers['devops-queue']).toBeDefined();
    });
});
