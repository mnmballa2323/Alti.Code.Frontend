/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Orchestrator } from '../../agents/orchestrator.agent.js';

export const swarmTool = {
    name: "run_swarm",
    description: "Orchestrate a complex multi-step goal using specialized agents (Composer, Surgeon, Deployer, Schema).",
    inputSchema: {
        type: "object",
        properties: {
            goal: {
                type: "string",
                description: "The high-level goal (e.g., 'Create a React app, test it, and deploy')."
            }
        },
        required: ["goal"]
    },
    handler: async (args) => {
        const { goal, userId, sessionId } = args;
        
        try {
            // Use the new GPT-5.5 Tri-Cloud Hive Orchestrator
            const { HiveOrchestratorService } = await import('../../swarm/hiveOrchestrator.service.js');
            const result = await HiveOrchestratorService.executeSwarm(userId || 'system', sessionId || 'mcp-tool', goal);

            return {
                content: [
                    {
                        type: "text",
                        text: `🐝 Alti Hive Swarm Mission Complete!\n\n${result}`
                    }
                ]
            };
        } catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `❌ Alti Hive Swarm Mission Failed.\n\nError: ${error.message}`
                    }
                ]
            };
        }
    }
};
