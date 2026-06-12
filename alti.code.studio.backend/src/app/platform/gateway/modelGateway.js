/**
 * Copyright (c) 2026 Inso Code
 * 
 * Shared Model Gateway (Inference Router)
 * 
 * Routes LLM completions exclusively via authorized Tri-Cloud providers:
 * - GCP Vertex AI (for Gemini)
 * - AWS Bedrock (for Claude)
 * - Azure OpenAI Foundry (for GPT)
 * 
 * Enforces security rules by disallowing direct OpenAI and Anthropic SDK endpoints.
 */

import { VertexAI } from '@google-cloud/vertexai';
import { AzureOpenAI } from 'openai';
import { AnthropicBedrock } from '@anthropic-ai/bedrock-sdk';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

/**
 * Sanitizes errors to prevent key leakage in stack traces
 */
export const sanitizeError = (message) => {
  if (!message) return 'An error occurred during model inference.';
  return message
    .replace(/AIzaSy[A-Za-z0-9_-]{20,40}/g, 'AIzaSy...[MASKED]')
    .replace(/sk-[A-Za-z0-9]{32,}/g, 'sk-...[MASKED]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [MASKED]')
    .replace(/api-key['"]?\s*:\s*['"]?[A-Za-z0-9_-]+/gi, 'api-key: [MASKED]');
};

/**
 * Routes text completion request to authorized Tri-Cloud endpoints
 * @param {object} params
 * @param {string} params.provider - 'gcp' | 'aws' | 'azure'
 * @param {string} params.model - Specific model ID
 * @param {string} params.prompt - Input prompt
 * @param {number} [params.temperature] - Generation temperature
 * @returns {Promise<string>} Completion text response
 */
export const routePlatformCompletion = async ({ provider, model, prompt, temperature = 0.5 }) => {
  // Security validation: Block direct Anthropic or OpenAI API configurations
  if (provider === 'openai' || provider === 'anthropic') {
    logger.error(`🚫 [Model Gateway] Blocked direct connection attempt to provider: ${provider}`);
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Security Policy Exception: Direct API connections to OpenAI and Anthropic are blocked. Please use Azure OpenAI Foundry or AWS Bedrock.'
    );
  }

  logger.info(`🔀 [Model Gateway] Routing completion request | Provider: ${provider} | Model: ${model}`);

  try {
    switch (provider.toLowerCase()) {
      case 'gcp': {
        const projectId = config.gcp?.project_id || process.env.GCP_PROJECT_ID;
        if (!projectId) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'GCP Project ID is not configured.');
        }

        const vertex = new VertexAI({
          project: projectId,
          location: config.gcp?.location || 'us-central1'
        });

        const vertexModel = vertex.getGenerativeModel({ 
          model: model.replace(/^google\//, ''),
          generationConfig: { temperature }
        });

        const response = await vertexModel.generateContent(prompt);
        const candidates = response?.response?.candidates;
        if (!candidates || candidates.length === 0) {
          throw new Error('Vertex AI returned empty response candidates.');
        }
        return candidates[0].content.parts[0].text;
      }

      case 'aws': {
        const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
        const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
        const awsRegion = config.aws_region || process.env.AWS_REGION || 'us-east-1';

        if (!awsAccessKey || !awsSecretKey) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'AWS Bedrock access credentials are missing.');
        }

        const bedrock = new AnthropicBedrock({
          awsAccessKey,
          awsSecretKey,
          awsRegion,
          timeout: 25 * 1000
        });

        // Map short names to full Bedrock resource IDs if necessary
        let bedrockModelId = model;
        if (model.startsWith('claude-3-5-sonnet')) {
          bedrockModelId = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
        }

        const response = await bedrock.messages.create({
          model: bedrockModelId,
          max_tokens: 4096,
          temperature,
          messages: [{ role: 'user', content: prompt }]
        });

        return response.content[0].text;
      }

      case 'azure': {
        const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
        const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;

        if (!azureApiKey || !azureEndpoint) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Azure OpenAI Foundry API credentials/endpoint are missing.');
        }

        // Initialize Azure OpenAI client
        const client = new AzureOpenAI({
          apiKey: azureApiKey,
          endpoint: azureEndpoint,
          apiVersion: '2024-02-01'
        });

        const deploymentName = model.replace(/^azure\//, '');
        const response = await client.chat.completions.create({
          model: deploymentName,
          temperature,
          messages: [{ role: 'user', content: prompt }]
        });

        return response.choices[0].message.content;
      }

      default:
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Unsupported Tri-Cloud provider: "${provider}". Must be one of: gcp, aws, azure.`
        );
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    const sanitizedMsg = sanitizeError(error.message);
    logger.error(`❌ [Model Gateway] Inference failed: ${sanitizedMsg}`);
    throw new ApiError(
      httpStatus.BAD_GATEWAY,
      `Model Gateway Routing Failure: ${sanitizedMsg}`
    );
  }
};

export const modelGateway = {
  routePlatformCompletion,
  sanitizeError
};
