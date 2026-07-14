import { executeVertexInference } from '../vertex_ai.helper.js';
import { logger } from '../../../../shared/logger.js';
import { swarmTraceService } from '../../telemetry/trace.service.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class GcpSovereignService {
  constructor() {
    this.billingLogPath = path.join(
      process.cwd(),
      'logs',
      'gcp_billing.log',
    );
    this.skuConfig = {
      sku: 'GCP-VERTEX-ALTI-SAAS-201',
      pricePerKPrompt: 0.0015,
      pricePerKCompletion: 0.005,
      contractId: 'gcp-ea-vertex-4882',
    };
  }

  async executeInference(prompt, activeAgent = 'jules', options = {}) {
    let finalPrompt = await this._applyRules(prompt);
    const modelId = options.modelId || 'gemini-3.5-flash';

    logger.info(
      `☁️ [GCP Sovereign] Executing on Google Cloud Vertex AI using model ${modelId}...`,
    );
    const startTime = Date.now();

    const result = await executeVertexInference(finalPrompt, modelId, options);
    const latency = Date.now() - startTime;

    const promptTokens = result.usage?.promptTokens || Math.max(1, Math.ceil(finalPrompt.length / 4));
    const completionTokens = result.usage?.completionTokens || Math.max(1, Math.ceil((result.text || '').length / 4));

    await this._recordMarketplaceBilling(promptTokens, completionTokens, modelId, latency);

    const resultObj = {
      content: result.text,
      venue: 'GOOGLE_VERTEX_SOVEREIGN_CLOUD',
      provider: result.provider || 'gcp-vertex',
      model: modelId,
      latencyMs: latency,
      tokens: { prompt: promptTokens, completion: completionTokens },
    };

    this._recordTrace(options, activeAgent, modelId, finalPrompt, resultObj);
    await this.logRoutingTelemetry(activeAgent, modelId, resultObj, options);

    return resultObj;
  }

  async _applyRules(prompt) {
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
        const { RulesService } = await import('../../rules/rules.service.js');
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
    return finalPrompt;
  }

  async _recordMarketplaceBilling(promptTokens, completionTokens, modelId, latencyMs) {
    const costPrompt = (promptTokens / 1000) * this.skuConfig.pricePerKPrompt;
    const costCompletion = (completionTokens / 1000) * this.skuConfig.pricePerKCompletion;
    const totalCostUsd = parseFloat((costPrompt + costCompletion).toFixed(6));

    const transaction = {
      transactionId: `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
      timestamp: new Date().toISOString(),
      cloudProvider: 'gcp',
      marketplaceSku: this.skuConfig.sku,
      contractId: this.skuConfig.contractId,
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
      telemetry: { latencyMs },
    };

    try {
      await fs.mkdir(path.dirname(this.billingLogPath), { recursive: true });
      await fs.appendFile(
        this.billingLogPath,
        JSON.stringify(transaction) + '\n',
      );
      logger.info(
        `💳 [GCP Billing] Recorded Procurement Transaction: ${transaction.transactionId} | USD $${totalCostUsd}`,
      );
    } catch (e) {
      logger.error(`❌ Failed to write billing log: ${e.message}`);
    }
  }

  _recordTrace(options, activeAgent, modelId, finalPrompt, resultObj) {
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
            completion: Math.max(1, Math.ceil((resultObj.content || '').length / 4)),
          },
        });
      } catch (e) {
        logger.warn(`Failed to trace generation in Langfuse: ${e.message}`);
      }
    }
  }

  async logRoutingTelemetry(activeAgent, modelId, resultObj, options) {
    try {
      const logDir = path.dirname(this.billingLogPath);
      await fs.mkdir(logDir, { recursive: true });

      const contentText = resultObj?.content || '';
      const promptTokens = resultObj?.tokens?.prompt || Math.max(1, Math.ceil(contentText.length / 4));
      const completionTokens = resultObj?.tokens?.completion || Math.max(1, Math.ceil(contentText.length / 4));
      const latencyMs = resultObj?.latencyMs || 0;

      const logEntry = {
        timestamp: new Date().toISOString(),
        transactionId: crypto.randomUUID(),
        agent: activeAgent,
        model: modelId,
        provider: resultObj?.provider || 'gcp-vertex',
        latencyMs,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        telemetryMetadata: {
          hasInstruction: !!options?.systemInstruction,
          isStructured: !!options?.isStructured,
        },
      };

      await fs.appendFile(
        this.billingLogPath,
        JSON.stringify(logEntry) + '\n',
        'utf8',
      );
    } catch (err) {
      logger.warn(`Failed to write telemetry: ${err.message}`);
    }
  }
}

export const gcpSovereignService = new GcpSovereignService();
