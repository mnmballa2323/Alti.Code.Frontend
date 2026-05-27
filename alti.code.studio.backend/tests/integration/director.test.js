global.self = global;
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { directorAgent } from '../../src/app/modules/director/director.agent.js';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { aiProvider } from '../../src/app/modules/ai/ai.provider.js';

vi.mock('../../src/app/modules/ai/ai.provider.js', () => ({
    aiProvider: {
        reason: vi.fn().mockImplementation(async (prompt) => {
            if (prompt.includes('Return a JSON array of tasks')) {
                return `[
                    { "agent": "The Architect", "task": "Design infrastructure" },
                    { "agent": "NonExistentSpecialist", "task": "Emulate fallback execution" }
                ]`;
            }
            return 'Mocked AI Provider Response';
        })
    }
}));

// Setup some mock agent registry instances
const mockArchitect = {
    name: 'architect',
    description: 'Mock Architect Specialist',
    consult: vi.fn().mockResolvedValue('Mock Architect consulted successfully.')
};

describe('Director Swarm Orchestrator Integration Tests', () => {
    beforeAll(() => {
        // Register mock architect instance
        agentRegistry.register({
            name: 'architect',
            description: 'Mock Architect Specialist',
            queue: 'architect-queue',
            capabilities: ['architecture'],
            version: '1.0.0',
            instance: mockArchitect
        });
    });

    it('should decompose a goal and execute a mission using both real registry specialists and fallback emulation', async () => {
        const goal = 'Build a microservice with secure networking';
        const startResult = await directorAgent.startMission(goal);
        
        expect(startResult.status).toBe('started');
        expect(startResult.goal).toBe(goal);
        
        // Wait a short time for the async executeMission loop to complete
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const status = directorAgent.getMissionStatus(startResult.missionId);
        expect(status.status).toBe('completed');
        expect(status.tasks.length).toBe(2);
        
        // Architect task should use the real registered instance
        const architectTask = status.tasks.find(t => t.agent === 'The Architect');
        expect(architectTask.status).toBe('completed');
        expect(architectTask.result).toBe('Mock Architect consulted successfully.');
        
        // Non-existent task should gracefully fall back to aiProvider.reason
        const fallbackTask = status.tasks.find(t => t.agent === 'NonExistentSpecialist');
        expect(fallbackTask.status).toBe('completed');
        expect(fallbackTask.result).toBe('Mocked AI Provider Response');
    });
});
