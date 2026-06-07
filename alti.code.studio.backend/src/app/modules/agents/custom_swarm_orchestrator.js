/**
 * Copyright (c) 2026 Inso Code
 * 
 * Custom Swarm Orchestrator
 * An elegant, production-grade AI Agent Swarm Handoff Engine.
 * 
 * Features:
 * 1. SwarmAgent: Encapsulates instructions, name, and callable functions.
 * 2. SwarmEngine: Orchestration loop that handles tool executions and autonomous Agent Handoffs.
 * 3. Fully compliant with Pure MIT / Pure Apache-2.0 licensing.
 */

import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

/**
 * Representation of a Swarm Agent
 */
export class SwarmAgent {
    /**
     * @param {Object} config
     * @param {string} config.name Name of the agent
     * @param {string|Function} config.instructions System prompt or dynamic function returning instructions
     * @param {Array<Object>} config.functions Array of callable functions/tools
     */
    constructor({ name, instructions, functions = [] }) {
        this.name = name;
        this.instructions = instructions;
        this.functions = functions;
    }

    getInstructions(contextVariables = {}) {
        if (typeof this.instructions === 'function') {
            return this.instructions(contextVariables);
        }
        return this.instructions;
    }
}

/**
 * Stateful Swarm Orchestration Engine
 */
export class SwarmEngine {
    constructor() {
        logger.info('🐝 Custom SwarmEngine initialized. Ready for autonomous multi-agent handoffs.');
    }

