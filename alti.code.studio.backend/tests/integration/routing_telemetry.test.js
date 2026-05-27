import { test, expect } from 'vitest';
import { agentIndex } from '../../src/app/modules/agents/agent.index.js';
import { clawCodeAgent } from '../../src/app/modules/agents/claw_code.agent.js';

test('CapabilityRouter O(1) Tokenization performance and fuzzy matching', () => {
    const query = "Deploy a kubernetes cluster with argocd";

    const startMs = Date.now();
    const ranked = agentIndex.search(query);
    const ms = Date.now() - startMs;

    // Performance: Must score 20,000+ agents in under 150ms (usually under 2ms)
    expect(ms).toBeLessThan(150);

    // Should successfully match the correct agent
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].score).toBeGreaterThan(0);
});

test('BaseSpecialistAgent unified telemetry wrapper output', async () => {
    const query = "Write a basic hello world in python";

    // Consult the agent
    const result = await clawCodeAgent.consult(query, []);

    // Validate structural schema of the returned object
    expect(result).toHaveProperty('agent');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('execution_time_ms');

    // Type checking
    expect(typeof result.agent).toBe('string');
    expect(typeof result.content).toBe('string');
    expect(['code_block', 'text']).toContain(result.type);
    expect(typeof result.execution_time_ms).toBe('number');
});

