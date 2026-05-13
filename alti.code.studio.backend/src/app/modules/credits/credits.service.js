/**
 * Credit Tracking Service — Real-time token & cost accounting per session
 *
 * Tracks Gemini token usage using the usageMetadata returned by the API.
 * Pricing: Gemini 1.5 Pro — $3.50/M input tokens, $10.50/M output tokens (as of 2024)
 * Override via GEMINI_INPUT_COST_PER_M and GEMINI_OUTPUT_COST_PER_M env vars.
 */

import { logger } from '../../../shared/logger.js';

// Pricing per 1M tokens (in USD)
const INPUT_COST_PER_M = parseFloat(process.env.GEMINI_INPUT_COST_PER_M || '3.50');
const OUTPUT_COST_PER_M = parseFloat(process.env.GEMINI_OUTPUT_COST_PER_M || '10.50');

class CreditTrackingService {
    constructor() {
        /**
         * Map<sessionId, { inputTokens, outputTokens, totalTokens, estimatedCostUsd, calls, lastUpdated }>
         */
        this._sessions = new Map();
        this._global = { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCostUsd: 0, calls: 0 };
    }

    // ─── RECORD ───────────────────────────────────────────────────────────────

    /**
     * Record token usage from a Gemini API response.
     * @param {string} sessionId
     * @param {{ promptTokenCount?: number, candidatesTokenCount?: number, totalTokenCount?: number }} usageMetadata
     */
    record(sessionId, usageMetadata = {}) {
        const inputTokens = usageMetadata.promptTokenCount || 0;
        const outputTokens = usageMetadata.candidatesTokenCount || 0;
        const total = usageMetadata.totalTokenCount || (inputTokens + outputTokens);
        const costUsd = this._calcCost(inputTokens, outputTokens);

        // Per-session tracker
        if (!this._sessions.has(sessionId)) {
            this._sessions.set(sessionId, {
                sessionId,
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: 0,
                estimatedCostUsd: 0,
                calls: 0,
                lastUpdated: null,
            });
        }
        const session = this._sessions.get(sessionId);
        session.inputTokens += inputTokens;
        session.outputTokens += outputTokens;
        session.totalTokens += total;
        session.estimatedCostUsd += costUsd;
        session.calls += 1;
        session.lastUpdated = new Date().toISOString();

        // Global tracker
        this._global.inputTokens += inputTokens;
        this._global.outputTokens += outputTokens;
        this._global.totalTokens += total;
        this._global.estimatedCostUsd += costUsd;
        this._global.calls += 1;

        logger.debug(`💰 Credits: session=${sessionId} +${total} tokens (+$${costUsd.toFixed(6)})`);
        return { inputTokens, outputTokens, totalTokens: total, costUsd };
    }

    /**
     * Estimate token count from text length (rough approximation: 1 token ≈ 4 chars).
     * Used as fallback when usageMetadata is unavailable.
     * @param {string} text
     * @returns {number}
     */
    estimateTokens(text = '') {
        return Math.ceil(text.length / 4);
    }

    /**
     * Record usage by estimating from prompt + response text when usageMetadata unavailable.
     */
    recordFromText(sessionId, promptText = '', responseText = '') {
        const inputTokens = this.estimateTokens(promptText);
        const outputTokens = this.estimateTokens(responseText);
        return this.record(sessionId, { promptTokenCount: inputTokens, candidatesTokenCount: outputTokens });
    }

    // ─── GETTERS ──────────────────────────────────────────────────────────────

    getSession(sessionId) {
        return this._sessions.get(sessionId) || {
            sessionId,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            estimatedCostUsd: 0,
            calls: 0,
            lastUpdated: null,
        };
    }

    getAllSessions() {
        return Array.from(this._sessions.values())
            .sort((a, b) => (b.totalTokens || 0) - (a.totalTokens || 0));
    }

    getGlobalStats() {
        return {
            ...this._global,
            sessionCount: this._sessions.size,
            inputCostRate: INPUT_COST_PER_M,
            outputCostRate: OUTPUT_COST_PER_M,
        };
    }

    resetSession(sessionId) {
        this._sessions.delete(sessionId);
        logger.info(`💰 Credits: session ${sessionId} reset.`);
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    _calcCost(inputTokens, outputTokens) {
        return (inputTokens / 1_000_000) * INPUT_COST_PER_M +
            (outputTokens / 1_000_000) * OUTPUT_COST_PER_M;
    }
}

export const creditTrackingService = new CreditTrackingService();
