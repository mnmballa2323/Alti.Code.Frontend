import { test, expect, vi } from 'vitest';
import { swarmNexusAgent } from '../../src/app/modules/agents/swarm_nexus.agent.js';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';

test('SwarmNexusAgent: Identity and Preamble Integrity', () => {
    expect(swarmNexusAgent.name).toBe('swarm_nexus_agent');
    expect(swarmNexusAgent.description).toContain('swarm coordinator and compliance auditor');
    expect(swarmNexusAgent.preamble).toContain('Andrej Karpathy Agent Rules');
    expect(swarmNexusAgent.preamble).toContain('Garry Tan gstack');
});

test('SwarmNexusAgent: Karpathy Compliance Audit', async () => {
    vi.spyOn(swarmNexusAgent.model, 'generateContent').mockResolvedValue({
        response: {
            text: () => 'COMPLIANT - Symmetrical coding and no over-engineering.'
        }
    });

    const res = await swarmNexusAgent.consult('Evaluate compliance under Karpathy rules: build single line patch.');
    expect(res.content).toContain('COMPLIANT');
});

test('SwarmNexusAgent: gstack Virtual Team Routing', async () => {
    vi.spyOn(swarmNexusAgent.model, 'generateContent').mockResolvedValue({
        response: {
            text: () => 'Role Assign: PM -> Architect -> QA.'
        }
    });

    const res = await swarmNexusAgent.consult('Assemble a virtual gstack team for a payment database.');
    expect(res.content).toContain('PM -> Architect');
});

test('SwarmNexusAgent: Persistent Memory & CodeGraph Mappings (Simulated)', async () => {
    const memRes = await swarmNexusAgent.consult('Query persistent memory vector cache.');
    expect(memRes.content).toContain('agentmemory persistent vector index hit');

    const graphRes = await swarmNexusAgent.consult('Traverse CodeGraph index for LicenseService.');
    expect(graphRes.content).toContain('CodeGraph Semantic Symbol Index Traverse Complete');
});

test('SwarmNexusAgent: Ruflo Hive-Mind Swarm Orchestration', async () => {
    vi.spyOn(swarmNexusAgent.model, 'generateContent').mockResolvedValue({
        response: {
            text: () => 'Hive-Mind swarming plan generated.'
        }
    });

    const res = await swarmNexusAgent.consult('Delegate swarm to build code parser.');
    expect(res.content).toContain('Hive-Mind swarming');
});
