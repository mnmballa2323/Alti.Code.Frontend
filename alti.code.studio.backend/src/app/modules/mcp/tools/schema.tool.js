/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { schemaAgent } from '../../agents/schema.agent.js';

export const schemaTool = {
    name: "manage_schema",
    description: "Modify the database schema using natural language options. Generates and applies SQL migrations.",
    inputSchema: {
        type: "object",
        properties: {
            description: {
                type: "string",
                description: "Description of the schema change (e.g., 'Add a Users table with email and password')."
            }
        },
        required: ["description"]
    },
    handler: async (args) => {
        const result = await schemaAgent.applyChanges(args.description);

        if (result.status === 'success') {
            return {
                content: [
                    {
                        type: "text",
                        text: `✅ Schema Update Applied!\n\n📂 Migration File: ${result.file}\n\nRunning SQL:\n\`\`\`sql\n${result.sql}\n\`\`\``
                    }
                ]
            };
        } else {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `❌ Schema Update Failed.\n\nError: ${result.error}`
                    }
                ]
            };
        }
    }
};
