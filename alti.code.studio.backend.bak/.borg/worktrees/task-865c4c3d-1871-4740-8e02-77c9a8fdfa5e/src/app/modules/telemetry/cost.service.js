/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { logger } from '../../../shared/logger.js';
// import { redisClient } from '../../../shared/redis.js'; // Assuming Redis client exists
// import { PrismaClient } from '@prisma/client'; // Assuming Prisma

class CostService {
    constructor() {
        this.prices = {
            'gemini-1.5-pro': { input: 3.50, output: 10.50 }, // Per 1M tokens
            'gemini-1.5-flash': { input: 0.35, output: 1.05 },
            'gemini-3.0-pro': { input: 5.00, output: 15.00 } // Estimated
        };
    }

    /**
     * Track token usage and calculate cost.
     * @param {string} model - Model name (e.g., 'gemini-1.5-pro')
     * @param {number} inputTokens - Number of input tokens
     * @param {number} outputTokens - Number of output tokens
     * @param {string} userId - User ID
     * @param {string} agentId - Agent ID (optional)
     */
    async track(model, inputTokens, outputTokens, userId, agentId = 'system') {
        const price = this.prices[model] || { input: 0, output: 0 };

        const inputCost = (inputTokens / 1_000_000) * price.input;
        const outputCost = (outputTokens / 1_000_000) * price.output;
        const totalCost = inputCost + outputCost;

        const record = {
            timestamp: new Date(),
            model,
            inputTokens,
            outputTokens,
            totalCost,
            userId,
            agentId
        };

        // Log to console/file
        logger.info(`💰 Cost: $${totalCost.toFixed(6)} | Model: ${model} | In: ${inputTokens} Out: ${outputTokens}`);

        // In a real implementation:
        // 1. Incr Redis counter for real-time dashboards
        // await redisClient.incrBy(`cost:${userId}`, totalCost);

        // 2. Persist to DB for billing
        // await prisma.usageLog.create({ data: record });

        return record;
    }
}

export const costService = new CostService();
