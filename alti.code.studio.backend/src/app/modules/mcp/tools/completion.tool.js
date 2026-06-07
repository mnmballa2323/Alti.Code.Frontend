/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { completionService } from '../../ai/completion.service.js';

export const completionTool = {
    name: "complete_code",
    description: "Get fast inline code completion (Ghost Text).",
    inputSchema: {
        type: "object",
        properties: {
            prefix: {
                type: "string",
                description: "Code context before the cursor."
            },
            suffix: {
                type: "string",
                description: "Code context after the cursor (optional)."
            }
        },
        required: ["prefix"]
    },
    handler: async (args) => {
        const { prefix, suffix = "" } = args;
        const completion = await completionService.complete(prefix, suffix);

        return {
            content: [
                {
                    type: "text",
                    text: completion
                }
            ]
        };
    }
};
