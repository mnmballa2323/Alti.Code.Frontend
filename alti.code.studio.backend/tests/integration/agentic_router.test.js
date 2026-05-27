import { test, expect, vi } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { agenticRouter } from '../../src/app/modules/agents/agentic_router.service.js';

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
