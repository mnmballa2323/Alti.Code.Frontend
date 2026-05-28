import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SwarmAgent, SwarmEngine } from './custom_swarm_orchestrator.js';
import { agentRegistry } from './agent.registry.js';
import { aiProvider } from '../ai/ai.provider.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

vi.mock('../ai/ai.provider.js', () => {
    return {
        aiProvider: {
            init: vi.fn(),
            reason: vi.fn(),
            client: {}
        }
    };
});

vi.mock('../gemini/gemini.service.js', () => {
    return {
        GeminiAiService: {
            generateContent: vi.fn()
        }
    };
});

vi.mock('../sandbox/agent_container_orchestrator.js', () => {
    return {
        AgentContainerOrchestrator: class {
            async executeAgentTool(agentName, name, args, context, execute, wsPath) {
                return await execute(args, context);
            }
            async stopAgentContainer() {}
        }
    };
});

describe('Swarm Conductor Integration & Dynamic Handoffs', () => {
    let engine;

    beforeEach(() => {
        vi.clearAllMocks();
        engine = new SwarmEngine();
    });

    it('should successfully resolve and dynamically wrap a sharded specialist agent on a tool handoff', async () => {
        // 1. Register a mock sharded specialist agent
        const mockAgentName = 'mock_specialist_agent';
        agentRegistry.register({
            name: mockAgentName,
            importPath: './shards/a/api_contract.agent.js', // Reuse existing valid shard path
            description: 'Mock Specialist for testing dynamic handoffs',
            queue: 'mock-specialist-queue',
            capabilities: ['testing'],
            version: '1.0.0'
        });

        // 2. Setup starting Swarm Agent with a tool that returns a handoff to the sharded specialist
        const startingAgent = new SwarmAgent({
            name: 'StartAgent',
            instructions: 'Start agent instructions',
            functions: [
                {
                    name: 'trigger_delegation',
                    description: 'Delegate to mock specialist',
                    parameters: { type: 'OBJECT', properties: {} },
                    execute: async () => {
                        return {
                            isHandoff: true,
                            handoffAgentName: mockAgentName
                        };
                    }
                }
            ]
        });

        // 3. Mock the AI Provider responses
        // Turn 1: Starting agent calls tool 'trigger_delegation'
        // Turn 2: Delegated specialist agent finishes
        aiProvider.reason
            .mockImplementationOnce(async (prompt, options) => {
                // Execute 'trigger_delegation' tool call
                const toolResult = await options.onToolCall('trigger_delegation', {});
                return `Delegating: ${toolResult}`;
            })
            .mockImplementationOnce(async (prompt, options) => {
                // Executed under the dynamically resolved specialist's wrapper!
                expect(options.systemInstruction).toContain('API CONTRACT & INTEGRATION SDK SPECIALIST');
                const toolResult = await options.onToolCall('consult_api_contract_agent', { prompt: 'Audit specs' });
                return `Specialist executed: ${toolResult}`;
            });

        GeminiAiService.generateContent.mockResolvedValue('Mock Gemini consult response');

        // 4. Run the swarm session
        const messages = [{ role: 'user', content: 'Delegate task' }];
        const context = {};
        const result = await engine.run(startingAgent, messages, context, 3);

        // 5. Assertions
        expect(result.agent.name).toBe('Api_Contract_Agent'); // The dynamically resolved specialist's name
        expect(result.history.length).toBe(2);
        expect(result.history[0].executedTools[0].handoff).toBe('Api_Contract_Agent');
        expect(aiProvider.reason).toHaveBeenCalledTimes(2);
    }, 120000);
});
