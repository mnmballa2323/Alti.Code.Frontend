/**
 * Vertex AI Model Router
 * 
 * Routes requests to optimal Gemini model based on:
 * - Task complexity (simple→Flash Lite, medium→Flash, complex→Pro)
 * - Token budget (route to cheaper model if budget low)
 * - Latency requirements (Flash for real-time, Pro for quality)
 * - Tenant tier (Sovereign gets Pro, Cloud gets Flash)
 * - Context window (large context → Pro)
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { dlpScanner } from './dlpScanner.js';
import { VertexAI } from '@google-cloud/vertexai';

const MODELS = {
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    maxTokens: 1048576,
    outputTokens: 65536,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.005,
    tier: 'pro',
    latencyClass: 'standard',
    capabilities: ['reasoning', 'code', 'multimodal', 'long-context', 'agentic'],
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    maxTokens: 1048576,
    outputTokens: 65536,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    tier: 'flash',
    latencyClass: 'fast',
    capabilities: ['code', 'reasoning', 'multimodal', 'agentic'],
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    maxTokens: 1048576,
    outputTokens: 8192,
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0004,
    tier: 'flash',
    latencyClass: 'fast',
    capabilities: ['code', 'multimodal'],
  },
  'gemini-2.5-flash-lite': {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    maxTokens: 1048576,
    outputTokens: 65536,
    costPer1kInput: 0.000075,
    costPer1kOutput: 0.0003,
    tier: 'lite',
    latencyClass: 'fastest',
    capabilities: ['code', 'reasoning'],
  },
};

const TIER_DEFAULTS = {
  sovereign: 'gemini-2.5-pro',
  dedicated: 'gemini-2.5-flash',
  cloud: 'gemini-2.5-flash',
};

const COMPLEXITY_ROUTES = {
  simple: 'gemini-2.5-flash-lite',   // autocomplete, simple Q&A
  medium: 'gemini-2.5-flash',         // code generation, analysis
  complex: 'gemini-2.5-pro',          // architecture, multi-step reasoning
  critical: 'gemini-2.5-pro',         // security review, production debugging
};

class ModelRouter {
  constructor() {
    this.overrides = new Map(); // tenant-level overrides
  }

  async route(request) {
    if (request.prompt) {
      request.prompt = await dlpScanner.scanAndRedact(request.prompt, request.tenantId || 'platform');
    }

    const {
      complexity = 'medium',
      tenantTier = 'cloud',
      inputTokens = 0,
      requiresCapability = null,
      budgetRemaining = Infinity,
      preferLatency = false,
      preferQuality = false,
    } = request;

    // 1. Check tenant override
    if (request.tenantId && this.overrides.has(request.tenantId)) {
      const override = this.overrides.get(request.tenantId);
      if (MODELS[override]) {
        metrics.incrementCounter('model_route_override', 1, { model: override });
        return { model: MODELS[override], reason: 'tenant_override' };
      }
    }

    // 2. Capability-based routing
    if (requiresCapability === 'long-context' && inputTokens > 100000) {
      return { model: MODELS['gemini-2.5-pro'], reason: 'long_context' };
    }

    // 3. Budget-aware routing
    if (budgetRemaining < 1.0) {
      return { model: MODELS['gemini-2.5-flash-lite'], reason: 'budget_low' };
    }

    // 4. Latency preference
    if (preferLatency) {
      return { model: MODELS['gemini-2.5-flash-lite'], reason: 'latency_preferred' };
    }

    // 5. Quality preference
    if (preferQuality) {
      return { model: MODELS['gemini-2.5-pro'], reason: 'quality_preferred' };
    }

    // 6. Complexity-based routing
    const complexityModel = COMPLEXITY_ROUTES[complexity] || COMPLEXITY_ROUTES.medium;
    
    // 7. Tier upgrade: sovereign always gets at least Flash
    if (tenantTier === 'sovereign' && MODELS[complexityModel].tier === 'lite') {
      return { model: MODELS['gemini-2.5-flash'], reason: 'sovereign_minimum' };
    }

    metrics.incrementCounter('model_route_decisions', 1, { model: complexityModel, reason: 'complexity' });
    return { model: MODELS[complexityModel], reason: 'complexity_route' };
  }

  async executePrompt(request) {
    const { model } = await this.route(request);
    
    // Google Cloud Inference Strategy HARD LAW compliance
    logger.info(`[ModelRouter] Executing via Vertex AI using model ${model.id}`);
    
    try {
      const vertex_ai = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT || 'dummy-project',
        location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
      });
      
      const generativeModel = vertex_ai.preview.getGenerativeModel({
        model: model.id,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: request.temperature || 0.7,
        },
      });

      // If no credentials, we degrade gracefully in dev
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT) {
        logger.warn(`[ModelRouter] No GCP credentials found, returning degraded simulation response.`);
        return {
          content: `[Simulated response from ${model.id}] This is a mocked fallback because no Vertex AI credentials were provided.`,
          model: model.id,
          tokens: { input: 10, output: 20 }
        };
      }

      const chat = generativeModel.startChat({});
      const result = await chat.sendMessage(request.prompt);
      const response = await result.response;
      
      return {
        content: response.candidates[0].content.parts[0].text,
        model: model.id,
        tokens: {
          input: response.usageMetadata?.promptTokenCount || 0,
          output: response.usageMetadata?.candidatesTokenCount || 0
        }
      };
    } catch (err) {
      logger.error(`[ModelRouter] Vertex AI execution failed:`, err.message);
      throw err;
    }
  }

  estimateCost(modelId, inputTokens, outputTokens) {
    const model = MODELS[modelId];
    if (!model) return 0;
    return (inputTokens / 1000) * model.costPer1kInput + (outputTokens / 1000) * model.costPer1kOutput;
  }

  setTenantOverride(tenantId, modelId) {
    if (MODELS[modelId]) {
      this.overrides.set(tenantId, modelId);
      logger.info(`[ModelRouter] Override set: tenant ${tenantId} → ${modelId}`);
    }
  }

  getAvailableModels() {
    return Object.values(MODELS);
  }

  getModelById(id) {
    return MODELS[id] || null;
  }
}

export const modelRouter = new ModelRouter();
