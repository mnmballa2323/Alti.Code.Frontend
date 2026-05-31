/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * STRESS TEST — 115-Agent System Validation
 * 
 * Tests:
 *   1. Orchestrator dispatch in all 3 modes (AUTONOMOUS, SUPERVISED, HYBRID)
 *   2. Multi-agent workflow chaining (sequential output passing)
 *   3. Human-in-the-loop: approve + reject flows
 *   4. Parallel dispatch across multiple squads
 *   5. Every single Legion processor fires and returns structured output
 *   6. Capability-based routing finds agents across Armada + Legion
 *   7. WorkerFactory status reports correct counts
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// ---- MOCKS ----
const addedJobs = [];

vi.mock('bullmq', () => ({
    Queue: vi.fn().mockImplementation((name) => ({
        name,
        add: vi.fn().mockImplementation(async (jobName, data) => {
            const job = { id: `job-${addedJobs.length + 1}`, name: jobName, data };
            addedJobs.push(job);
            return job;
        }),
    })),
    Worker: class MockWorker {
        constructor() { }
        on() { return this; }
        close() { return Promise.resolve(); }
    },
}));

vi.mock('ioredis', () => ({
    default: vi.fn().mockImplementation(() => ({
        ping: vi.fn().mockResolvedValue('PONG'),
    })),
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
        find: vi.fn().mockReturnValue({ sort: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }) })
    }
}));

// Mock QueueService — ensure all queues return valid job objects
let jobCounter = 0;
vi.mock('../queue/queue.service.js', () => ({
    queueService: {
        isInitialized: true,
        queues: {},
        init: vi.fn(),
        addJob: vi.fn().mockImplementation(async (queueName, data) => {
            jobCounter++;
            return { id: `stress-job-${jobCounter}`, name: queueName, data };
        })
    }
}));

// Mock config
vi.mock('../../../../config/index.js', () => ({
    default: { 
        redis: { host: 'localhost', port: 6379 },
        gcp: { project_id: 'alti-code-studio', location: 'us-central1' }
    }
}));

vi.mock('../ai/ai.provider.js', () => ({
    aiProvider: {
        reason: vi.fn().mockResolvedValue('[{"agent": "debug", "data": {"task": "analyze"}, "description": "Debug the issue", "parallel": false}]'),
        generate: vi.fn().mockResolvedValue('{}'),
        getInfo: vi.fn().mockReturnValue({ provider: 'gemini', model: 'gemini-3.1-flash' }),
        switchTo: vi.fn()
    }
}));

// ---- SETUP ----
let orchestrator, agentRegistry, legionFactory, LEGION_DEFINITIONS;

beforeAll(async () => {
    const legionMod = await import('../legion/legion.factory.js');
    legionFactory = legionMod.legionFactory;
    legionFactory.boot();

    const regMod = await import('../agents/agent.registry.js');
    agentRegistry = regMod.agentRegistry;

    const orchMod = await import('../agents/orchestrator.js');
    orchestrator = orchMod.orchestrator;

    const defMod = await import('../legion/legion.definitions.js');
    LEGION_DEFINITIONS = defMod.LEGION_DEFINITIONS;
});

// ═════════════════════════════════════════════════
// TEST 1: ORCHESTRATOR DISPATCH — ALL 3 MODES
// ═════════════════════════════════════════════════

describe('Orchestrator Dispatch — All 3 Modes', () => {
    it('AUTONOMOUS mode: dispatches immediately without human approval', async () => {
        orchestrator.setMode('AUTONOMOUS');
        const result = await orchestrator.dispatch('Fix the login bug in auth service');

        expect(result.status).toBe('executed');
        expect(result.mode).toBe('AUTONOMOUS');
        expect(result.planId).toBeDefined();
        expect(result.results).toBeDefined();
    });

    it('SUPERVISED mode: holds for human approval', async () => {
        orchestrator.setMode('SUPERVISED');
        const result = await orchestrator.dispatch('Deploy to production');

        expect(result.status).toBe('awaiting_approval');
        expect(result.planId).toBeDefined();
        expect(result.plan).toBeDefined();
        expect(result.message).toContain('approval');
    });

    it('HYBRID mode: auto-dispatches non-critical, holds critical', async () => {
        // Mock AI to return a mix of critical and non-critical agents
        const { aiProvider } = await import('../ai/ai.provider.js');
        aiProvider.reason.mockResolvedValueOnce(
            '[{"agent": "debug", "data": {}, "description": "Non-critical", "parallel": false}, ' +
            '{"agent": "devops", "data": {}, "description": "Critical deploy", "parallel": false}]'
        );

        orchestrator.setMode('HYBRID');
        const result = await orchestrator.dispatch('Debug and deploy the fix');

        expect(result.status).toBe('hybrid_partial');
        expect(result.autoDispatched.length).toBeGreaterThanOrEqual(1);
        expect(result.pendingApproval.length).toBeGreaterThanOrEqual(1);

        // Reset
        orchestrator.setMode('AUTONOMOUS');
    });
});

