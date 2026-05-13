/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { qaService } from '../../qa/qa.service.js';

export const generateTestsTool = {
    name: "generate_tests",
    description: "Generate a Vitest unit test suite for a given file.",
    inputSchema: {
        type: "object",
        properties: {
            filePath: {
                type: "string",
                description: "Absolute path to the source file to test"
            }
        },
        required: ["filePath"]
    },
    handler: async (args) => {
        const { filePath } = args;
        const result = await qaService.generateSpec(filePath);

        if (result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Successfully generated test suite at: ${result.testFile}\n\nPreview:\n${result.content.substring(0, 200)}...`
                    }
                ]
            };
        } else {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to generate tests: ${result.error}`
                    }
                ],
                isError: true
            };
        }
    }
};
