/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * TENANT QUOTA & USAGE METERING (Phase 45)
 * 
 * Per-tenant resource management:
 *   - Resource quotas (agents, tokens, storage, concurrent jobs, API calls)
 *   - Real-time usage metering with sliding windows
 *   - Overage detection + automatic alerts
 *   - Billing period tracking (monthly cycles)
 *   - Invoice generation with line-item breakdown
 *   - Usage forecasting based on consumption trends
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════
// Quota Definitions by Plan
// ═══════════════════════════════════════════════

const PLAN_QUOTAS = {
    starter: {
        agents: 10,
        tokensPerMonth: 1_000_000,
        storageGb: 5,
        concurrentJobs: 5,
        apiCallsPerMonth: 50_000,
        webhooks: 3,
        customAgents: 0,
        dataRetentionDays: 30,
    },
    professional: {
        agents: 50,
        tokensPerMonth: 10_000_000,
        storageGb: 50,
        concurrentJobs: 25,
        apiCallsPerMonth: 500_000,
        webhooks: 10,
        customAgents: 5,
        dataRetentionDays: 90,
    },
    enterprise: {
        agents: 200,
        tokensPerMonth: 100_000_000,
        storageGb: 500,
        concurrentJobs: 100,
        apiCallsPerMonth: 5_000_000,
        webhooks: 50,
        customAgents: 50,
        dataRetentionDays: 365,
    },
    sp500: {
        agents: Infinity,
        tokensPerMonth: Infinity,
        storageGb: 5000,
        concurrentJobs: 500,
        apiCallsPerMonth: Infinity,
        webhooks: Infinity,
        customAgents: Infinity,
        dataRetentionDays: 2555,
    },
};

// ═══════════════════════════════════════════════
// Usage Metering Engine
// ═══════════════════════════════════════════════

class QuotaMeter {
    constructor() {
        this.tenantUsage = new Map();     // tenantId → usage
        this.billingPeriods = new Map();   // tenantId → billingData
        this.overageAlerts = [];
        this.invoices = [];
        this.stats = { totalMetered: 0, totalOverages: 0, totalInvoices: 0 };
    }

    // ── Initialize Tenant Metering ──

    initTenant(tenantId, plan = 'starter') {
        const quotas = PLAN_QUOTAS[plan] || PLAN_QUOTAS.starter;

        const usage = {
            tenantId,
            plan,
            quotas: { ...quotas },
            current: {
                agents: 0,
                tokensUsed: 0,
                storageUsedGb: 0,
                activeJobs: 0,
                apiCalls: 0,
                webhooksConfigured: 0,
                customAgentsDeployed: 0,
            },
            periodStart: new Date().toISOString(),
            periodEnd: this._nextBillingDate().toISOString(),
            lastUpdated: new Date().toISOString(),
        };

        this.tenantUsage.set(tenantId, usage);

        this.billingPeriods.set(tenantId, {
            currentPeriod: this._billingPeriodKey(),
            history: [],
            overageCharges: 0,
        });

        logger.info(`📊 Quota initialized: ${tenantId} (${plan})`);
        return usage;
    }

    // ── Record Usage ──

    recordUsage(tenantId, resource, amount = 1) {
        let usage = this.tenantUsage.get(tenantId);
        if (!usage) {
            usage = this.initTenant(tenantId);
        }

        const resourceMap = {
            agents: 'agents',
            tokens: 'tokensUsed',
            storage: 'storageUsedGb',
            jobs: 'activeJobs',
            api_calls: 'apiCalls',
            webhooks: 'webhooksConfigured',
            custom_agents: 'customAgentsDeployed',
        };

        const field = resourceMap[resource];
        if (!field) throw new Error(`Unknown resource: ${resource}`);

        usage.current[field] += amount;
        usage.lastUpdated = new Date().toISOString();
        this.stats.totalMetered++;

        // Check for overage
        const quotaField = this._quotaFieldMap(resource);
        const limit = usage.quotas[quotaField];
        const current = usage.current[field];

        if (limit !== Infinity && current > limit) {
            this._triggerOverage(tenantId, resource, current, limit);
        } else if (limit !== Infinity && current > limit * 0.8) {
            this._triggerWarning(tenantId, resource, current, limit);
        }

        return {
            resource,
            current,
            limit,
            percentUsed: limit !== Infinity ? Math.round(current / limit * 100) : 0,
            remaining: limit !== Infinity ? Math.max(0, limit - current) : Infinity,
        };
    }

