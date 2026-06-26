/**
 * Copyright (c) 2024 Inso Code
 *
 * COST ANALYTICS DASHBOARD API (Phase 57)
 *
 * Financial intelligence for agent operations:
 *   - Per-agent cost tracking (tokens, compute, storage)
 *   - Per-tenant cost breakdown & attribution
 *   - Trend analysis (daily, weekly, monthly)
 *   - Budget alerts and limits
 *   - ROI calculations per agent
 *   - Cost forecasting
 *   - Department-level cost allocation
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════
// Cost Constants
// ═══════════════════════════════════════════════

const COST_CATEGORIES = {
  tokens: { unit: 'token', description: 'LLM token consumption' },
  compute: { unit: 'minute', description: 'CPU/GPU compute time' },
  storage: { unit: 'GB', description: 'Data storage usage' },
  network: { unit: 'GB', description: 'Network transfer' },
  api: { unit: 'call', description: 'External API calls' },
};

const DEFAULT_RATES = {
  tokens: 0.00003, // $0.03 per 1K tokens
  compute: 0.002, // $0.002 per minute
  storage: 0.023, // $0.023 per GB/month
  network: 0.085, // $0.085 per GB
  api: 0.001, // $0.001 per call
};

class CostAnalytics {
  constructor() {
    this.records = []; // Cost events
    this.budgets = new Map(); // tenantId → budget config
    this.alerts = [];
    this.stats = { totalRecords: 0, totalCost: 0 };
  }

  // ── Record Cost Event ──

  recordCost(event) {
    const {
      tenantId,
      agentName,
      category,
      quantity,
      department = 'general',
      metadata = {},
    } = event;

    const rate = DEFAULT_RATES[category] || 0;
    const cost = quantity * rate;

    const record = {
      id: `cost_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      tenantId,
      agentName,
      category,
      quantity,
      rate,
      cost: Math.round(cost * 1000000) / 1000000,
      department,
      metadata,
      timestamp: new Date().toISOString(),
    };

    this.records.push(record);
    this.stats.totalRecords++;
    this.stats.totalCost += record.cost;

    // Check budget
    this._checkBudget(tenantId, record.cost);

    return record;
  }

  // ── Budget Management ──

  setBudget(tenantId, config) {
    this.budgets.set(tenantId, {
      monthly: config.monthly || 10000,
      alertThreshold: config.alertThreshold || 0.8,
      hardLimit: config.hardLimit || false,
      department: config.department || null,
      setAt: new Date().toISOString(),
    });
    return { tenantId, ...this.budgets.get(tenantId) };
  }

  getBudgetStatus(tenantId) {
    const budget = this.budgets.get(tenantId);
    if (!budget) return { hasBudget: false };

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const spent = this.records
      .filter(
        r => r.tenantId === tenantId && new Date(r.timestamp) >= monthStart,
      )
      .reduce((s, r) => s + r.cost, 0);

    const usage = spent / budget.monthly;

    return {
      hasBudget: true,
      monthly: budget.monthly,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round((budget.monthly - spent) * 100) / 100,
      usagePercent: Math.round(usage * 100),
      status:
        usage >= 1
          ? 'EXCEEDED'
          : usage >= budget.alertThreshold
            ? 'WARNING'
            : 'OK',
    };
  }

  // ── Cost Breakdown ──

  getByTenant(tenantId, options = {}) {
    let records = this.records.filter(r => r.tenantId === tenantId);
    if (options.from)
      records = records.filter(
        r => new Date(r.timestamp) >= new Date(options.from),
      );
    if (options.to)
      records = records.filter(
        r => new Date(r.timestamp) <= new Date(options.to),
      );

    const byCategory = {};
    const byAgent = {};
    let total = 0;

    for (const r of records) {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.cost;
      byAgent[r.agentName] = (byAgent[r.agentName] || 0) + r.cost;
      total += r.cost;
    }

    return {
      tenantId,
      totalCost: Math.round(total * 100) / 100,
      records: records.length,
      byCategory,
      byAgent,
      topAgents: Object.entries(byAgent)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, cost]) => ({ name, cost: Math.round(cost * 100) / 100 })),
    };
  }

  getByAgent(agentName) {
    const records = this.records.filter(r => r.agentName === agentName);
    const total = records.reduce((s, r) => s + r.cost, 0);
    const avgPerDispatch = records.length > 0 ? total / records.length : 0;

    return {
      agentName,
      totalCost: Math.round(total * 100) / 100,
      dispatches: records.length,
      avgCostPerDispatch: Math.round(avgPerDispatch * 10000) / 10000,
      byCategory: this._groupBy(records, 'category'),
    };
  }

  // ── Trend Analysis ──

  getTrends(tenantId, period = 'daily') {
    const records = tenantId
      ? this.records.filter(r => r.tenantId === tenantId)
      : this.records;
    const buckets = {};

    for (const r of records) {
      const date = new Date(r.timestamp);
      let key;
      if (period === 'daily') key = date.toISOString().split('T')[0];
      else if (period === 'weekly')
        key = `W${Math.ceil(date.getDate() / 7)}-${date.getFullYear()}-${date.getMonth() + 1}`;
      else
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!buckets[key]) buckets[key] = { cost: 0, records: 0 };
      buckets[key].cost += r.cost;
      buckets[key].records++;
    }

    return {
      period,
      trends: Object.entries(buckets).map(([date, data]) => ({
        date,
        cost: Math.round(data.cost * 100) / 100,
        records: data.records,
      })),
    };
  }

  // ── ROI Calculation ──

  calculateROI(agentName, revenueGenerated) {
    const agentCost = this.getByAgent(agentName);
    const roi =
      agentCost.totalCost > 0
        ? ((revenueGenerated - agentCost.totalCost) / agentCost.totalCost) * 100
        : 0;

    return {
      agentName,
      cost: agentCost.totalCost,
      revenue: revenueGenerated,
      profit: Math.round((revenueGenerated - agentCost.totalCost) * 100) / 100,
      roi: `${Math.round(roi)}%`,
    };
  }

  // ── Internal ──

  _checkBudget(tenantId, newCost) {
    const budget = this.budgets.get(tenantId);
    if (!budget) return;
    const status = this.getBudgetStatus(tenantId);
    if (status.status === 'WARNING' || status.status === 'EXCEEDED') {
      this.alerts.push({
        tenantId,
        status: status.status,
        spent: status.spent,
        budget: budget.monthly,
        timestamp: new Date().toISOString(),
      });
    }
  }

  _groupBy(records, field) {
    const groups = {};
    for (const r of records)
      groups[r[field]] = (groups[r[field]] || 0) + r.cost;
    return groups;
  }

  getAlerts(tenantId) {
    if (tenantId) return this.alerts.filter(a => a.tenantId === tenantId);
    return this.alerts;
  }

  getStats() {
    return {
      totalRecords: this.stats.totalRecords,
      totalCost: Math.round(this.stats.totalCost * 100) / 100,
      budgets: this.budgets.size,
      alerts: this.alerts.length,
      categories: Object.keys(COST_CATEGORIES).length,
      rates: DEFAULT_RATES,
    };
  }
}

export const costAnalytics = new CostAnalytics();
export { COST_CATEGORIES, DEFAULT_RATES };
