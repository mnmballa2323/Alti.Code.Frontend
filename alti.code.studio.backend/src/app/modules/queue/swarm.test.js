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
        info: vi.fn(console.log),
        error: vi.fn(console.error),
        warn: vi.fn(console.warn),
        debug: vi.fn(console.debug),
    }
}));

// Mock BullMQ Workers
vi.mock('bullmq', () => {
    return {
        Worker: class {
            constructor(queueName, processor) {
                global.mockWorkers = global.mockWorkers || {};
                global.mockWorkers[queueName] = processor;
                this.on = vi.fn();
            }
        },
        Queue: class { }
    };
});

// Mock Dependencies
vi.mock('../securityAgent/security.worker.js', () => ({ securityWorkerProcessor: vi.fn() }));
vi.mock('../devOpsAgent/devops.worker.js', () => ({ devOpsWorkerProcessor: vi.fn() }));
vi.mock('../refactorAgent/refactor.worker.js', () => ({ refactorWorkerProcessor: vi.fn() }));
vi.mock('../qa/qa.worker.js', () => ({ qaWorkerProcessor: vi.fn() }));
vi.mock('../monitoring/monitoring.worker.js', () => ({ monitoringWorkerProcessor: vi.fn() }));
vi.mock('../audit/audit.worker.js', () => ({ auditWorkerProcessor: vi.fn() }));


describe('Universal Swarm (7 Agents)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.mockWorkers = {};
    });

    it('should initialize the full IMMORTAL SWARM', async () => {
        await workerService.init();

        const expectedQueues = [
            'audit-queue',
            'refactor-queue',
            'security-queue',
            'devops-queue',
            'qa-queue',
            'monitoring-queue'
        ];

        expectedQueues.forEach(q => {
            expect(global.mockWorkers[q]).toBeDefined();
        });
    });
});
