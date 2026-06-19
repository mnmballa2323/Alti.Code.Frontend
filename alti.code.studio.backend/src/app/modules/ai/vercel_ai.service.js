/**
 * Copyright (c) 2026 Inso Code
 *
 * vercel_ai.service.js — Vercel AI SDK Service Wrapper.
 * Provides unified, type-safe LLM text and structured object generations.
 */

import { vertex } from '@ai-sdk/google-vertex';
import { generateText, generateObject } from 'ai';
import config from '../../../../config/index.js';
import { vertexService } from './vertex.service.js';

export class VercelAiService {
    /**
     * Generate plain text response using Vercel AI SDK.
     * @param {string} prompt 
     * @param {object} options 
     * @returns {Promise<{text: string, usage: object}>}
     */
    static async generate(prompt, options = {}) {
        if (vertexService.isMockMode || process.env.NODE_ENV === 'test') {
            return {
                text: `[Vercel AI Mock] Response for prompt: "${prompt.substring(0, 40)}"`,
                usage: { promptTokens: 10, completionTokens: 20 }
            };
        }

        try {
            const modelName = options.model || config.gcp.model_name || 'gemini-1.5-pro';
            const { text, usage } = await generateText({
                model: vertex(modelName),
                prompt: prompt,
            });

            return { text, usage };
        } catch (error) {
            console.error('VercelAiService.generate failed:', error);
            return {
                text: `[Vercel AI Error Fallback] ${error.message}`,
                usage: { promptTokens: 0, completionTokens: 0 }
            };
        }
    }

    /**
     * Generate structured object adhering to a Zod schema using Vercel AI SDK.
     * @param {string} prompt 
     * @param {object} schema - Zod schema
     * @param {object} options 
     * @returns {Promise<{object: object, usage: object}>}
     */
    static async generateStructured(prompt, schema, options = {}) {
        if (vertexService.isMockMode || process.env.NODE_ENV === 'test') {
            return {
                object: options.mockData || {},
                usage: { promptTokens: 10, completionTokens: 20 }
            };
        }

        try {
            const modelName = options.model || config.gcp.model_name || 'gemini-1.5-pro';
            const { object, usage } = await generateObject({
                model: vertex(modelName),
                schema: schema,
                prompt: prompt,
            });

            return { object, usage };
        } catch (error) {
            console.error('VercelAiService.generateStructured failed:', error);
            throw error;
        }
    }
}

export default VercelAiService;
