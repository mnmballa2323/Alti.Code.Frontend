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
vi.mock('../securityAgent/security.worker.js', () => ({ securityWorkerProcessor: vi.fn() }));
vi.mock('../devOpsAgent/devops.worker.js', () => ({ devOpsWorkerProcessor: vi.fn() }));
vi.mock('../refactorAgent/refactor.worker.js', () => ({ refactorWorkerProcessor: vi.fn() }));
vi.mock('../qa/qa.worker.js', () => ({ qaWorkerProcessor: vi.fn() }));
vi.mock('../monitoring/monitoring.worker.js', () => ({ monitoringWorkerProcessor: vi.fn() }));
vi.mock('../iacAgent/iac.worker.js', () => ({ iacWorkerProcessor: vi.fn() }));
vi.mock('../ciCdAgent/cicd.worker.js', () => ({ ciCdWorkerProcessor: vi.fn() }));

describe('The Singularity Swarm (9 Agents)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        for (const key in mockWorkers) delete mockWorkers[key];
    });

    it('should initialize the full GOD MODE SWARM', async () => {
        await workerService.init();

        const expectedQueues = [
            'audit-queue',
            'notification-queue',
            'refactor-queue',
            'security-queue',
            'devops-queue',
            'qa-queue',
            'monitoring-queue',
            'iac-queue',
            'cicd-queue'
        ];

        expectedQueues.forEach(q => {
            expect(mockWorkers[q]).toBeDefined();
        });
    });
});
