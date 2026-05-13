/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { composerAgent } from '../../agents/composer.agent.js';

export const composerTool = {
    name: "compose_feature",
    description: "Write or refactor multiple files to implement a feature (The Composer).",
    inputSchema: {
        type: "object",
        properties: {
            request: {
                type: "string",
                description: "Description of the feature to build or refactor."
            }
        },
        required: ["request"]
    },
    handler: async (args) => {
        const { request } = args;
        const results = await composerAgent.compose(request);

        return {
            content: [
                {
                    type: "text",
                    text: results.join('\n')
                }
            ]
        };
    }
};
