/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../shared/logger.js', () => ({
  logger: {
    info: vi.fn(console.log),
    error: vi.fn(console.error),
    warn: vi.fn(console.warn),
    debug: vi.fn(console.debug),
  },
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
    Queue: class {},
  };
});

// Mock Dependencies
vi.mock('../securityAgent/security.worker.js', () => ({
  securityWorkerProcessor: vi.fn(),
}));
vi.mock('../devOpsAgent/devops.worker.js', () => ({
  devOpsWorkerProcessor: vi.fn(),
}));
vi.mock('../refactorAgent/refactor.worker.js', () => ({
  refactorWorkerProcessor: vi.fn(),
}));
vi.mock('../qa/qa.worker.js', () => ({ qaWorkerProcessor: vi.fn() }));
vi.mock('../monitoring/monitoring.worker.js', () => ({
  monitoringWorkerProcessor: vi.fn(),
}));
vi.mock('../iacAgent/iac.worker.js', () => ({ iacWorkerProcessor: vi.fn() }));
vi.mock('../ciCdAgent/cicd.worker.js', () => ({
  ciCdWorkerProcessor: vi.fn(),
}));
vi.mock('../audit/audit.worker.js', () => ({ auditWorkerProcessor: vi.fn() }));

describe('The Singularity Swarm (9 Agents)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    global.mockWorkers = {};
  });

  it('should initialize the full GOD MODE SWARM', async () => {
    const { workerService } = await import('./worker.service.js');
    await workerService.init();

    const expectedAgents = [
      'audit',
      'refactor',
      'security',
      'devops',
      'qa',
      'monitoring',
      'iac',
      'cicd',
    ];

    expectedAgents.forEach(agent => {
      expect(workerService.workers[agent]).toBeDefined();
    });
  });
});
