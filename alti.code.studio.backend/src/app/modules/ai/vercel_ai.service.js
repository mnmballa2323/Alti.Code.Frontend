/**
 * Copyright (c) 2026 Inso Code
 *
 * vercel_ai.service.js — Google Cloud Vertex AI Wrapper.
 * Provides unified, type-safe LLM text and structured object generations.
 */

import { executeVertexInference } from './vertex_ai.helper.js';

export class VercelAiService {
  /**
   * Generate plain text response using Google Cloud Vertex AI.
   * @param {string} prompt
   * @param {object} options
   * @returns {Promise<{text: string, usage: object}>}
   */
  static async generate(prompt, options = {}) {
    if (process.env.NODE_ENV === 'test') {
      return {
        text: `[Vercel AI Mock] Response for prompt: "${prompt.substring(0, 40)}"`,
        usage: { promptTokens: 10, completionTokens: 20 },
      };
    }

    const model = options.model || 'gemini-3.5-flash';
    const result = await executeVertexInference(prompt, model, options);
    
    return {
      text: result.text,
      usage: result.usage,
    };
  }

  /**
   * Generate structured object adhering to a Zod schema using Google Cloud Vertex AI.
   * @param {string} prompt
   * @param {object} schema - Zod schema
   * @param {object} options
   * @returns {Promise<{object: object, usage: object}>}
   */
  static async generateStructured(prompt, schema, options = {}) {
    if (process.env.NODE_ENV === 'test') {
      return {
        object: options.mockData || {},
        usage: { promptTokens: 10, completionTokens: 20 },
      };
    }

    const model = options.model || 'gemini-3.5-flash';
    const result = await executeVertexInference(prompt, model, {
      ...options,
      responseMimeType: 'application/json',
    });

    const parsed = JSON.parse(result.text);
    let validated = parsed;
    if (schema && typeof schema.parse === 'function') {
      validated = schema.parse(parsed);
    }

    return {
      object: validated,
      usage: result.usage,
    };
  }
}

export default VercelAiService;
