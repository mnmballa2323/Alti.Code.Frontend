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
 * Enforces security rules by disallowing direct OpenAI and Anthropic SDK endpoints,
 * and includes transient error retries, DLP scrubbing, and context compression.
 */

import { executeVertexInference } from '../../modules/ai/vertex_ai.helper.js';
import { AzureOpenAI } from 'openai';
// Removed Bedrock import
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

/**
 * Sanitizes errors to prevent key leakage in stack traces
 */
export const sanitizeError = message => {
  if (!message) return 'An error occurred during model inference.';
  return message
    .replace(/AIzaSy[A-Za-z0-9_-]{20,40}/g, 'AIzaSy...[MASKED]')
    .replace(/sk-[A-Za-z0-9]{32,}/g, 'sk-...[MASKED]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [MASKED]')
    .replace(/api-key['"]?\s*:\s*['"]?[A-Za-z0-9_-]+/gi, 'api-key: [MASKED]');
};

/**
 * Retries a function on transient errors
 */
export const callWithRetry = async (fn, maxRetries = 2, delay = 1000) => {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const status = err.status || err.statusCode || 0;
      const isTransient =
        status === 429 ||
        status >= 500 ||
        err.message?.includes('timeout') ||
        err.message?.includes('ETIMEDOUT');
      if (attempt > maxRetries || !isTransient) {
        throw err;
      }
      logger.warn(
        `⚠️ [Model Gateway] Transient error encountered (attempt ${attempt}/${maxRetries}). Retrying in ${delay * attempt}ms...`,
      );
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

/**
 * Word-to-token fallback estimator: (prompt.length + response.length) / 4
 */
export const estimateTokens = (prompt, response) => {
  const promptLen = prompt ? prompt.length : 0;
  const respLen = response ? response.length : 0;
  return Math.ceil((promptLen + respLen) / 4);
};

// Keep track of token usage per product in memory
export const productTokenCounts = {};

// Keep track of regional metrics in memory
export const regionalMetrics = {};

export const BILLING_LIMITS = {
  'product-healthcare': 100000,
  'product-finance': 150000,
  'product-pharma': 80000,
  'product-default': 50000,
};

export const getProductTokenUsage = productId =>
  productTokenCounts[productId] || 0;
export const getRegionalMetrics = region =>
  regionalMetrics[region] || {
    totalLatencyMs: 0,
    totalCalls: 0,
    totalTokens: 0,
  };
export const resetProductTokenCounts = () => {
  for (const key in productTokenCounts) delete productTokenCounts[key];
};
export const resetRegionalMetrics = () => {
  for (const key in regionalMetrics) delete regionalMetrics[key];
};

const getProviderRegion = provider => {
  if (provider === 'gcp') {
    return config.gcp?.location || 'us-central1';
  }
  if (provider === 'azure') {
    return 'azure-eastus';
  }
  return 'unknown';
};

/**
 * Routes text completion request to authorized GCP Vertex AI endpoint (internally routed to Azure OpenAI)
 * @param {object} params
 * @param {string} params.provider - 'gcp'
 * @param {string} params.model - Specific model ID
 * @param {string} params.prompt - Input prompt
 * @param {number} [params.temperature] - Generation temperature
 * @param {boolean} [params.scrubPrompt] - Enable Google Cloud DLP redaction
 * @returns {Promise<string>} Completion text response
 */
export const routePlatformCompletion = async ({
  provider,
  model,
  prompt,
  temperature = 0.5,
  scrubPrompt = false,
  productId = null,
  tenantId = null,
}) => {
  // Security validation: Only allow GCP Vertex AI and Azure Foundry publicly
  if (provider !== 'gcp' && provider !== 'azure') {
    logger.error(
      `🚫 [Model Gateway] Blocked connection attempt to unauthorized provider: ${provider}`,
    );
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Security Policy Exception: Direct API connections to non-GCP/Azure providers are blocked. Please use GCP Vertex AI or Azure Foundry.',
    );
  }

  // Billing tier limit check
  if (productId) {
    const limit =
      BILLING_LIMITS[productId] || BILLING_LIMITS['product-default'];
    const currentUsage = productTokenCounts[productId] || 0;
    if (currentUsage >= limit) {
      logger.error(
        `🚫 [Model Gateway] Token limit exceeded for product: ${productId} (${currentUsage} >= ${limit})`,
      );
      throw new ApiError(
        httpStatus.TOO_MANY_REQUESTS,
        `Billing tier token limit exceeded for product "${productId}". Limit: ${limit}, Current: ${currentUsage}.`,
      );
    }
  }

  let activePrompt = prompt;

  // 1. Google Cloud DLP Redaction
  if (scrubPrompt) {
    try {
      logger.info(
        '🛡️ [Model Gateway] Redacting sensitive content via Google Cloud DLP...',
      );
      const { GoogleDlpService } =
        await import('../../modules/ai/gcpDlp.service.js');
      activePrompt = await GoogleDlpService.redactText(activePrompt);
    } catch (err) {
      logger.warn(
        `⚠️ [Model Gateway] Google Cloud DLP failed, falling back to original prompt: ${err.message}`,
      );
    }
  }

  let activeProvider = provider.toLowerCase();
  let activeModel = model;

  // GCP requests are permitted to run natively via Vertex AI
  if (activeProvider === 'gcp') {
    logger.info(
      `🌐 [Model Gateway] Using Native Vertex AI for ${provider} request.\n`,
    );
  }

  logger.info(
    `🔀 [Model Gateway] Routing completion request | Provider: ${activeProvider} | Model: ${activeModel}`,
  );

  const startTime = Date.now();
  let success = true;
  let errorMsg = null;
  let tokensConsumed = 0;
  let resultText = '';

  try {
    switch (activeProvider) {
      case 'gcp': {
        const response = await executeVertexInference(
          activePrompt,
          activeModel,
          {
            temperature,
          },
        );

        if (response?.usage) {
          tokensConsumed =
            (response.usage.promptTokens || 0) +
            (response.usage.completionTokens || 0);
        }

        resultText = response.text || '';
        break;
      }

      case 'azure': {
        const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
        const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;

        if (!azureApiKey || !azureEndpoint) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Azure OpenAI Foundry API credentials/endpoint are missing.',
          );
        }

        // Initialize Azure OpenAI client from openai
        const client = new AzureOpenAI({
          endpoint: azureEndpoint,
          apiKey: azureApiKey,
          apiVersion: '2024-02-15-preview',
        });

        const deploymentName = activeModel.replace(/^azure\//, '');
        const response = await callWithRetry(() =>
          client.chat.completions.create({
            model: deploymentName,
            messages: [{ role: 'user', content: activePrompt }],
            temperature,
          }),
        );

        if (response?.usage) {
          tokensConsumed = response.usage.total_tokens || 0;
        }

        resultText = response.choices[0].message.content;
        break;
      }

      default:
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Unsupported Cloud provider: "${provider}". Must be: gcp, azure.`,
        );
    }

    if (!tokensConsumed) {
      tokensConsumed = estimateTokens(activePrompt, resultText);
    }

    return resultText;
  } catch (error) {
    success = false;
    errorMsg = error.message;
    if (error instanceof ApiError) throw error;

    const sanitizedMsg = sanitizeError(error.message);
    logger.error(`❌ [Model Gateway] Inference failed: ${sanitizedMsg}`);
    throw new ApiError(
      httpStatus.BAD_GATEWAY,
      `Model Gateway Routing Failure: ${sanitizedMsg}`,
    );
  } finally {
    const latencyMs = Date.now() - startTime;

    // Accumulate in-memory metrics
    if (productId && success) {
      productTokenCounts[productId] =
        (productTokenCounts[productId] || 0) + tokensConsumed;
    }

    const region = provider ? getProviderRegion(provider) : 'unknown';
    if (region !== 'unknown') {
      if (!regionalMetrics[region]) {
        regionalMetrics[region] = {
          totalLatencyMs: 0,
          totalCalls: 0,
          totalTokens: 0,
        };
      }
      regionalMetrics[region].totalLatencyMs += latencyMs;
      regionalMetrics[region].totalCalls += 1;
      regionalMetrics[region].totalTokens += tokensConsumed;
    }

    try {
      const { telemetryService } =
        await import('../../modules/telemetry/telemetry.service.js');
      if (telemetryService) {
        telemetryService.recordLlmCall({
          model,
          latencyMs,
          success,
          error: errorMsg,
          tokens: tokensConsumed,
          productId,
          tenantId,
        });
      }
    } catch (telemetryErr) {
      // Gracefully handle telemetry imports or recording issues (e.g. in standalone platform package tests)
      logger.warn(
        `⚠️ [Model Gateway] Telemetry tracking failed (non-blocking): ${telemetryErr.message}`,
      );
    }
  }
};

export const modelGateway = {
  routePlatformCompletion,
  callWithRetry,
  sanitizeError,
  estimateTokens,
  getProductTokenUsage,
  getRegionalMetrics,
  resetProductTokenCounts,
  resetRegionalMetrics,
  BILLING_LIMITS,
  productTokenCounts,
  regionalMetrics,
};
