/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class VisionService {

    /**
     * Analyze an image using Vertex AI
     * @param {Buffer|string} image - Buffer or Base64 string
     * @param {string} prompt - Question about the image
     */
    async analyze(image, prompt = "Describe this image.") {
        logger.info('👁️ VisionService: Analyzing image...');



        try {
            // Ensure we have a generative model instance from GeminiAiService



            const model = GeminiAiService.getModel('gemini-1.5-pro');

            const imagePart = {
                inlineData: {
                    data: Buffer.isBuffer(image) ? image.toString('base64') : image,
                    mimeType: 'image/png',
                },
            };

            const textPart = {
                text: prompt,
            };

            const request = {
                contents: [
                    {
                        role: 'user',
                        parts: [textPart, imagePart],
                    },
                ],
            };

            const result = await model.generateContent(request);
            const response = result.response;
            const text = response.candidates[0].content.parts[0].text;

            return text;

        } catch (error) {
            logger.error('👁️ VisionService Error', error);
            logger.warn('Falling back to Mock Vision.');
            return this._mockAnalyze();
        }
    }

    _mockAnalyze() {
        return "[MOCK VISION] I see a screenshot of a web application. It looks like a dashboard with a sidebar.";
    }
}

export const visionService = new VisionService();
