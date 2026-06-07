/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { autonomicSurgeon } from '../../surgeon/autonomic.service.js';

export const loopTool = {
    name: "auto_fix_loop",
    description: "Run a command (e.g., npm test) and autonomously try to fix errors if it fails, looping up to N times.",
    inputSchema: {
        type: "object",
        properties: {
            command: {
                type: "string",
                description: "The command to run and fix."
            },
            maxRetries: {
                type: "number",
                description: "Maximum number of fix attempts. Default 3."
            }
        },
        required: ["command"]
    },
    handler: async (args) => {
        const result = await autonomicSurgeon.runLoop(args.command, process.cwd(), args.maxRetries || 3);

        if (result.status === 'success') {
            return {
                content: [
                    {
                        type: "text",
                        text: `✅ Command '${args.command}' succeeded after ${result.attempts} attempt(s).\n\nOutput:\n${result.output.substring(0, 500)}...`
                    }
                ]
            };
        } else {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `❌ Command '${args.command}' failed after ${result.attempts} attempts.\n\nError: ${result.error}`
                    }
                ]
            };
        }
    }
};
