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
      'gpt-5.4': { input: 2.5, output: 15.0 },
      'gpt-5.4-mini': { input: 0.75, output: 4.5 },
      'claude-fable-5': { input: 10.0, output: 50.0 },
      'claude-opus-4.8': { input: 5.0, output: 25.0 },
      'claude-sonnet-4.6': { input: 3.0, output: 15.0 },
      'gemini-3.1-pro': { input: 12.0, output: 18.0 },
      'gemini-3.5-flash': { input: 1.5, output: 9.0 },
      default: { input: 1.25, output: 3.75 },
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
    userId = null,
  ) {
    try {
      const normalizedModel = (model || '').toLowerCase();
      const pricing =
        this.MODEL_PRICING[normalizedModel] || this.MODEL_PRICING['default'];

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
  async getUserTokenUsagePerModel(userId, timeframe = 'current_month') {
    try {
      const matchStage = { userId };

      if (timeframe !== 'all') {
        const now = new Date();
        let startDate = new Date();

        if (timeframe === 'current_month') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (timeframe === '1m') {
          startDate.setMonth(now.getMonth() - 1);
        } else if (timeframe === '3m') {
          startDate.setMonth(now.getMonth() - 3);
        } else if (timeframe === '6m') {
          startDate.setMonth(now.getMonth() - 6);
        } else if (timeframe === '1y') {
          startDate.setFullYear(now.getFullYear() - 1);
        } else if (timeframe === 'ytd') {
          startDate = new Date(now.getFullYear(), 0, 1);
        }

        matchStage.timestamp = { $gte: startDate };
      }

      const aggregate = await LLMMetrics.aggregate([
        { $match: matchStage },
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

      return aggregate.map(m => ({
        model: m._id,
        promptTokens: m.promptTokens,
        completionTokens: m.completionTokens,
        totalTokens: m.totalTokens,
        cost: m.estimatedCostUsd,
        invocations: m.invocations,
      }));
    } catch (error) {
      logger.error(
        `❌ MetricsService: Failed to aggregate user metrics per model`,
        error,
      );
      return [];
    }
  }

  /**
   * Retrieves historical token usage grouped by month for a specific user
   */
  async getUserTokenHistory(userId) {
    try {
      const aggregate = await LLMMetrics.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
            },
            promptTokens: { $sum: '$promptTokens' },
            completionTokens: { $sum: '$completionTokens' },
            totalTokens: { $sum: '$totalTokens' },
            estimatedCostUsd: { $sum: '$estimatedCostUsd' },
            invocations: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
      ]);

      return aggregate.map(m => {
        // Format month name (e.g., "Jun 2026")
        const date = new Date(m._id.year, m._id.month - 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        return {
          month: `${monthName} ${m._id.year}`,
          year: m._id.year,
          monthIndex: m._id.month,
          promptTokens: m.promptTokens,
          completionTokens: m.completionTokens,
          totalTokens: m.totalTokens,
          cost: m.estimatedCostUsd,
          invocations: m.invocations,
        };
      });
    } catch (error) {
      logger.error(
        `❌ MetricsService: Failed to get user token history`,
        error,
      );
      return [];
    }
  }
}

export const metricsService = new MetricsService();