// ═════════════════════════════════════════════════
// TEST 2: MULTI-AGENT WORKFLOW CHAINING
// ═════════════════════════════════════════════════

describe('Multi-Agent Workflow Chaining', () => {
    it('should chain agents sequentially with output passing', async () => {
        const workflow = [
            { agent: 'codeReview', data: { task: 'Review auth module' } },
            { agent: 'debug', data: { task: 'Fix issues from review' } },
            { agent: 'documentation', data: { task: 'Update docs' } }
        ];

        const result = await orchestrator.runWorkflow(workflow);

        expect(result.workflow).toBe(true);
        expect(result.steps.length).toBe(3);
        expect(result.steps[0].agent).toBe('codeReview');
        expect(result.steps[0].step).toBe(1);
        expect(result.steps[1].agent).toBe('debug');
        expect(result.steps[1].step).toBe(2);
        expect(result.steps[2].agent).toBe('documentation');
        expect(result.steps[2].step).toBe(3);
    });

    it('should skip unknown agents in workflows gracefully', async () => {
        const workflow = [
            { agent: 'codeReview', data: { task: 'Review' } },
            { agent: 'nonExistentAgent', data: { task: 'Fail' } },
            { agent: 'debug', data: { task: 'Continue' } }
        ];

        const result = await orchestrator.runWorkflow(workflow);

        // Should skip the unknown agent and continue
        expect(result.steps.length).toBe(2);
    });
});

// ═════════════════════════════════════════════════
// TEST 3: HUMAN-IN-THE-LOOP — APPROVE + REJECT
// ═════════════════════════════════════════════════

describe('Human-in-the-Loop — Approve & Reject', () => {
    it('should approve a pending plan and execute it', async () => {
        orchestrator.setMode('SUPERVISED');
        const pending = await orchestrator.dispatch('Optimize database queries');
        const planId = pending.planId;

        expect(pending.status).toBe('awaiting_approval');

        // Human approves
        const result = await orchestrator.approve(planId);

        expect(result.status).toBe('executed');
        expect(result.planId).toBe(planId);

        orchestrator.setMode('AUTONOMOUS');
    });

    it('should reject a pending plan with a reason', async () => {
        orchestrator.setMode('SUPERVISED');
        const pending = await orchestrator.dispatch('Delete all data');
        const planId = pending.planId;

        // Human rejects
        const result = orchestrator.reject(planId, 'Too risky');

        expect(result.status).toBe('rejected');
        expect(result.reason).toBe('Too risky');

        orchestrator.setMode('AUTONOMOUS');
    });

    it('should throw when approving a non-existent plan', async () => {
        await expect(orchestrator.approve('fake-plan-id')).rejects.toThrow();
    });
});

// ═════════════════════════════════════════════════
// TEST 4: PARALLEL DISPATCH ACROSS SQUADS
// ═════════════════════════════════════════════════

describe('Parallel Dispatch Across Squads', () => {
    it('should dispatch to multiple agents simultaneously', async () => {
        const agents = ['linter', 'formatter', 'deadCode', 'importSorter'];
        const result = await orchestrator.dispatchParallel(agents, {
            code: 'const x=1;',
            task: 'Clean up code'
        });

        expect(result.length).toBe(4);
        for (const r of result) {
            expect(r.status).toBe('dispatched');
            expect(r.jobId).toBeDefined();
        }
    });

    it('should handle unknown agents in parallel dispatch', async () => {
        const result = await orchestrator.dispatchParallel(
            ['linter', 'fakeAgent', 'formatter'],
            { code: 'x' }
        );

        expect(result.length).toBe(3);
        expect(result[1].error).toBe('Agent not found');
    });
});

