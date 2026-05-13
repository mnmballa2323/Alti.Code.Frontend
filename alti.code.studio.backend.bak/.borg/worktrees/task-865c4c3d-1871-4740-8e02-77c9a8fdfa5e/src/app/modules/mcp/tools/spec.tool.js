/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { specAgent } from '../../agents/spec.agent.js';

export const specTool = {
    name: "draft_spec",
    description: "Generate a detailed technical specification (markdown) for a feature request.",
    inputSchema: {
        type: "object",
        properties: {
            request: {
                type: "string",
                description: "Description of the feature to plan."
            }
        },
        required: ["request"]
    },
    handler: async (args) => {
        const { request } = args;
        const content = await specAgent.draft(request);

        return {
            content: [
                {
                    type: "text",
                    text: content
                }
            ]
        };
    }
};
