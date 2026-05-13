/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { dependencyAgent } from '../../agents/dependency.agent.js';

export const depTool = {
    name: "audit_deps",
    description: "Scan dependencies for outdated packages and get safety recommendations.",
    inputSchema: {
        type: "object",
        properties: {},
        required: []
    },
    handler: async (args) => {
        const report = await dependencyAgent.audit();
        return {
            content: [
                {
                    type: "text",
                    text: report
                }
            ]
        };
    }
};
