/**
 * Usage Metering Service
 * 
 * Tracks and reports usage for billing:
 * - Token consumption per tenant
 * - Agent execution hours
 * - API call counts
 * - Storage usage
 * - Real-time budget enforcement
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { cacheStrategy } from './cacheStrategy.js';

const PLAN_LIMITS = {
  cloud: { tokensPerMonth: 5_000_000, agents: 10, apiCalls: 100_000, storageGb: 10 },
  dedicated: { tokensPerMonth: 50_000_000, agents: 50, apiCalls: 1_000_000, storageGb: 100 },
  sovereign: { tokensPerMonth: 500_000_000, agents: 500, apiCalls: 10_000_000, storageGb: 1000 },
};

class UsageMetering {
  constructor() {
    this.usage = new Map(); // tenantId -> { tokens, agentHours, apiCalls, storageBytes }
  }

  async recordTokenUsage(tenantId, modelId, inputTokens, outputTokens) {
    const entry = this._getOrCreate(tenantId);
    const totalTokens = inputTokens + outputTokens;
    entry.tokens += totalTokens;
    entry.tokenBreakdown[modelId] = (entry.tokenBreakdown[modelId] || 0) + totalTokens;
    entry.lastActivity = new Date().toISOString();

    metrics.incrementCounter('usage_tokens_total', totalTokens, { tenant: tenantId, model: modelId });

    // Check budget threshold
    const plan = entry.plan || 'cloud';
    const limit = PLAN_LIMITS[plan]?.tokensPerMonth || PLAN_LIMITS.cloud.tokensPerMonth;
    const usagePercent = (entry.tokens / limit) * 100;

    if (usagePercent >= 90 && !entry.warned90) {
      entry.warned90 = true;
      logger.warn(`[Metering] Tenant ${tenantId} at ${usagePercent.toFixed(0)}% token usage`);
    }
    if (usagePercent >= 100 && !entry.warned100) {
      entry.warned100 = true;
      logger.warn(`[Metering] Tenant ${tenantId} EXCEEDED token limit`);
    }
  }

  async recordApiCall(tenantId) {
    const entry = this._getOrCreate(tenantId);
    entry.apiCalls++;
    entry.lastActivity = new Date().toISOString();
  }

  async recordAgentExecution(tenantId, durationMs) {
    const entry = this._getOrCreate(tenantId);
    entry.agentHours += durationMs / 3_600_000;
    entry.agentExecutions++;
    entry.lastActivity = new Date().toISOString();
  }

  async getUsage(tenantId) {
    const entry = this._getOrCreate(tenantId);
    const plan = entry.plan || 'cloud';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.cloud;

    return {
      tenantId,
      plan,
      period: this._currentPeriod(),
      tokens: { used: entry.tokens, limit: limits.tokensPerMonth, percentage: Math.round((entry.tokens / limits.tokensPerMonth) * 100) },
      apiCalls: { used: entry.apiCalls, limit: limits.apiCalls, percentage: Math.round((entry.apiCalls / limits.apiCalls) * 100) },
      agents: { active: entry.activeAgents || 0, limit: limits.agents },
      agentHours: Math.round(entry.agentHours * 100) / 100,
      agentExecutions: entry.agentExecutions,
      tokenBreakdown: entry.tokenBreakdown,
      lastActivity: entry.lastActivity,
    };
  }

  isWithinLimits(tenantId, metric = 'tokens') {
    const entry = this._getOrCreate(tenantId);
    const plan = entry.plan || 'cloud';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.cloud;

    switch (metric) {
      case 'tokens': return entry.tokens < limits.tokensPerMonth;
      case 'apiCalls': return entry.apiCalls < limits.apiCalls;
      case 'agents': return (entry.activeAgents || 0) < limits.agents;
      default: return true;
    }
  }

  setPlan(tenantId, plan) {
    const entry = this._getOrCreate(tenantId);
    entry.plan = plan;
    logger.info(`[Metering] Tenant ${tenantId} plan set to ${plan}`);
  }

  resetPeriod(tenantId) {
    const entry = this._getOrCreate(tenantId);
    const plan = entry.plan;
    this.usage.set(tenantId, this._createEntry(plan));
    logger.info(`[Metering] Usage reset for tenant ${tenantId}`);
  }

  getStats() {
    return {
      trackedTenants: this.usage.size,
      totalTokens: [...this.usage.values()].reduce((sum, e) => sum + e.tokens, 0),
      totalApiCalls: [...this.usage.values()].reduce((sum, e) => sum + e.apiCalls, 0),
    };
  }

  _getOrCreate(tenantId) {
    if (!this.usage.has(tenantId)) {
      this.usage.set(tenantId, this._createEntry());
    }
    return this.usage.get(tenantId);
  }

  _createEntry(plan = 'cloud') {
    return {
      plan,
      tokens: 0,
      tokenBreakdown: {},
      apiCalls: 0,
      agentHours: 0,
      agentExecutions: 0,
      activeAgents: 0,
      lastActivity: null,
      warned90: false,
      warned100: false,
    };
  }

  _currentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}

export const usageMetering = new UsageMetering();
