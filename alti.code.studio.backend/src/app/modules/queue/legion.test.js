/**
 * Copyright (c) 2024 Inso Code
 *
 * THE LEGION TEST — 115-Agent Federation Verification
 * Verifies: AgentRegistry count, all squads, LegionFactory, and WorkerFactory integration.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// ---- MOCKS ----
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn().mockResolvedValue({ id: 'test-job-1' }),
  })),
  Worker: class MockWorker {
    constructor() {}
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

vi.mock('../ai/ai.provider.js', () => ({
  aiProvider: {
    reason: vi
      .fn()
      .mockResolvedValue(
        '{"result": "test", "summary": "test", "confidence": 100}',
      ),
    generate: vi.fn().mockResolvedValue('{}'),
    getInfo: vi
      .fn()
      .mockReturnValue({ provider: 'gemini', model: 'gemini-3.1-flash' }),
    switchTo: vi.fn(),
  },
}));

// ---- TESTS ----

describe('The Legion — 115+ Agent Registry', () => {
  it('should have 115+ agents registered (43 Armada + 72 Legion)', async () => {
    // Boot the Legion first (registers into agentRegistry)
    const { legionFactory } = await import('../legion/legion.factory.js');
    legionFactory.boot();

    const { agentRegistry } = await import('../agents/agent.registry.js');
    expect(agentRegistry.count).toBeGreaterThanOrEqual(115);
  }, 15000);
});

describe('Legion Squads', () => {
  it('should have 8 squads with correct agent counts', async () => {
    const { legionFactory } = await import('../legion/legion.factory.js');
    const squads = legionFactory.getSquadSummary();

    expect(squads.frontend.length).toBe(12);
    expect(squads.backend.length).toBe(12);
    expect(squads.database.length).toBe(8);
    expect(squads.testing.length).toBe(8);
    expect(squads.devops.length).toBe(10);
    expect(squads.security.length).toBe(8);
    expect(squads.quality.length).toBe(8);
    expect(squads.project.length).toBe(6);
  });

  it('should have correct agents in the Frontend squad', async () => {
    const { legionFactory } = await import('../legion/legion.factory.js');
    const frontend = legionFactory.getSquad('frontend');
    const names = frontend.map(a => a.name);

    expect(names).toContain('cssArchitect');
    expect(names).toContain('reactBuilder');
    expect(names).toContain('stateManager');
    expect(names).toContain('animationEngineer');
    expect(names).toContain('formEngineer');
    expect(names).toContain('bundleOptimizer');
  });

  it('should have correct agents in the Security squad', async () => {
    const { legionFactory } = await import('../legion/legion.factory.js');
    const security = legionFactory.getSquad('security');
    const names = security.map(a => a.name);

    expect(names).toContain('xssScanner');
    expect(names).toContain('sqlInjectionScanner');
    expect(names).toContain('csrfProtector');
    expect(names).toContain('headerHardener');
    expect(names).toContain('penetrationTester');
    expect(names).toContain('encryptionEngineer');
  });
});

describe('Legion Processor Generation', () => {
  it('should generate a working processor for every definition', async () => {
    const { legionFactory } = await import('../legion/legion.factory.js');

    expect(legionFactory.processors.size).toBe(72);

    // Every processor should be a function
    for (const [name, proc] of legionFactory.processors) {
      expect(typeof proc).toBe('function');
    }
  });

  it('should execute a processor and return structured output', async () => {
    const { legionFactory } = await import('../legion/legion.factory.js');
    const processor = legionFactory.getProcessor('unitTestWriter');

    expect(processor).toBeDefined();

    const mockJob = {
      id: 'test-1',
      data: {
        task: 'Write unit tests for UserService',
        code: 'class UserService {}',
      },
    };

    const result = await processor(mockJob);

    expect(result.agent).toBe('unitTestWriter');
    expect(result.squad).toBe('testing');
    expect(result).toHaveProperty('result');
  });
});

describe('Capability-Based Discovery across 115+ Agents', () => {
  it('should find agents by capability across both Armada and Legion', async () => {
    const { agentRegistry } = await import('../agents/agent.registry.js');

    // Armada agents — security-scan + Legion secret-scanning
    const securityAgents = agentRegistry.findByCapability('security-scan');
    expect(securityAgents.length).toBeGreaterThanOrEqual(1);

    // Legion agents — deep specialization
    const dockerAgents = agentRegistry.findByCapability('docker');
    expect(dockerAgents.length).toBeGreaterThanOrEqual(1);

    const reactAgents = agentRegistry.findByCapability('react');
    expect(reactAgents.length).toBeGreaterThanOrEqual(1);

    const kubernetesAgents = agentRegistry.findByCapability('kubernetes');
    expect(kubernetesAgents.length).toBeGreaterThanOrEqual(1);

    const encryptionAgents = agentRegistry.findByCapability('encryption');
    expect(encryptionAgents.length).toBeGreaterThanOrEqual(1);
  });
});