    // ── Release Usage (e.g., job completes) ──

    releaseUsage(tenantId, resource, amount = 1) {
        const usage = this.tenantUsage.get(tenantId);
        if (!usage) return;

        const resourceMap = { jobs: 'activeJobs', agents: 'agents' };
        const field = resourceMap[resource];
        if (field) {
            usage.current[field] = Math.max(0, usage.current[field] - amount);
        }
    }

    // ── Check Quota ──

    checkQuota(tenantId, resource) {
        const usage = this.tenantUsage.get(tenantId);
        if (!usage) return { allowed: true, reason: 'No metering initialized' };

        const resourceMap = {
            agents: { field: 'agents', quota: 'agents' },
            tokens: { field: 'tokensUsed', quota: 'tokensPerMonth' },
            storage: { field: 'storageUsedGb', quota: 'storageGb' },
            jobs: { field: 'activeJobs', quota: 'concurrentJobs' },
            api_calls: { field: 'apiCalls', quota: 'apiCallsPerMonth' },
            webhooks: { field: 'webhooksConfigured', quota: 'webhooks' },
            custom_agents: { field: 'customAgentsDeployed', quota: 'customAgents' },
        };

        const mapping = resourceMap[resource];
        if (!mapping) return { allowed: true };

        const current = usage.current[mapping.field];
        const limit = usage.quotas[mapping.quota];

        return {
            allowed: limit === Infinity || current < limit,
            resource,
            current,
            limit,
            percentUsed: limit !== Infinity ? Math.round(current / limit * 100) : 0,
            remaining: limit !== Infinity ? Math.max(0, limit - current) : Infinity,
        };
    }

    // ── Express Middleware ──

    middleware(resource) {
        return (req, res, next) => {
            const tenantId = req.tenantId || 'anonymous';
            const check = this.checkQuota(tenantId, resource);

            if (!check.allowed) {
                return res.status(402).json({
                    error: 'Quota exceeded',
                    resource,
                    current: check.current,
                    limit: check.limit,
                    upgrade: 'Contact sales@alticode.studio for plan upgrade',
                });
            }

            // Auto-record usage
            this.recordUsage(tenantId, resource);
            next();
        };
    }

    // ── Usage Dashboard ──

    getUsageDashboard(tenantId) {
        const usage = this.tenantUsage.get(tenantId);
        if (!usage) return null;

        const dashboard = { tenantId, plan: usage.plan, periodStart: usage.periodStart, periodEnd: usage.periodEnd, resources: {} };

        const fields = [
            { key: 'agents', label: 'Active Agents', quota: 'agents' },
            { key: 'tokensUsed', label: 'Tokens Used', quota: 'tokensPerMonth' },
            { key: 'storageUsedGb', label: 'Storage (GB)', quota: 'storageGb' },
            { key: 'activeJobs', label: 'Concurrent Jobs', quota: 'concurrentJobs' },
            { key: 'apiCalls', label: 'API Calls', quota: 'apiCallsPerMonth' },
            { key: 'webhooksConfigured', label: 'Webhooks', quota: 'webhooks' },
            { key: 'customAgentsDeployed', label: 'Custom Agents', quota: 'customAgents' },
        ];

        for (const f of fields) {
            const current = usage.current[f.key];
            const limit = usage.quotas[f.quota];
            dashboard.resources[f.key] = {
                label: f.label,
                current,
                limit: limit === Infinity ? 'Unlimited' : limit,
                percentUsed: limit !== Infinity ? Math.round(current / limit * 100) : 0,
                status: limit === Infinity ? 'UNLIMITED' : current >= limit ? 'EXCEEDED' : current >= limit * 0.8 ? 'WARNING' : 'OK',
            };
        }

        return dashboard;
    }

    // ── Invoice Generation ──

