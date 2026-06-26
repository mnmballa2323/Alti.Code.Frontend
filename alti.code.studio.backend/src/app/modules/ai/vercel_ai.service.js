/**
 * Copyright (c) 2026 Inso Code
 *
 * vercel_ai.service.js — Azure Sovereign Vercel AI SDK Service Wrapper.
 * Provides unified, type-safe LLM text and structured object generations.
 */

import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import config from '../../../../config/index.js';

export class VercelAiService {
  /**
   * Generate plain text response using Azure OpenAI.
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

    try {
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      const apiKey = process.env.AZURE_OPENAI_KEY;

      if (!endpoint || !apiKey) {
        return {
          text: `[Azure Sovereign Simulation] Simulated response for prompt: "${prompt.substring(0, 40)}..."`,
          usage: { promptTokens: 12, completionTokens: 24 },
        };
      }

      const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
      const modelName = options.model || 'gpt-4o';
      const response = await client.getChatCompletions(modelName, [
        { role: 'user', content: prompt },
      ]);

      const text = response.choices[0].message.content;
      const usage = {
        promptTokens:
          response.usage?.promptTokens ||
          Math.max(1, Math.ceil(prompt.length / 4)),
        completionTokens:
          response.usage?.completionTokens ||
          Math.max(1, Math.ceil(text.length / 4)),
      };

      return { text, usage };
    } catch (error) {
      console.error('VercelAiService.generate failed:', error);
      return {
        text: `[Vercel AI Error Fallback] ${error.message}`,
        usage: { promptTokens: 0, completionTokens: 0 },
      };
    }
  }

  /**
   * Generate structured object adhering to a Zod schema using Azure OpenAI.
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

    try {
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      const apiKey = process.env.AZURE_OPENAI_KEY;

      if (!endpoint || !apiKey) {
        return {
          object: options.mockData || {},
          usage: { promptTokens: 12, completionTokens: 24 },
        };
      }

      const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
      const modelName = options.model || 'gpt-4o';

      const systemPrompt = `You must return your response as a valid JSON object matching this schema. Prompt: ${prompt}`;

      const response = await client.getChatCompletions(
        modelName,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        {
          responseFormat: { type: 'json_object' },
        },
      );

      const text = response.choices[0].message.content;
      const parsed = JSON.parse(text);

      let validated = parsed;
      if (schema && typeof schema.parse === 'function') {
        validated = schema.parse(parsed);
      }

      const usage = {
        promptTokens:
          response.usage?.promptTokens ||
          Math.max(1, Math.ceil(prompt.length / 4)),
        completionTokens:
          response.usage?.completionTokens ||
          Math.max(1, Math.ceil(text.length / 4)),
      };

      return { object: validated, usage };
    } catch (error) {
      console.error('VercelAiService.generateStructured failed:', error);
      throw error;
    }
  }
}

export default VercelAiService;
