/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { projectAgent } from '../../agents/project.agent.js';

export const projectTool = {
    name: "manage_task",
    description: "Manage project tasks (list, add, complete). Acts as the 'Manager' memory.",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["list", "add", "complete"],
                description: "Action to perform"
            },
            payload: {
                type: "string",
                description: "Description for 'add', Task ID for 'complete'"
            }
        },
        required: ["action"]
    },
    handler: async (args) => {
        const { action, payload } = args;

        if (action === "list") {
            const tasks = await projectAgent.getTasks();
            const formatted = tasks.map(t => `[${t.status === 'completed' ? 'x' : ' '}] ${t.description} (ID: ${t.id})`).join('\n');
            return {
                content: [{ type: "text", text: formatted || "No tasks." }]
            };
        }

        if (action === "add") {
            if (!payload) throw new Error("Payload required for 'add'");
            const task = await projectAgent.addTask(payload);
            return {
                content: [{ type: "text", text: `Task added: ${task.description} (ID: ${task.id})` }]
            };
        }

        if (action === "complete") {
            if (!payload) throw new Error("Payload required for 'complete'");
            const success = await projectAgent.completeTask(payload);
            return {
                content: [{ type: "text", text: success ? "Task marked as complete." : "Task not found." }]
            };
        }
    }
};
