/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliService } from '../../geminiCli/geminiCli.service.js';

export const geminiCliTool = {
    name: "run_gemini_cli",
    description: "Executes commands against the local interactive Google Gemini CLI binary. Returns raw stdout. Ensure you have the 'gemini' executable in your system PATH.",
    inputSchema: {
        type: "object",
        properties: {
            command: {
                type: "string",
                description: "The primary CLI command (e.g., 'models', 'chat', 'generate')."
            },
            args: {
                type: "array",
                items: { type: "string" },
                description: "Optional arguments to pass to the CLI."
            }
        },
        required: ["command"]
    },
    handler: async (args) => {
        try {
            const params = args.args || [];
            const output = await GeminiCliService.runGeminiCLI(args.command, params);

            return {
                content: [
                    {
                        type: "text",
                        text: output || "(No output returned from CLI)"
                    }
                ]
            };
        } catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `❌ Gemini CLI Execution Failed: ${error.message}` }]
            };
        }
    }
};