// ═════════════════════════════════════════════════
// TEST 5: EVERY LEGION PROCESSOR — FIRE ALL 72
// ═════════════════════════════════════════════════

describe('Legion Processor Stress Test — All 72 Agents', () => {
    it('should execute every single Legion processor and return structured output', async () => {
        // Reset the AI mock to return processor-compatible JSON (not orchestrator plan format)
        const { aiProvider } = await import('../ai/ai.provider.js');
        aiProvider.reason.mockResolvedValue('{"result": "test output", "summary": "test summary", "confidence": 95}');

        const names = Object.keys(LEGION_DEFINITIONS);
        expect(names.length).toBe(72);

        const results = [];
        const failures = [];

        for (const name of names) {
            const processor = legionFactory.getProcessor(name);
            expect(processor).toBeDefined();

            try {
                const mockJob = {
                    id: `stress-${name}`,
                    data: { task: `Stress test for ${name}`, code: 'function hello() { return 1; }' }
                };

                const result = await processor(mockJob);
                expect(result.agent).toBe(name);
                expect(result.squad).toBeDefined();
                results.push({ name, squad: result.squad, status: 'ok' });
            } catch (err) {
                failures.push({ name, error: err.message });
            }
        }

        // Report
        expect(results.length).toBe(72);
        expect(failures.length).toBe(0);
    });
});

// ═════════════════════════════════════════════════
// TEST 6: CAPABILITY-BASED ROUTING
// ═════════════════════════════════════════════════

describe('Capability-Based Routing — Deep Discovery', () => {
    it('should find agents from BOTH Armada and Legion for shared capabilities', async () => {
        // "react" — found in Armada (typescript agent) and Legion (reactBuilder)
        const reactAgents = agentRegistry.findByCapability('react');
        expect(reactAgents.length).toBeGreaterThanOrEqual(1);

        // "a11y" — Legion only
        const a11yAgents = agentRegistry.findByCapability('a11y');
        expect(a11yAgents.length).toBeGreaterThanOrEqual(1);

        // "docker" — Legion only
        const dockerAgents = agentRegistry.findByCapability('docker');
        expect(dockerAgents.length).toBeGreaterThanOrEqual(1);

        // "compliance" — Armada only
        const complianceAgents = agentRegistry.findByCapability('compliance');
        expect(complianceAgents.length).toBeGreaterThanOrEqual(1);
    });

    it('should find all agents in every squad via capabilities', async () => {
        // Each squad has unique capabilities — verify at least 1 match per squad
        const squadChecks = {
            frontend: 'css',
            backend: 'jwt',
            database: 'sql',
            testing: 'mocking',
            devops: 'kubernetes',
            security: 'xss',
            quality: 'complexity',
            project: 'sprint-planning'
        };

        for (const [squad, capability] of Object.entries(squadChecks)) {
            const agents = agentRegistry.findByCapability(capability);
            expect(agents.length).toBeGreaterThanOrEqual(1);
        }
    });
});

// ═════════════════════════════════════════════════
// TEST 7: ORCHESTRATOR STATUS & AUDIT TRAIL
// ═════════════════════════════════════════════════

describe('Orchestrator Status & Audit Trail', () => {
    it('should report full system status', () => {
        const status = orchestrator.getStatus();

        expect(status.mode).toBe('AUTONOMOUS');
        // agents can be nested or flat
        const agentCount = status.agents?.count ?? status.agents?.length ?? 0;
        expect(agentCount).toBeGreaterThanOrEqual(115);
        expect(status.recentHistory.length).toBeGreaterThan(0);
    });

    it('should maintain execution history for IRS auditability', () => {
        const status = orchestrator.getStatus();
        const history = status.recentHistory;

        expect(history.length).toBeGreaterThan(0);

        // Each entry should have required audit fields
        const entry = history[0];
        expect(entry.planId).toBeDefined();
        expect(entry.task).toBeDefined();
        expect(entry.mode).toBeDefined();
        expect(entry.timestamp).toBeDefined();
        expect(entry.status).toBeDefined();
    });

    it('should report correct total agent count via registry', () => {
        expect(agentRegistry.count).toBeGreaterThanOrEqual(115);
        expect(agentRegistry.list().length).toBeGreaterThanOrEqual(115);
    });
});
