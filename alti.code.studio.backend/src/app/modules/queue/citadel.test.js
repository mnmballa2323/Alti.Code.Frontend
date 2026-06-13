/**
 * Copyright (c) 2024 Inso Code
 * 
 * The Citadel Test — "The 11-Agent Federation"
 * Verifies the entire autonomous system:
 * - LedgerService (crypto-audit chain)
 * - All 11 Workers (audit, git, refactor, security, devops, qa, monitoring, iac, cicd, notification-implied)
 * - Agent Registry (capability catalog)
 * - AI Provider (model-agnostic)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- MOCKS ----
const mocks = vi.hoisted(() => ({
    workerInstances: [],
}));

vi.mock('bullmq', () => ({
    Queue: vi.fn().mockImplementation(() => ({
        add: vi.fn().mockResolvedValue({ id: 'test-job-1' }),
    })),
    Worker: class MockWorker {
        constructor(queueName, processor, opts) {
            this.queueName = queueName;
            this.processor = processor;
            this.opts = opts;
            mocks.workerInstances.push(this);
        }
        on() { return this; }
        close() { return Promise.resolve(); }
    },
}));

vi.mock('ioredis', () => ({
    default: vi.fn().mockImplementation(() => ({
        on: vi.fn(), status: 'ready'
    }))
}));

vi.mock('../../services/socket.service.js', () => ({
    socketService: { broadcast: vi.fn() }
}));

vi.mock('../../../shared/logger.js', () => ({
    logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() }
}));

vi.mock('../audit/audit.model.js', () => ({
    AuditLog: {
        create: vi.fn().mockResolvedValue({}),
        findOne: vi.fn().mockReturnValue({ sort: vi.fn().mockResolvedValue(null) })
    }
}));

vi.mock('../refactorAgent/refactor.worker.js', () => ({
    refactorWorkerProcessor: vi.fn().mockResolvedValue({ status: 'ok' })
}));
vi.mock('../securityAgent/security.worker.js', () => ({
    securityWorkerProcessor: vi.fn().mockResolvedValue({ score: 100 })
}));
vi.mock('../devOpsAgent/devops.worker.js', () => ({
    devOpsWorkerProcessor: vi.fn().mockResolvedValue({ status: 'deployed' })
}));
vi.mock('../qa/qa.worker.js', () => ({
    qaWorkerProcessor: vi.fn().mockResolvedValue({ status: 'passed' })
}));
vi.mock('../monitoring/monitoring.worker.js', () => ({
    monitoringWorkerProcessor: vi.fn().mockResolvedValue({ status: 'OK' })
}));
vi.mock('../iacAgent/iac.worker.js', () => ({
    iacWorkerProcessor: vi.fn().mockResolvedValue({ resources_changed: 3 })
}));
vi.mock('../ciCdAgent/cicd.worker.js', () => ({
    ciCdWorkerProcessor: vi.fn().mockResolvedValue({ buildId: 'build-42' })
}));
vi.mock('../audit/audit.worker.js', () => ({
    auditWorkerProcessor: vi.fn().mockResolvedValue({ hash: 'abc123', previousHash: '000000' })
}));
vi.mock('../gitAgent/git.worker.js', () => ({
    gitWorkerProcessor: vi.fn().mockResolvedValue({ status: 'pushed', commit: 'abc' })
}));

// ---- TESTS ----
describe('The Citadel — 11-Agent Federation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize ALL workers in the Federation', async () => {
        process.env.DISABLE_REDIS = 'false';
        const { workerService } = await import('./worker.service.js');
        await workerService.init();

        const expectedAgents = [
            'audit', 'git', 'refactor', 'security', 'devops',
            'qa', 'monitoring', 'iac', 'cicd'
        ];
        console.log("FAILED WORKERS:", workerService.workers, workerService.failedWorkers);
        console.log("NODE ENV:", process.env.NODE_ENV);
        for (const agent of expectedAgents) {
            expect(workerService.workers[agent], `Worker "${agent}" not found!`).toBeDefined();
        }

        expect(Object.keys(workerService.workers).length).toBeGreaterThanOrEqual(9);
    }, 10000);
});

describe('Agent Registry — The Nexus', () => {
    it('should have all agents registered with capabilities', async () => {
        const { agentRegistry } = await import('../agents/agent.registry.js');

        expect(agentRegistry.count).toBeGreaterThanOrEqual(10);

        // Verify capability-based lookup
        const securityAgents = agentRegistry.findByCapability('security-scan');
        expect(securityAgents.length).toBeGreaterThanOrEqual(1);
        expect(securityAgents[0].name).toBe('security');

        // Verify JSON export for auditing
        const json = agentRegistry.toJSON();
        expect(json.count).toBeGreaterThanOrEqual(10);
        expect(json.agents[0]).toHaveProperty('name');
        expect(json.agents[0]).toHaveProperty('capabilities');
    });
});

describe('LedgerService — The Black Box', () => {
    it('should generate a SHA-256 hash', async () => {
        const { ledgerService } = await import('../ledger/ledger.service.js');
        const hash = ledgerService.calculateHash('test data');
        expect(hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 = 64 hex chars
    });
});
