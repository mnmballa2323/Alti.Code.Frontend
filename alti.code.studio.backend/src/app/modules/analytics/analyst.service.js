/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';

class AnalystService {
  constructor() {
    // In a real scenario, this would inject AuditService and CostService repository interfaces
  }

  /**
   * Aggregates daily statistics from raw logs
   * @param {Array<Object>} logs
   */
  async getDailyStats(logs) {
    try {
      logger.info('📈 The Analyst: Aggregating Daily Stats...');

      const stats = {
        totalActions: 0,
        successRate: 0,
        agentActivity: {},
        cost: 0,
      };

      let successCount = 0;

      for (const log of logs) {
        stats.totalActions++;

        // Track Agent Activity
        if (log.actor) {
          stats.agentActivity[log.actor] =
            (stats.agentActivity[log.actor] || 0) + 1;
        }

        // Track Success
        if (log.outcome === 'Success') {
          successCount++;
        }

        // Track Cost (Simulated field)
        if (log.cost) {
          stats.cost += log.cost;
        }
      }

      stats.successRate =
        stats.totalActions > 0 ? (successCount / stats.totalActions) * 100 : 0;

      return stats;
    } catch (error) {
      logger.error(`❌ Analyst Aggregation Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detects anomalies based on historical averages
   * @param {Object} currentStats
   * @param {Object} historicalStats
   */
  async detectAnomalies(currentStats, historicalStats) {
    const anomalies = [];

    // Check 1: Error Rate Spike
    // If success rate drops below 90% of historical average
    if (currentStats.successRate < historicalStats.successRate * 0.9) {
      anomalies.push({
        type: 'PERFORMANCE_DROP',
        severity: 'HIGH',
        message: `Success rate dropped to ${currentStats.successRate.toFixed(2)}% (Avg: ${historicalStats.successRate.toFixed(2)}%)`,
      });
    }

    // Check 2: Cost Spike
    // If cost is > 2x historical average
    if (currentStats.cost > historicalStats.cost * 2) {
      anomalies.push({
        type: 'COST_SPIKE',
        severity: 'CRITICAL',
        message: `Cost spiked to $${currentStats.cost} (Avg: $${historicalStats.cost})`,
      });
    }

    if (anomalies.length > 0) {
      logger.warn(`⚠️ The Analyst detected ${anomalies.length} anomalies.`);
    } else {
      logger.info('✅ No anomalies detected.');
    }

    return anomalies;
  }

  /**
   * Returns historical trend data for the Owner Dashboard
   */
  async getTrends() {
    // Mocking 7 days of data for "The Strategist"
    return [
      { date: '2026-02-08', cost: 0.12, velocity: 45 },
      { date: '2026-02-09', cost: 0.15, velocity: 48 },
      { date: '2026-02-10', cost: 0.11, velocity: 52 },
      { date: '2026-02-11', cost: 0.25, velocity: 40 }, // Spike
      { date: '2026-02-12', cost: 0.14, velocity: 55 },
      { date: '2026-02-13', cost: 0.13, velocity: 60 },
      { date: '2026-02-14', cost: 0.16, velocity: 62 },
    ];
  }
}

export const analystService = new AnalystService();
