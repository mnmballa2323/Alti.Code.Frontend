/**
 * Copyright (c) 2024 Alti.Code.Studio
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
        const { goal, userId } = args; // Assuming userId is now part of args
        const result = await Orchestrator.execute(goal, userId);

        if (result.status === 'success') {
            const stepsLog = result.completed_steps.map(s => `✅ Step ${s.id}: Success`).join('\n');
            return {
                content: [
                    {
                        type: "text",
                        text: `🐝 Swarm Mission Complete!\n\n${stepsLog}`
                    }
                ]
            };
        } else {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `❌ Swarm Mission Failed at Step ${result.completed_steps.length + 1}.\n\nError: ${result.error}`
                    }
                ]
            };
        }
    }
};
