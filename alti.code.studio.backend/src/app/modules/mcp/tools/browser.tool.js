/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { browserService } from '../../senses/browser.service.js';

export const browserTool = {
    name: "browse_web",
    description: "Visit a website and extract its content (text and screenshot).",
    inputSchema: {
        type: "object",
        properties: {
            url: {
                type: "string",
                description: "The URL to visit (must start with http/https)"
            }
        },
        required: ["url"]
    },
    handler: async (args) => {
        const { url } = args;
        const result = await browserService.browse(url);

        if (result.error) {
            return {
                content: [{ type: "text", text: `Error browsing ${url}: ${result.error}` }],
                isError: true
            };
        }

        // Return Text + Image
        // MCP supports embedded images
        return {
            content: [
                {
                    type: "text",
                    text: `Title: ${result.title}\nURL: ${result.url}\n\nContent:\n${result.text.substring(0, 2000)}...`
                },
                {
                    type: "image",
                    data: result.screenshot,
                    mimeType: "image/png"
                }
            ]
        };
    }
};
