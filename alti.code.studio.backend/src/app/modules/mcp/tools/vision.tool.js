/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { visionService } from '../../senses/vision.service.js';

export const visionTool = {
    name: "analyze_image",
    description: "Analyze an image (screenshot or diagram) using computer vision.",
    inputSchema: {
        type: "object",
        properties: {
            imageBase64: {
                type: "string",
                description: "Base64 encoded image data (PNG/JPEG)"
            },
            prompt: {
                type: "string",
                description: "What to look for in the image"
            }
        },
        required: ["imageBase64"]
    },
    handler: async (args) => {
        const { imageBase64, prompt } = args;
        const description = await visionService.analyze(imageBase64, prompt);

        return {
            content: [
                {
                    type: "text",
                    text: description
                }
            ]
        };
    }
};