    /**
     * Executes the agent loop, handling tools and handoffs.
     * 
     * @param {SwarmAgent} agent The starting agent
     * @param {Array<Object>} messages Conversation messages [{ role: 'user', content: '...' }]
     * @param {Object} contextVariables Key-value state passed to agents and functions
     * @param {number} maxTurns Hard execution limit to prevent infinite loops
     */
    async run(agent, messages, contextVariables = {}, maxTurns = 6) {
        let currentAgent = agent;
        let activeMessages = [...messages];
        let turn = 0;
        const history = [];

        logger.info(`🐝 SwarmEngine: Running session starting with Agent [${currentAgent.name}]`);

        while (turn < maxTurns) {
            turn++;
            logger.info(`🐝 SwarmEngine Turn ${turn}/${maxTurns} - Current Active Agent: [${currentAgent.name}]`);

            // 1. Get current instructions based on context variables
            const instructions = currentAgent.getInstructions(contextVariables);

            // 2. Prepare tools for Gemini in functionDeclarations format
            const geminiTools = currentAgent.functions.map(fn => ({
                name: fn.name,
                description: fn.description || 'Custom agent tool',
                parameters: fn.parameters || { type: 'OBJECT', properties: {} }
            }));

            // Tracks if a handoff to a new agent has been initiated during this turn
            let handoffAgent = null;
            const executedToolsLog = [];

            // 3. Define the tool callback handler
            const onToolCall = async (name, args) => {
                const targetFn = currentAgent.functions.find(fn => fn.name === name);
                if (!targetFn) {
                    throw new Error(`Tool ${name} not found on agent ${currentAgent.name}`);
                }

                logger.info(`🐝 Executing tool [${name}] with args: ${JSON.stringify(args)}`);
                
                // Get or provision the shared session workspace directory
                if (!contextVariables.sessionWorkspacePath) {
                    const { WorkspaceIsolator } = await import('../sandbox/workspace_isolator.js');
                    const isolator = new WorkspaceIsolator();
                    const ws = isolator.provision();
                    contextVariables.sessionWorkspacePath = ws.path;
                    contextVariables.provisionedSessionWorkspaceId = ws.id; // Track for cleanups
                }

                // Execute the agent tool function containerized!
                const { AgentContainerOrchestrator } = await import('../sandbox/agent_container_orchestrator.js');
                const orchestrator = new AgentContainerOrchestrator();
                
                const result = await orchestrator.executeAgentTool(
                    currentAgent.name,
                    name,
                    args,
                    contextVariables,
                    targetFn.execute,
                    contextVariables.sessionWorkspacePath
                );
                
                // Check if the tool returned an Autonomous Handoff!
                if (result && result.isHandoff) {
                    // Dynamic Handoff Mapping: Resolve target agent instance by name dynamically
                    const swarmModule = await import('./software_engineering_swarm.js');
                    let targetAgent = swarmModule[result.handoffAgentName + 'Agent'] || swarmModule[result.handoffAgentName];
                    
                    if (!targetAgent) {
                        // Resolve dynamically from the AgentRegistry / shards
                        try {
                            const { agentRegistry } = await import('./agent.registry.js');
                            const agentDef = agentRegistry.get(result.handoffAgentName);
                            if (agentDef && agentDef.importPath) {
                                // Dynamically load the sharded agent instance
                                const shardModule = await import(agentDef.importPath);
                                const specialistInstance = Object.values(shardModule).find(val => val && val.consult);
                                
                                if (specialistInstance) {
                                    // Wrap the specialistInstance in a SwarmAgent dynamically
                                    targetAgent = new SwarmAgent({
                                        name: specialistInstance.name,
                                        instructions: specialistInstance.preamble,
                                        functions: [
                                            {
                                                name: `consult_${specialistInstance.name.toLowerCase()}`,
                                                description: `Consult the ${specialistInstance.name} specialist with your prompt to run its domain logic.`,
                                                parameters: {
                                                    type: 'OBJECT',
                                                    properties: {
                                                        prompt: { type: 'STRING', description: 'The domain prompt to audit or generate code' }
                                                    },
                                                    required: ['prompt']
                                                },
                                                execute: async (args, context) => {
                                                    const contextBlock = context.generatedCode || context.architectureDesign || '';
                                                    const consultResult = await specialistInstance.consult(args.prompt, [{ content: typeof contextBlock === 'string' ? contextBlock : JSON.stringify(contextBlock) }]);
                                                    return consultResult.content || consultResult;
                                                }
                                            }
                                        ]
                                    });
                                }
                            }
                        } catch (e) {
                            logger.error(`Swarm Engine: Failed to dynamically load agent shard for [${result.handoffAgentName}]: ${e.message}`);
                        }
                    }

                    if (targetAgent) {
                        logger.info(`🔄 Swarm Handoff: [${currentAgent.name}] -> Delegated to [${targetAgent.name}]`);
                        handoffAgent = targetAgent;
                        executedToolsLog.push({ tool: name, handoff: targetAgent.name });
                        return `Handoff successful. You have delegated this task to the specialized [${targetAgent.name}]. Please let them take over and complete the request under their custom instructions.`;
                    }
                }

                // Standard function return
                executedToolsLog.push({ tool: name, result: result });
                return typeof result === 'string' ? result : JSON.stringify(result);
            };

            // 4. Generate next turn response from the LLM
            let responseText = '';
            try {
                // Ensure AI Provider is initialized
                if (!aiProvider.client) {
                    await aiProvider.init();
                }

                // Format context payload for LLM prompt
                const lastMessage = activeMessages[activeMessages.length - 1]?.content || '';
                const systemPromptWithContext = `${instructions}\n\n=== CONTEXT SYSTEM STATE ===\nContext Variables: ${JSON.stringify(contextVariables)}\n============================`;

                responseText = await aiProvider.reason(lastMessage, {
                    systemInstruction: systemPromptWithContext,
                    tools: geminiTools,
                    onToolCall: onToolCall
                });

            } catch (err) {
                logger.error(`🐝 SwarmEngine Turn ${turn} failed: ${err.message}`);
                throw err;
            }

            // 5. Append LLM response to active messages history
            activeMessages.push({ role: 'assistant', content: responseText });
            history.push({
                turn,
                agent: currentAgent.name,
                executedTools: executedToolsLog,
                response: responseText
            });

            // 6. Handle Handoff State Transition
            if (handoffAgent) {
                // Update the current active agent to the new agent!
                currentAgent = handoffAgent;
                // Wait, if we had a handoff, we loop again so the new agent can analyze the state and answer!
                continue;
            }

            // No handoff occurred, loop terminates successfully (task finished by active agent)
            logger.info(`🐝 SwarmEngine: Execution completed successfully in ${turn} turns.`);
            break;
        }

        // Clean up spawned agent containers and session workspaces dynamically
        if (contextVariables.provisionedSessionWorkspaceId) {
            try {
                const { AgentContainerOrchestrator } = await import('../sandbox/agent_container_orchestrator.js');
                const orchestrator = new AgentContainerOrchestrator();
                
                // Dynamically stop all launched agent containers
                if (contextVariables.activeAgentContainers) {
                    for (const agentName of contextVariables.activeAgentContainers) {
                        await orchestrator.stopAgentContainer(agentName);
                    }
                }

                const { WorkspaceIsolator } = await import('../sandbox/workspace_isolator.js');
                const isolator = new WorkspaceIsolator();
                isolator.destroy({
                    id: contextVariables.provisionedSessionWorkspaceId,
                    path: contextVariables.sessionWorkspacePath
                });
            } catch (e) {
                // Ignore cleanup warnings
            }
        }

        if (turn >= maxTurns) {
            logger.warn(`🐝 SwarmEngine: Terminated because turn limit (${maxTurns}) was reached.`);
        }

        return {
            agent: currentAgent,
            messages: activeMessages,
            contextVariables,
            history
        };
    }
}

export const swarmEngine = new SwarmEngine();
export default swarmEngine;
