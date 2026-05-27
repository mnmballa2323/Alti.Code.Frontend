import { test, expect, vi } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { agenticRouter } from '../../src/app/modules/agents/agentic_router.service.js';
import { swarmNexusAgent } from '../../src/app/modules/agents/swarm_nexus.agent.js';

test('AgentRegistry: listAgents and getAllAgents alias compatibility', () => {
    // 1. listAgents must return an array
    const agentsList = agentRegistry.listAgents();
    expect(Array.isArray(agentsList)).toBe(true);
    expect(agentsList.length).toBeGreaterThan(0);

    // 2. getAllAgents must return an array
    const allAgentsList = agentRegistry.getAllAgents();
    expect(Array.isArray(allAgentsList)).toBe(true);
    expect(allAgentsList.length).toBe(agentsList.length);

    // Verify presence of our registered agents
    const names = agentsList.map(a => a.name);
    expect(names).toContain('hermes_agent');
    expect(names).toContain('openclaw_agent');
});

test('AgenticRouter: routePrompt dynamic orchestrator planning & safety gate validation', async () => {
    // Mock the generative model to simulate router response
    const mockPlan = {
        strategy: 'Test routing strategy',
        sequence: [
            { agentId: 'hermes_agent', task: 'Run hermes CLI' },
            { agentId: 'openclaw_agent', task: 'Physical browser session' }
        ],
        priority: 'HIGH'
    };

    vi.spyOn(agenticRouter.model, 'generateContent').mockResolvedValue({
        response: {
            text: () => JSON.stringify(mockPlan)
        }
    });

    const plan = await agenticRouter.routePrompt("Run local browser test on target code");
    
    // Safety check: Router must enforce the 'auditor' safety gate
    const sequenceIds = plan.sequence.map(s => s.agentId);
    expect(sequenceIds).toContain('hermes_agent');
    expect(sequenceIds).toContain('openclaw_agent');
    expect(sequenceIds).toContain('auditor'); // Auditor safety gate auto-appended
});

test('AgenticRouter: Garry Tan gstack Swarm team routing', async () => {
    // Mock SwarmNexus routeGstackTeam
    vi.spyOn(swarmNexusAgent, 'routeGstackTeam').mockResolvedValue('Simulated YC Team Spec');

    const plan = await agenticRouter.routePrompt("Design a new complex gstack billing system");

    expect(plan.strategy).toBe('Garry Tan gstack Virtual Engineering Swarm Layout');
    const sequenceIds = plan.sequence.map(s => s.agentId);
    expect(sequenceIds).toContain('yc_pm');
    expect(sequenceIds).toContain('karpathy_sentinel');
    expect(sequenceIds).toContain('jules');
    expect(sequenceIds).toContain('yc_qa');
    expect(sequenceIds).toContain('yc_security');
    expect(sequenceIds).toContain('yc_ceo');
    expect(plan.gstackRoadmap).toBe('Simulated YC Team Spec');
});

test('AgenticRouter: Proactive Andrej Karpathy compliance self-correction loop', async () => {
    // Mock compliance audit report to return 'NON-COMPLIANT' on first call
    vi.spyOn(swarmNexusAgent, 'auditKarpathyRules').mockResolvedValueOnce('NON-COMPLIANT - Over-engineered redundant helpers.');
    // And pass on the second attempt
    vi.spyOn(swarmNexusAgent, 'auditKarpathyRules').mockResolvedValueOnce('COMPLIANT');

    // Mock initial LLM plan response (over-engineered)
    const initialMockPlan = {
        strategy: 'Over-engineered strategy',
        sequence: [{ agentId: 'jules', task: 'Direct execution of prompt' }],
        priority: 'HIGH'
    };

    // Mock corrected LLM plan response
    const correctedMockPlan = {
        strategy: 'Surgical simple strategy',
        sequence: [{ agentId: 'jules', task: 'Direct execution of prompt' }],
        priority: 'HIGH'
    };

    const generateSpy = vi.spyOn(agenticRouter.model, 'generateContent');
    generateSpy.mockClear();
    generateSpy.mockResolvedValueOnce({
        response: { text: () => JSON.stringify(initialMockPlan) }
    }).mockResolvedValueOnce({
        response: { text: () => JSON.stringify(correctedMockPlan) }
    });

    const plan = await agenticRouter.routePrompt("Refactor billing controller");

    // The router should invoke the compliance gate, detect non-compliance, trigger a correction loop,
    // and successfully return the compliant plan with karpathy_refactor prepended.
    expect(plan.strategy).toBe('Surgical simple strategy');
    const sequenceIds = plan.sequence.map(s => s.agentId);
    expect(sequenceIds).toContain('karpathy_refactor');
    expect(generateSpy).toHaveBeenCalledTimes(2);
});