    generateInvoice(tenantId) {
        const usage = this.tenantUsage.get(tenantId);
        if (!usage) throw new Error(`Tenant not found: ${tenantId}`);

        const pricing = {
            starter: { base: 99, tokenRate: 0.002, storageRate: 1, apiRate: 0.001 },
            professional: { base: 499, tokenRate: 0.0015, storageRate: 0.8, apiRate: 0.0005 },
            enterprise: { base: 2499, tokenRate: 0.001, storageRate: 0.5, apiRate: 0.0002 },
            sp500: { base: 9999, tokenRate: 0.0008, storageRate: 0.3, apiRate: 0.0001 },
        };

        const rate = pricing[usage.plan] || pricing.starter;

        const tokenOverage = Math.max(0, usage.current.tokensUsed - usage.quotas.tokensPerMonth);
        const storageOverage = Math.max(0, usage.current.storageUsedGb - usage.quotas.storageGb);
        const apiOverage = Math.max(0, usage.current.apiCalls - (usage.quotas.apiCallsPerMonth === Infinity ? Infinity : usage.quotas.apiCallsPerMonth));

        const lineItems = [
            { description: `${usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)} Plan - Base`, amount: rate.base },
        ];

        if (tokenOverage > 0) {
            lineItems.push({ description: `Token Overage (${tokenOverage.toLocaleString()} tokens)`, amount: Math.round(tokenOverage * rate.tokenRate * 100) / 100 });
        }
        if (storageOverage > 0) {
            lineItems.push({ description: `Storage Overage (${storageOverage} GB)`, amount: Math.round(storageOverage * rate.storageRate * 100) / 100 });
        }
        if (apiOverage > 0 && isFinite(apiOverage)) {
            lineItems.push({ description: `API Call Overage (${apiOverage.toLocaleString()} calls)`, amount: Math.round(apiOverage * rate.apiRate * 100) / 100 });
        }

        const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

        const invoice = {
            id: `inv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            tenantId,
            plan: usage.plan,
            period: { start: usage.periodStart, end: usage.periodEnd },
            lineItems,
            subtotal: total,
            tax: Math.round(total * 0.0875 * 100) / 100, // 8.75% default
            total: Math.round(total * 1.0875 * 100) / 100,
            currency: 'USD',
            status: 'DRAFT',
            generatedAt: new Date().toISOString(),
        };

        this.invoices.push(invoice);
        this.stats.totalInvoices++;
        return invoice;
    }

    // ── Usage Forecast ──

    forecast(tenantId) {
        const usage = this.tenantUsage.get(tenantId);
        if (!usage) return null;

        const now = Date.now();
        const periodStart = new Date(usage.periodStart).getTime();
        const periodEnd = new Date(usage.periodEnd).getTime();
        const elapsed = now - periodStart;
        const total = periodEnd - periodStart;
        const progress = elapsed / total;

        if (progress <= 0) return null;

        const projections = {};
        const fields = { tokensUsed: 'tokensPerMonth', apiCalls: 'apiCallsPerMonth' };

        for (const [field, quota] of Object.entries(fields)) {
            const current = usage.current[field];
            const projected = Math.round(current / progress);
            const limit = usage.quotas[quota];

            projections[field] = {
                current,
                projected,
                limit: limit === Infinity ? 'Unlimited' : limit,
                willExceed: limit !== Infinity && projected > limit,
                projectedOverage: limit !== Infinity ? Math.max(0, projected - limit) : 0,
            };
        }

        return { tenantId, periodProgress: `${Math.round(progress * 100)}%`, projections };
    }

    // ── Internal ──

    _quotaFieldMap(resource) {
        const map = { agents: 'agents', tokens: 'tokensPerMonth', storage: 'storageGb', jobs: 'concurrentJobs', api_calls: 'apiCallsPerMonth', webhooks: 'webhooks', custom_agents: 'customAgents' };
        return map[resource];
    }

    _triggerOverage(tenantId, resource, current, limit) {
        const alert = { type: 'OVERAGE', tenantId, resource, current, limit, severity: 'CRITICAL', timestamp: new Date().toISOString() };
        this.overageAlerts.push(alert);
        this.stats.totalOverages++;
        logger.warn(`🚨 Quota exceeded: ${tenantId} ${resource} ${current}/${limit}`);
    }

    _triggerWarning(tenantId, resource, current, limit) {
        const alert = { type: 'WARNING', tenantId, resource, current, limit, severity: 'WARNING', timestamp: new Date().toISOString() };
        this.overageAlerts.push(alert);
    }

    _nextBillingDate() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    _billingPeriodKey() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    getAlerts(tenantId) {
        let alerts = [...this.overageAlerts];
        if (tenantId) alerts = alerts.filter(a => a.tenantId === tenantId);
        return alerts;
    }

    getStats() {
        return {
            tenantsMetered: this.tenantUsage.size,
            totalMetered: this.stats.totalMetered,
            totalOverages: this.stats.totalOverages,
            totalInvoices: this.stats.totalInvoices,
            plans: Object.keys(PLAN_QUOTAS),
        };
    }
}

export const quotaMeter = new QuotaMeter();
export { PLAN_QUOTAS };
