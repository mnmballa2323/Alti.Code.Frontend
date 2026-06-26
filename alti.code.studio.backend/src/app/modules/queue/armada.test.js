/**
 * Copyright (c) 2024 Inso Code
 *
 * THE ARMADA TEST — 43-Agent Federation Verification
 * Verifies the registry, factory, and orchestrator are fully wired.
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
    on() {
      return this;
    }
    close() {
      return Promise.resolve();
    }
  },
}));

vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => ({
    ping: vi.fn().mockResolvedValue('PONG'),
  })),
}));

vi.mock('../../services/socket.service.js', () => ({
  socketService: { broadcast: vi.fn() },
}));

vi.mock('../googleCloud/pubsub.service.js', () => ({
  pubsubService: {
    publishEvent: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock('../../../shared/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../audit/audit.model.js', () => ({
  AuditLog: {
    create: vi.fn().mockResolvedValue({}),
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
    }),
  },
}));

// Mock QueueService
let jobCounter = 0;
vi.mock('../queue/queue.service.js', () => ({
  queueService: {
    isInitialized: true,
    queues: {},
    init: vi.fn(),
    addJob: vi.fn().mockImplementation(async (queueName, data) => {
      jobCounter++;
      return { id: `stress-job-${jobCounter}`, name: queueName, data };
    }),
  },
}));

vi.mock('../ai/ai.provider.js', () => ({
  aiProvider: {
    reason: vi.fn().mockResolvedValue('[]'),
    generate: vi.fn().mockResolvedValue('{}'),
    getInfo: vi
      .fn()
      .mockReturnValue({ provider: 'gemini', model: 'gemini-3.1-flash' }),
    switchTo: vi.fn(),
  },
}));

// ---- TESTS ----

describe('The Armada — 43-Agent Registry', () => {
  it('should have 43+ agents registered with capabilities', async () => {
    const { agentRegistry } = await import('../agents/agent.registry.js');

    expect(agentRegistry.count).toBeGreaterThanOrEqual(43);

    // Verify all 8 tiers
    const agents = agentRegistry.list();
    const names = agents.map(a => a.name);

    // Core Federation (10)
    expect(names).toContain('audit');
    expect(names).toContain('git');
    expect(names).toContain('refactor');
    expect(names).toContain('security');
    expect(names).toContain('devops');
    expect(names).toContain('qa');
    expect(names).toContain('monitoring');
    expect(names).toContain('iac');
    expect(names).toContain('cicd');
    expect(names).toContain('notification');

    // Tier 1: Code Intelligence
    expect(names).toContain('codeReview');
    expect(names).toContain('documentation');
    expect(names).toContain('debug');
    expect(names).toContain('architecture');

    // Tier 2: Data & Infrastructure
    expect(names).toContain('database');
    expect(names).toContain('migration');
    expect(names).toContain('performance');
    expect(names).toContain('cost');

    // Tier 3: Compliance & Quality
    expect(names).toContain('compliance');
    expect(names).toContain('accessibility');
    expect(names).toContain('dependency');
    expect(names).toContain('e2eTest');

    // Tier 4: Operations
    expect(names).toContain('release');
    expect(names).toContain('incident');
    expect(names).toContain('analytics');
    expect(names).toContain('knowledge');

    // Tier 5: Growth
    expect(names).toContain('seo');
    expect(names).toContain('translation');
    expect(names).toContain('onboarding');
    expect(names).toContain('apiDesign');

    // Tier 6: Cloud
    expect(names).toContain('gcp');

    // Tier 7: Language
    expect(names).toContain('python');
    expect(names).toContain('typescript');
    expect(names).toContain('rust');
    expect(names).toContain('golang');

    // Tier 8: Micro-Agents
    expect(names).toContain('linter');
    expect(names).toContain('formatter');
    expect(names).toContain('envValidator');
    expect(names).toContain('secretScanner');
    expect(names).toContain('deadCode');
    expect(names).toContain('importSorter');

    // Every agent must have capabilities
    for (const agent of agents) {
      expect(agent.capabilities).toBeDefined();
      expect(agent.capabilities.length).toBeGreaterThan(0);
    }
  });
});

describe('Orchestrator v2 — Multi-Agent Modes', () => {
  it('should support AUTONOMOUS, SUPERVISED, and HYBRID modes', async () => {
    const { orchestrator } = await import('../agents/orchestrator.js');

    expect(orchestrator.mode).toBe('AUTONOMOUS');

    orchestrator.setMode('SUPERVISED');
    expect(orchestrator.mode).toBe('SUPERVISED');

    orchestrator.setMode('HYBRID');
    expect(orchestrator.mode).toBe('HYBRID');

    orchestrator.setMode('AUTONOMOUS');
    expect(orchestrator.mode).toBe('AUTONOMOUS');

    expect(() => orchestrator.setMode('INVALID')).toThrow();
  });
});

describe('Capability-Based Agent Discovery', () => {
  it('should find agents by capability', async () => {
    const { agentRegistry } = await import('../agents/agent.registry.js');

    const securityAgents = agentRegistry.findByCapability('security');
    expect(securityAgents.length).toBeGreaterThan(0);

    const complianceAgents = agentRegistry.findByCapability('compliance');
    expect(complianceAgents.length).toBeGreaterThan(0);

    const pythonAgents = agentRegistry.findByCapability('python');
    expect(pythonAgents.length).toBeGreaterThan(0);

    const gcpAgents = agentRegistry.findByCapability('gcp');
    expect(gcpAgents.length).toBeGreaterThan(0);
  });
});
