/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { contextService } from '../../cortex/context.service.js';

export const contextTool = {
    name: "query_knowledge",
    description: "Ask a question about the codebase. Uses RAG to find relevant code and explain it.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "The question to ask (e.g., 'How does authentication work?')"
            }
        },
        required: ["query"]
    },
    handler: async (args) => {
        const { query } = args;
        const result = await contextService.query(query);

        return {
            content: [
                {
                    type: "text",
                    text: `${result.answer}\n\nReferences:\n${result.references.map(r => `- ${r}`).join('\n')}`
                }
            ]
        };
    }
};
