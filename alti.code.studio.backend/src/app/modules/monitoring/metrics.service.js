/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Centralized Enterprise Metrics & AI Cost Billing Service.
 * Tracks Swarm compute usage against tenant budgets and specific AI Agents.
 */

import { LLMMetrics } from './metrics.model.js';
import { logger } from '../../../shared/logger.js';

class MetricsService {
    constructor() {
        // Current Gemini 1.5 Pro list pricing (Example: $1.25/1M input, $3.75/1M output)
        this.PER_1M_INPUT_COST = 1.25;
        this.PER_1M_OUTPUT_COST = 3.75;
    }

    /**
     * Record a Gemini generation cycle for tenant accounting
     */
    async recordLLMUsage(tenantId, agentName, model, promptTokens, completionTokens, executionTimeMs) {
        try {
            const inputCost = (promptTokens / 1_000_000) * this.PER_1M_INPUT_COST;
            const outputCost = (completionTokens / 1_000_000) * this.PER_1M_OUTPUT_COST;
            const estimatedCostUsd = inputCost + outputCost;

            const metric = new LLMMetrics({
                tenantId: tenantId || 'default_enterprise_tenant',
                agentName,
                model,
                promptTokens,
                completionTokens,
                totalTokens: promptTokens + completionTokens,
                estimatedCostUsd,
                executionTimeMs
            });

            await metric.save();
            return metric;
        } catch (error) {
            logger.error(`❌ MetricsService: Failed to record billing token usage for ${agentName}`, error);
        }
    }

    /**
     * Tally up total active burn rate and historical usage for Mission Control
     */
    async getTenantDashboardMetrics(tenantId = 'default_enterprise_tenant') {
        try {
            // Get total aggregate cost
            const aggregate = await LLMMetrics.aggregate([
                { $match: { tenantId } },
                {
                    $group: {
                        _id: null,
                        totalCost: { $sum: "$estimatedCostUsd" },
                        totalTokens: { $sum: "$totalTokens" },
                        totalInvocations: { $sum: 1 },
                        avgExecutionMs: { $avg: "$executionTimeMs" }
                    }
                }
            ]);

            // Get top agents by burn rate
            const topAgents = await LLMMetrics.aggregate([
                { $match: { tenantId } },
                {
                    $group: {
                        _id: "$agentName",
                        cost: { $sum: "$estimatedCostUsd" },
                        calls: { $sum: 1 }
                    }
                },
                { $sort: { cost: -1 } },
                { $limit: 5 }
            ]);

            return {
                totals: aggregate[0] || { totalCost: 0, totalTokens: 0, totalInvocations: 0, avgExecutionMs: 0 },
                topAgents: topAgents.map(a => ({ agent: a._id, cost: a.cost, calls: a.calls }))
            };
        } catch (error) {
            logger.error(`❌ MetricsService: Failed to aggregate dashboard metrics`, error);
            return null;
        }
    }
}

export const metricsService = new MetricsService();
