/**
 * Copyright (c) 2026 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { VercelAiService } from './vercel_ai.service.js';
import { executeVertexInference } from './vertex_ai.helper.js';
import { logger } from '../../../shared/logger.js';
import { swarmTraceService } from '../telemetry/trace.service.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class MultiCloudInferenceService {
  constructor() {
    this.billingLogPath = path.join(
      process.cwd(),
      'logs',
      'marketplace_billing.log',
    );
    this.marketplaceSkus = {
      gcp: {
        sku: 'GCP-VERTEX-ALTI-SAAS-201',
        pricePerKPrompt: 0.0015,
        pricePerKCompletion: 0.005,
        contractId: 'gcp-ea-vertex-4882',
      },
    };
  }

  /**
   * Executes robust Google Sovereign Cloud inference.
   */
  async executeMultiCloudInference(
    prompt,
    activeAgent = 'jules',
    options = {},
  ) {
    let finalPrompt = prompt;
    if (
      typeof prompt === 'string' &&
      !prompt.includes('=== CODEBASE SYSTEM RULES & GUARDRAILS ===') &&
      !prompt.includes('=== CODEBASE RULES & GUARDRAILS ===') &&
      !prompt.includes(
        '=== STRICT SYSTEM INSTRUCTIONS FOR ISOLATED CHAT WORKSPACE ===',
      )
    ) {
      let rulesContext = '';
      try {
        const { RulesService } = await import('../rules/rules.service.js');
        const rules = await RulesService.parseRules();
        if (
          (rules.instructions && rules.instructions.length > 0) ||
          (rules.guardrails && rules.guardrails.length > 0)
        ) {
          rulesContext += '=== CODEBASE SYSTEM RULES & GUARDRAILS ===\n';
          if (rules.instructions && rules.instructions.length > 0) {
            rulesContext += 'INSTRUCTIONS (Enforced system parameters):\n';
            rules.instructions.forEach(inst => {
              rulesContext += `- ${inst.name}\n`;
            });
          }
          if (rules.guardrails && rules.guardrails.length > 0) {
            rulesContext += '\nGUARDRAILS (Prohibited actions):\n';
            rules.guardrails.forEach(gr => {
              rulesContext += `- ${gr.name}\n`;
            });
          }
          rulesContext += '==========================================\n\n';
        }
      } catch (err) {
        // Non-blocking
      }
      if (rulesContext) {
        finalPrompt = `${rulesContext}${prompt}`;
      }
    }

    const modelId = options.modelId || 'gemini-3.5-flash';
    const primaryProvider = 'gcp-vertex';

    if (process.env.AIR_GAPPED_MODE === 'true') {
      logger.warn(
        `🛡️ [Google Sovereign Inference] AIR_GAPPED_MODE is ON. Bypassing public clouds. Routing to local Ollama API.`,
      );
      return await this._executeAirGapped(finalPrompt, activeAgent, modelId);
    }

    logger.info(
      `🌐 [Google Sovereign Inference] Initiating inference for Agent [${activeAgent}] on ${primaryProvider.toUpperCase()} (Primary)`,
    );

    const providersQueue = [primaryProvider];
    let lastError = null;
    let resultObj = null;

    for (let i = 0; i < providersQueue.length; i++) {
      const provider = providersQueue[i];
      let attempt = 0;
      const maxRetries = provider === primaryProvider ? 1 : 0; // 1 retry for primary, 0 for secondary

      while (attempt <= maxRetries) {
        try {
          // Primary gets aggressive 10s timeout to fast-fail, Secondary gets 20s
          const timeoutMs = provider === primaryProvider ? 10000 : 20000;
          const abortController = new AbortController();
          const timeoutId = setTimeout(
            () => abortController.abort(),
            timeoutMs,
          );
          const currentOptions = { ...options, signal: abortController.signal };

          if (provider === 'gcp-vertex') {
            resultObj = await this._executeGoogleVertex(
              finalPrompt,
              activeAgent,
              modelId,
              currentOptions,
            );
          }

          clearTimeout(timeoutId);
          break; // Success, break out of retry loop
        } catch (err) {
          lastError = err;
          attempt++;
          if (attempt <= maxRetries) {
            logger.warn(
              `⚠️ [Google Sovereign Inference] ${provider.toUpperCase()} attempt ${attempt} failed: ${err.message}. Retrying with exponential backoff...`,
            );
            // Exponential backoff: 500ms * 2^attempt
            await new Promise(resolve =>
              setTimeout(resolve, 500 * Math.pow(2, attempt)),
            );
          } else {
            logger.warn(
              `⚠️ [Google Sovereign Inference] ${provider.toUpperCase()} provider failed entirely: ${err.message}`,
            );
          }
        }
      }

      if (resultObj) {
        break; // Success, break out of provider queue loop
      }
    }

    if (!resultObj) {
      logger.error(
        `❌ [Google Sovereign Inference] All providers exhausted. Inference has failed completely.`,
      );
      throw new Error(
        `Google Sovereign Inference failed. Last error: ${lastError?.message}`,
      );
    }

    // Trace generation if spanId is present
    const spanId = options.spanId || options.parentSpanId;
    if (spanId) {
      try {
        swarmTraceService.recordGeneration(spanId, {
          name: `${activeAgent}_llm_call`,
          model: modelId,
          input: finalPrompt,
          output: resultObj.content,
          provider: resultObj.provider,
          latencyMs: resultObj.latencyMs,
          usage: resultObj.tokens || {
            prompt: Math.max(1, Math.ceil(finalPrompt.length / 4)),
            completion: Math.max(
              1,
              Math.ceil((resultObj.content || '').length / 4),
            ),
          },
        });
      } catch (e) {
        logger.warn(`Failed to trace generation in Langfuse: ${e.message}`);
      }
    }

    return resultObj;
  }

  /**
   * Executes inference entirely locally for highly sensitive deployments (Defense/Intel)
   */
  async _executeAirGapped(prompt, activeAgent, modelId) {
    logger.info(
      `🔒 [Google Sovereign Inference] Executing Air-Gapped Local Inference on Ollama...`,
    );
    const startTime = Date.now();
    let text = '';
    let latency = 0;

    const ollamaUrl =
      process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
    const localModel = process.env.AIR_GAPPED_MODEL || 'llama3';

    try {
      const res = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: localModel, stream: false }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok)
        throw new Error(`Ollama responded with status ${res.status}`);
      const data = await res.json();
      text = data.response;
      latency = Date.now() - startTime;
    } catch (e) {
      logger.error(
        `❌ [Google Sovereign Inference] Air-gapped local model failed: ${e.message}`,
      );
      throw new Error(
        'Critical failure: Air-gapped fallback is unavailable and public clouds are disabled.',
      );
    }

    return {
      content: text,
      provider: 'air-gapped',
      latencyMs: latency,
      tokens: {
        prompt: Math.ceil(prompt.length / 4),
        completion: Math.ceil(text.length / 4),
      },
    };
  }

  /**
   * Executes inference exclusively on Google Vertex AI (Sovereign Cloud Integrated)
   */
  async _executeGoogleVertex(prompt, activeAgent, modelId, options = {}) {
    logger.info(
      `☁️ [Google Vertex AI Sovereign Inference] Executing on Google Cloud Vertex AI using model ${modelId}...`,
    );
    const startTime = Date.now();

    const result = await executeVertexInference(prompt, modelId, options);
    const latency = Date.now() - startTime;

    const promptTokens = result.usage.promptTokens;
    const completionTokens = result.usage.completionTokens;

    // Record billing transaction mapped to the Google Cloud Marketplace SKU
    await this._recordMarketplaceBilling(
      'gcp',
      promptTokens,
      completionTokens,
      modelId,
      latency,
    );

    return {
      content: result.text,
      venue: 'GOOGLE_VERTEX_SOVEREIGN_CLOUD',
      provider: result.provider,
      model: modelId,
      latencyMs: latency,
      tokens: { prompt: promptTokens, completion: completionTokens },
    };
  }

  /**
   * Executes inference using Vercel AI SDK (GCP Vertex Mode)
   */
  async _executeVercelAi(prompt, activeAgent, modelId, options = {}) {
    logger.info(
      `⚡ [Sovereign Inference] Executing via Google Cloud Vertex AI using model ${modelId}...`,
    );
    const startTime = Date.now();
    const res = await VercelAiService.generate(prompt, { model: modelId });
    const latency = Date.now() - startTime;

    const promptTokens =
      res.usage?.promptTokens || Math.max(1, Math.ceil(prompt.length / 4));
    const completionTokens =
      res.usage?.completionTokens ||
      Math.max(1, Math.ceil(res.text.length / 4));
    await this._recordMarketplaceBilling(
      'gcp',
      promptTokens,
      completionTokens,
      modelId,
      latency,
    );

    return {
      content: res.text,
      venue: 'GOOGLE_VERTEX_SOVEREIGN_CLOUD',
      provider: 'gcp-vertex',
      model: modelId,
      latencyMs: latency,
      tokens: { prompt: promptTokens, completion: completionTokens },
    };
  }

  /**
   * Records a secure marketplace billing transaction for enterprise procurement
   */
  async _recordMarketplaceBilling(
    provider,
    promptTokens,
    completionTokens,
    modelId,
    latencyMs,
  ) {
    const skuConfig = this.marketplaceSkus[provider];
    if (!skuConfig) return;

    const costPrompt = (promptTokens / 1000) * skuConfig.pricePerKPrompt;
    const costCompletion =
      (completionTokens / 1000) * skuConfig.pricePerKCompletion;
    const totalCostUsd = parseFloat((costPrompt + costCompletion).toFixed(6));

    const transaction = {
      transactionId: `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
      timestamp: new Date().toISOString(),
      cloudProvider: provider,
      marketplaceSku: skuConfig.sku,
      contractId: skuConfig.contractId,
      modelId,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      financials: {
        costPromptUsd: costPrompt,
        costCompletionUsd: costCompletion,
        totalCostUsd,
        currency: 'USD',
      },
      telemetry: {
        latencyMs,
      },
    };

    try {
      await fs.mkdir(path.dirname(this.billingLogPath), { recursive: true });
      await fs.appendFile(
        this.billingLogPath,
        JSON.stringify(transaction) + '\n',
      );
      logger.info(
        `💳 [Marketplace Billing] Recorded ${provider.toUpperCase()} Procurement Transaction: ${transaction.transactionId} | USD $${totalCostUsd} billed via contract [${skuConfig.contractId}]`,
      );
    } catch (e) {
      logger.error(`❌ Failed to write marketplace billing log: ${e.message}`);
    }
  }

  /**
   * Retrieves aggregated marketplace procurement stats for audits
   */
  async getMarketplaceProcurementStats() {
    const stats = {
      gcp: { totalBilledUsd: 0, totalTokens: 0, transactionCount: 0 },
      gcp: { totalBilledUsd: 0, totalTokens: 0, transactionCount: 0 },
      global: { totalBilledUsd: 0, totalTokens: 0, totalTransactions: 0 },
    };

    try {
      const data = await fs.readFile(this.billingLogPath, 'utf-8');
      const lines = data.trim().split('\n').filter(Boolean);

      for (const line of lines) {
        const tx = JSON.parse(line);
        const p = tx.cloudProvider;
        if (stats[p]) {
          stats[p].totalBilledUsd += tx.financials.totalCostUsd;
          stats[p].totalTokens += tx.usage.totalTokens;
          stats[p].transactionCount += 1;

          stats.global.totalBilledUsd += tx.financials.totalCostUsd;
          stats.global.totalTokens += tx.usage.totalTokens;
          stats.global.totalTransactions += 1;
        }
      }
    } catch (e) {
      // Log file might not exist yet
    }

    // Format floats
    stats.gcp.totalBilledUsd = parseFloat(
      stats.gcp.totalBilledUsd.toFixed(4),
    );
    stats.gcp.totalBilledUsd = parseFloat(stats.gcp.totalBilledUsd.toFixed(4));
    stats.global.totalBilledUsd = parseFloat(
      stats.global.totalBilledUsd.toFixed(4),
    );

    return stats;
  }

  _getSimulatedResponse(prompt, modelDesc) {
    logger.info(`Generating high-fidelity simulation from ${modelDesc}...`);
    if (prompt.includes('Guardian Angel')) {
      return JSON.stringify(
        {
          safe: true,
          score: 98,
          reasoning: `[${modelDesc} Security Audit] Code has zero structural vulnerabilities. Compliance verified.`,
          vulnerabilities: [],
          suggestions: [],
        },
        null,
        2,
      );
    }
    return `[SIMULATED COMPLIANT RESPONSE FROM ${modelDesc.toUpperCase()}]
This response was processed securely via multi-cloud model endpoints and recorded in the respective Cloud Marketplace dashboard for billing and procurement transparency.
Your prompt snippet: "${prompt.substring(0, 80)}..."`;
  }
}

export const multiCloudInferenceService = new MultiCloudInferenceService();
