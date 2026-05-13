/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { specKitService } from '../../speckit/speckit.service.js';

export const specKitTool = {
    name: "speckit_specify",
    description: "Create a technical specification using SpecKit (Spec-Driven Development).",
    inputSchema: {
        type: "object",
        properties: {
            request: {
                type: "string",
                description: "The feature request or requirement."
            }
        },
        required: ["request"]
    },
    handler: async (args) => {
        const result = await specKitService.createSpec(args.request);
        return {
            content: [
                {
                    type: "text",
                    text: `✅ Specification Created: ${result.path}\n\n${result.content.substring(0, 500)}...`
                }
            ]
        };
    }
};
