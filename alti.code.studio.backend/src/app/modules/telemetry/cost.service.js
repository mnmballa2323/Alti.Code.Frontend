/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
// import { redisClient } from '../../../shared/redis.js'; // Assuming Redis client exists
// import { PrismaClient } from '@prisma/client'; // Assuming Prisma

class CostService {
    constructor() {
        // Prices per 1M tokens (USD) — source: Google AI pricing page
        this.prices = {
            'gemini-3.1-pro': { input: 3.50, output: 10.50 },
            'gemini-3.1-pro': { input: 0.35, output: 1.05 },
            'gemini-3.1-pro': { input: 0.50, output: 1.50 },
            'gemini-3.1-pro-002': { input: 3.50, output: 10.50 },
            'gemini-3.1-pro-002': { input: 0.35, output: 1.05 },
        };
        /** @type {Map<string, number>} userId → accumulated cost */
        this._userTotals = new Map();
        /** @type {Map<string, number>} model → accumulated cost */
        this._modelTotals = new Map();
    }

    /**
     * Track token usage and calculate cost.
     * @param {string} model - Model name (e.g., 'gemini-3.1-pro')
     * @param {number} inputTokens - Number of input tokens
     * @param {number} outputTokens - Number of output tokens
     * @param {string} userId - User ID
     * @param {string} agentId - Agent ID (optional)
     */
    async track(model, inputTokens, outputTokens, userId, agentId = 'system') {
        if (!model || typeof model !== 'string') {
            throw new Error('CostService: model must be a valid string');
        }
        if (!userId) {
            throw new Error('CostService: userId is required');
        }
        if (typeof inputTokens !== 'number' || isNaN(inputTokens)) inputTokens = 0;
        if (typeof outputTokens !== 'number' || isNaN(outputTokens)) outputTokens = 0;

        const price = this.prices[model];
        if (!price) {
            logger.warn(`💰 CostService: Unknown model "${model}" — cost tracking skipped.`);
        }
        const { input = 0, output = 0 } = price ?? {};

        const inputCost = (inputTokens / 1_000_000) * input;
        const outputCost = (outputTokens / 1_000_000) * output;
        const totalCost = inputCost + outputCost;

        const record = {
            timestamp: new Date(),
            model,
            inputTokens,
            outputTokens,
            totalCost,
            userId,
            agentId,
        };

        logger.info(`💰 Cost: $${totalCost.toFixed(6)} | Model: ${model} | In: ${inputTokens} Out: ${outputTokens} | User: ${userId}`);

        // Accumulate in-memory totals for dashboard queries
        this._userTotals.set(userId, (this._userTotals.get(userId) ?? 0) + totalCost);
        this._modelTotals.set(model, (this._modelTotals.get(model) ?? 0) + totalCost);

        return record;
    }

    /**
     * Returns a summary of accumulated costs.
     * @returns {{ totalByUser: object, totalByModel: object, grandTotal: number }}
     */
    getSummary() {
        const totalByUser = Object.fromEntries(this._userTotals);
        const totalByModel = Object.fromEntries(this._modelTotals);
        const grandTotal = [...this._userTotals.values()].reduce((a, b) => a + b, 0);
        return { totalByUser, totalByModel, grandTotal };
    }

    /** Reset all in-memory accumulators (useful for testing). */
    clearSummary() {
        this._userTotals.clear();
        this._modelTotals.clear();
    }
}

export const costService = new CostService();
