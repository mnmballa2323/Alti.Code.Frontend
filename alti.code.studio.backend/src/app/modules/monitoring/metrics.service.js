/**
 * Copyright (c) 2024 Inso Code
 *
 * Centralized Enterprise Metrics & AI Cost Billing Service.
 * Tracks Swarm compute usage against tenant budgets and specific AI Agents.
 */

import { LLMMetrics } from './metrics.model.js';
import { logger } from '../../../shared/logger.js';

class MetricsService {
  constructor() {
    this.MODEL_PRICING = {
      'gpt-5.4': { input: 2.50, output: 15.00 },
      'gpt-5.4-mini': { input: 0.75, output: 4.50 },
      'claude-fable-5': { input: 10.00, output: 50.00 },
      'claude-opus-4.8': { input: 5.00, output: 25.00 },
      'claude-sonnet-4.6': { input: 3.00, output: 15.00 },
      'gemini-3.1-pro': { input: 12.00, output: 18.00 },
      'gemini-3.5-flash': { input: 1.50, output: 9.00 },
      'default': { input: 1.25, output: 3.75 }
    };
  }

  /**
   * Record a Gemini generation cycle for tenant accounting
   */
  async recordLLMUsage(
    tenantId,
    agentName,
    model,
    promptTokens,
    completionTokens,
    executionTimeMs,
    userId = null
  ) {
    try {
      const normalizedModel = (model || '').toLowerCase();
      const pricing = this.MODEL_PRICING[normalizedModel] || this.MODEL_PRICING['default'];

      const inputCost = (promptTokens / 1_000_000) * pricing.input;
      const outputCost = (completionTokens / 1_000_000) * pricing.output;
      const estimatedCostUsd = inputCost + outputCost;

      const metric = new LLMMetrics({
        tenantId: tenantId || 'default_enterprise_tenant',
        userId,
        agentName,
        model,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCostUsd,
        executionTimeMs,
      });

      await metric.save();
      return metric;
    } catch (error) {
      logger.error(
        `❌ MetricsService: Failed to record billing token usage for ${agentName}`,
        error,
      );
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
            totalCost: { $sum: '$estimatedCostUsd' },
            totalTokens: { $sum: '$totalTokens' },
            totalInvocations: { $sum: 1 },
            avgExecutionMs: { $avg: '$executionTimeMs' },
          },
        },
      ]);

      // Get top agents by burn rate
      const topAgents = await LLMMetrics.aggregate([
        { $match: { tenantId } },
        {
          $group: {
            _id: '$agentName',
            cost: { $sum: '$estimatedCostUsd' },
            calls: { $sum: 1 },
          },
        },
        { $sort: { cost: -1 } },
        { $limit: 5 },
      ]);

      return {
        totals: aggregate[0] || {
          totalCost: 0,
          totalTokens: 0,
          totalInvocations: 0,
          avgExecutionMs: 0,
        },
        topAgents: topAgents.map(a => ({
          agent: a._id,
          cost: a.cost,
          calls: a.calls,
        })),
      };
    } catch (error) {
      logger.error(
        `❌ MetricsService: Failed to aggregate dashboard metrics`,
        error,
      );
      return null;
    }
  }

  /**
   * Retrieves aggregated token usage grouped by model for a specific user
   */
  async getUserTokenUsagePerModel(userId) {
    try {
      const aggregate = await LLMMetrics.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$model',
            promptTokens: { $sum: '$promptTokens' },
            completionTokens: { $sum: '$completionTokens' },
            totalTokens: { $sum: '$totalTokens' },
            estimatedCostUsd: { $sum: '$estimatedCostUsd' },
            invocations: { $sum: 1 },
          },
        },
        { $sort: { totalTokens: -1 } },
      ]);

      return aggregate.map((m) => ({
        model: m._id,
        promptTokens: m.promptTokens,
        completionTokens: m.completionTokens,
        totalTokens: m.totalTokens,
        cost: m.estimatedCostUsd,
        invocations: m.invocations,
      }));
    } catch (error) {
      logger.error(`❌ MetricsService: Failed to aggregate user metrics per model`, error);
      return [];
    }
  }
}

export const metricsService = new MetricsService();
