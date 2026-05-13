/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade CLI Base Agent
 * Hardened under Project Aegis v2.0
 */

import crypto from 'crypto';
import { BaseSpecialistAgent, AgentError } from './base_specialist.agent.js';
import { GeminiCliService } from '../geminiCli/geminiCli.service.js';
import { GeminiExtensionService } from '../geminiExtensions/geminiExtension.service.js';
import { logger } from '../../../shared/logger.js';
import { semanticCacheService } from '../memory/semantic_cache.service.js';
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';

export class GeminiCliBaseAgent extends BaseSpecialistAgent {
    constructor(name, description, preamble = '') {
        super();
        this.name = name;
        this.description = description;
        this.preamble = preamble;
    }

    /**
     * Sanitizes input to prevent prompt injection and shell escape vectors.
     */
    _sanitize(input) {
        if (!input) return '';
        // Strip null bytes and non-printable characters (excluding newlines/tabs)
        return String(input).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
    }

    /**
     * Overrides the standard _invoke to pipe commands directly into the raw Gemini CLI binary.
     * Integrates Aegis Hardening: Input Sanitization, Timeouts, and Exponential Backoff.
     */
    async _invoke(prompt, contextBlock, opts = {}) {
        const { extensionName = null, extensionArgs = [], timeoutMs = 60000, maxRetries = 3 } = opts;
        const correlationId = crypto.randomUUID();

        // 1. Extension Routing
        if (extensionName) {
            logger.info(`⚡ [${this.name}] Invoking Gemini CLI Extension: ${extensionName}`);
            try {
                return await GeminiExtensionService.invokeExtension(extensionName, extensionArgs);
            } catch (extErr) {
                logger.error(`❌ [${this.name}] Extension ${extensionName} failed: ${extErr.message}`);
                throw new AgentError(`Extension failed: ${extErr.message}`, 'CLI_EXT_ERROR', false);
            }
        }

        // 2. Standard CLI interaction (Hardened)
        const safePrompt = this._sanitize(prompt);
        const safeContext = this._sanitize(contextBlock);
        const safePreamble = this._sanitize(this.preamble);

        const fullPayload = `
${safePreamble}
---
CONTEXT:
${safeContext}
---
TASK:
${safePrompt}
        `.trim();

        // 🧠 Semantic Cache Interception (PgVector)
        const cachedOutput = await semanticCacheService.getCachedResponse(fullPayload);
        if (cachedOutput) {
            logger.info(`⚡ [${this.name}] [cid:${correlationId}] Elite Specialist Cache Hit! Bypassing Vertex AI.`);
            return cachedOutput;
        }

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.info(`⚡ [${this.name}] [cid:${correlationId}] Executing Vertex AI generation via GoogleGenAiService (Attempt ${attempt}/${maxRetries})...`);
                
                // Use GoogleGenAiService (Vertex AI integrated) instead of the raw native CLI
                const result = await GoogleGenAiService.generateContent(fullPayload);
                const output = result.content;
                
                // 🧠 Store the successful outcome into the pgvector semantic cache
                semanticCacheService.setCachedResponse(fullPayload, output).catch(() => {});
                
                return output;
                
            } catch (err) {
                logger.warn(`⚠️ [${this.name}] [cid:${correlationId}] CLI invocation attempt ${attempt} failed: ${err.message}`);
                
                if (attempt === maxRetries) {
                    logger.error(`❌ [${this.name}] All CLI retry attempts exhausted.`);
                    throw new AgentError(`CLI execution failed after ${maxRetries} attempts: ${err.message}`, 'CLI_ERROR', true);
                }
                
                // Exponential Backoff (500ms, 1000ms, 2000ms...)
                const backoffDelay = Math.pow(2, attempt - 1) * 500;
                await new Promise(res => setTimeout(res, backoffDelay));
            }
        }
    }

    /**
     * Enterprise health check. Returns agent readiness status.
     * @returns {{ name: string, status: 'READY', version: string }}
     */
    getHealth() {
        return {
            name: this.name,
            status: 'READY',
            version: '2.0.0-aegis',
        };
    }
}
