/**
 * Copyright (c) 2024 Inso Code
 *
 * TOKEN METERING & BILLING ENGINE (Phase 59)
 *
 * Owner-level token usage tracking & billing:
 *   - Per-token usage metering at owner/tenant level
 *   - 5 pricing plans with tiered per-token rates
 *   - Real-time cost estimation
 *   - Billing reports (daily, weekly, monthly)
 *   - Prepaid token balance management
 *   - Usage alerts and overage handling
 *   - Invoice generation with line items
 *   - Token consumption analytics (by agent, by model)
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';
import { prisma } from '../../platform/db/prismaClient.js';

// ═══════════════════════════════════════════════
// Token Pricing Plans
// ═══════════════════════════════════════════════

const TOKEN_PRICING_PLANS = {
  free: {
    name: 'Free',
    monthlyTokens: 50_000,
    ratePerToken: 0,
    overage: { allowed: false },
    features: ['basic_agents', 'community_support'],
  },
  starter: {
    name: 'Starter',
    monthlyTokens: 500_000,
    baseCost: 29,
    ratePerToken: 0.00006, // $0.06 per 1K tokens
    overage: { allowed: true, ratePerToken: 0.0001 },
    features: ['all_agents', 'email_support', 'api_access'],
  },
  professional: {
    name: 'Professional',
    monthlyTokens: 5_000_000,
    baseCost: 149,
    ratePerToken: 0.00003, // $0.03 per 1K tokens
    overage: { allowed: true, ratePerToken: 0.00006 },
    features: [
      'all_agents',
      'priority_support',
      'api_access',
      'custom_agents',
      'workflows',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    monthlyTokens: 50_000_000,
    baseCost: 999,
    ratePerToken: 0.00002, // $0.02 per 1K tokens
    overage: { allowed: true, ratePerToken: 0.00004 },
    features: [
      'all_agents',
      'dedicated_support',
      'sla',
      'sso',
      'compliance',
      'multi_region',
    ],
  },
  unlimited: {
    name: 'Unlimited',
    monthlyTokens: Infinity,
    baseCost: 4999,
    ratePerToken: 0.000015, // $0.015 per 1K tokens
    overage: { allowed: true, ratePerToken: 0.000015 },
    features: ['everything', 'white_glove', 'custom_sla', 'on_premise_option'],
  },
};

const MODEL_RATES = {
  'gpt-4o': { input: 0.000005, output: 0.000015 },
  'gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
  'claude-3.5-sonnet': { input: 0.000003, output: 0.000015 },
  'claude-3-opus': { input: 0.000015, output: 0.000075 },
  'gemini-3.1-flash': { input: 0.0000001, output: 0.0000004 },
  'gemini-3.1-pro': { input: 0.00000125, output: 0.000005 },
  'gemini-3.5-flash': { input: 0.000000075, output: 0.0000003 },
  'gemini-3.5-pro': { input: 0.00000125, output: 0.000005 },
  'claude-sonnet-4.6': { input: 0.000003, output: 0.000015 },
  'claude-opus-4.8': { input: 0.000015, output: 0.000075 },
  'claude-fable-5': { input: 0.000015, output: 0.000075 },
  'gpt-5.4-mini': { input: 0.00000015, output: 0.0000006 },
  'gpt-5.4': { input: 0.0000025, output: 0.00001 },
  default: { input: 0.000003, output: 0.000015 },
};

// ═══════════════════════════════════════════════
// Token Billing Engine
// ═══════════════════════════════════════════════

class TokenBillingEngine {
  constructor() {
    this.accounts = new Map(); // tenantId → account
    this.usage = []; // token usage records
    this.invoices = [];
    this.stats = { totalTokensConsumed: 0, totalRevenue: 0, totalAccounts: 0 };
  }

  // ── Account Setup ──

  createAccount(tenantId, plan = 'starter') {
    if (!TOKEN_PRICING_PLANS[plan]) throw new Error(`Unknown plan: ${plan}`);

    const planConfig = TOKEN_PRICING_PLANS[plan];
    const account = {
      id: `billing_${crypto.randomBytes(6).toString('hex')}`,
      tenantId,
      plan,
      planName: planConfig.name,
      monthlyAllowance: planConfig.monthlyTokens,
      tokensUsed: 0,
      tokensRemaining: planConfig.monthlyTokens,
      prepaidBalance: 0,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: this._getMonthEnd(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.accounts.set(tenantId, account);
    this.stats.totalAccounts++;
    logger.info(`💳 Billing account created: ${tenantId} [${planConfig.name}]`);

    return account;
  }

  // ── Token Consumption ──

  consumeTokens(tenantId, event) {
    const account = this.accounts.get(tenantId);
    if (!account) throw new Error(`No billing account for: ${tenantId}`);

    const {
      agentName,
      model = 'default',
      inputTokens = 0,
      outputTokens = 0,
      metadata = {},
    } = event;

    const totalTokens = inputTokens + outputTokens;
    const planConfig = TOKEN_PRICING_PLANS[account.plan];
    const modelRate = MODEL_RATES[model] || MODEL_RATES.default;

    // Calculate cost based on model rates
    const inputCost = inputTokens * modelRate.input;
    const outputCost = outputTokens * modelRate.output;
    const totalCost = inputCost + outputCost;

    // Check allowance
    const isOverage =
      account.tokensUsed + totalTokens > account.monthlyAllowance;
    if (isOverage && !planConfig.overage.allowed) {
      return {
        consumed: false,
        reason: 'Monthly token limit exceeded',
        tokensUsed: account.tokensUsed,
        limit: account.monthlyAllowance,
      };
    }

    // Determine rate (normal vs overage)
    let billedRate = planConfig.ratePerToken;
    let overageTokens = 0;
    if (isOverage) {
      overageTokens = Math.max(
        0,
        account.tokensUsed + totalTokens - account.monthlyAllowance,
      );
      billedRate = planConfig.overage.ratePerToken;
    }

    const record = {
      id: `usage_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      tenantId,
      agentName,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      cost: Math.round(totalCost * 1000000) / 1000000,
      isOverage,
      overageTokens,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.usage.push(record);
    account.tokensUsed += totalTokens;
    account.tokensRemaining = Math.max(
      0,
      account.monthlyAllowance - account.tokensUsed,
    );
    this.stats.totalTokensConsumed += totalTokens;
    this.stats.totalRevenue += totalCost;

    // Async background update to Prisma UserBilling
    (async () => {
      try {
        if (!tenantId.startsWith('default')) {
          await prisma.userBilling.upsert({
            where: { userId: tenantId },
            update: {
              currentSpendUsd: { increment: record.cost },
              tokenBalance: { decrement: totalTokens },
            },
            create: {
              userId: tenantId,
              currentSpendUsd: record.cost,
              tokenBalance: -totalTokens,
            },
          });
        }
      } catch (e) {
        logger.error(`Failed to sync UserBilling to Postgres for user ${tenantId}`, e);
      }
    })();

    return {
      consumed: true,
      usageId: record.id,
      totalTokens,
      cost: record.cost,
      isOverage,
      tokensRemaining: account.tokensRemaining,
      usagePercent: Math.round(
        (account.tokensUsed / account.monthlyAllowance) * 100,
      ),
    };
  }

  // ── Prepaid Balance ──

  addPrepaidTokens(tenantId, amount, tokens) {
    const account = this.accounts.get(tenantId);
    if (!account) throw new Error(`No billing account for: ${tenantId}`);

    account.prepaidBalance += tokens;
    return {
      tenantId,
      amountPaid: amount,
      tokensAdded: tokens,
      totalPrepaid: account.prepaidBalance,
    };
  }

  // ── Real-Time Cost Estimation ──

  estimateCost(tenantId, inputTokens, outputTokens, model = 'default') {
    const account = this.accounts.get(tenantId);
    const modelRate = MODEL_RATES[model] || MODEL_RATES.default;

    const inputCost = inputTokens * modelRate.input;
    const outputCost = outputTokens * modelRate.output;
    const totalCost = inputCost + outputCost;

    const wouldExceed = account
      ? account.tokensUsed + inputTokens + outputTokens >
        account.monthlyAllowance
      : false;

    return {
      estimatedCost: Math.round(totalCost * 1000000) / 1000000,
      inputCost: Math.round(inputCost * 1000000) / 1000000,
      outputCost: Math.round(outputCost * 1000000) / 1000000,
      model,
      wouldExceedAllowance: wouldExceed,
    };
  }

  // ── Usage Analytics ──

  getUsageReport(tenantId, period = 'monthly') {
    let records = this.usage.filter(r => r.tenantId === tenantId);
    const account = this.accounts.get(tenantId);

    const byAgent = {};
    const byModel = {};
    let totalTokens = 0;
    let totalCost = 0;

    for (const r of records) {
      byAgent[r.agentName] = (byAgent[r.agentName] || 0) + r.totalTokens;
      byModel[r.model] = (byModel[r.model] || 0) + r.totalTokens;
      totalTokens += r.totalTokens;
      totalCost += r.cost;
    }

    return {
      tenantId,
      plan: account?.plan || 'unknown',
      period,
      totalTokens,
      totalCost: Math.round(totalCost * 100) / 100,
      allowance: account?.monthlyAllowance || 0,
      usagePercent: account
        ? Math.round((account.tokensUsed / account.monthlyAllowance) * 100)
        : 0,
      byAgent: Object.entries(byAgent)
        .sort((a, b) => b[1] - a[1])
        .map(([name, tokens]) => ({ name, tokens })),
      byModel: Object.entries(byModel)
        .sort((a, b) => b[1] - a[1])
        .map(([name, tokens]) => ({ name, tokens })),
      overageTokens: records
        .filter(r => r.isOverage)
        .reduce((s, r) => s + r.overageTokens, 0),
      records: records.length,
    };
  }

  // ── Invoice Generation ──

  generateInvoice(tenantId) {
    const account = this.accounts.get(tenantId);
    if (!account) throw new Error(`No billing account for: ${tenantId}`);

    const planConfig = TOKEN_PRICING_PLANS[account.plan];
    const usageRecords = this.usage.filter(r => r.tenantId === tenantId);

    const baseCost = planConfig.baseCost || 0;
    const tokenCost = usageRecords.reduce((s, r) => s + r.cost, 0);
    const overageRecords = usageRecords.filter(r => r.isOverage);
    const overageCost = overageRecords.reduce((s, r) => s + r.cost, 0);

    const subtotal = baseCost + tokenCost;
    const tax = Math.round(subtotal * 0.08875 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const invoice = {
      id: `inv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      tenantId,
      plan: planConfig.name,
      period: {
        start: account.currentPeriodStart,
        end: account.currentPeriodEnd,
      },
      lineItems: [
        { description: `${planConfig.name} Plan — Base`, amount: baseCost },
        {
          description: `Token Usage (${account.tokensUsed.toLocaleString()} tokens)`,
          amount: Math.round(tokenCost * 100) / 100,
        },
        ...(overageRecords.length > 0
          ? [
              {
                description: `Overage Tokens`,
                amount: Math.round(overageCost * 100) / 100,
              },
            ]
          : []),
      ],
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      total,
      currency: 'USD',
      status: 'ISSUED',
      issuedAt: new Date().toISOString(),
    };

    this.invoices.push(invoice);
    return invoice;
  }

  // ── Queries ──

  getAccount(tenantId) {
    return this.accounts.get(tenantId) || null;
  }
  listAccounts() {
    return [...this.accounts.values()];
  }
  listPlans() {
    return TOKEN_PRICING_PLANS;
  }
  listModels() {
    return MODEL_RATES;
  }
  getInvoices(tenantId) {
    return this.invoices.filter(i => i.tenantId === tenantId);
  }

  _getMonthEnd() {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }

  getStats() {
    return {
      totalAccounts: this.stats.totalAccounts,
      totalTokensConsumed: this.stats.totalTokensConsumed,
      totalRevenue: Math.round(this.stats.totalRevenue * 100) / 100,
      totalInvoices: this.invoices.length,
      plans: Object.keys(TOKEN_PRICING_PLANS).length,
      models: Object.keys(MODEL_RATES).length,
      usageRecords: this.usage.length,
    };
  }
}

export const tokenBilling = new TokenBillingEngine();
export { TOKEN_PRICING_PLANS, MODEL_RATES };
