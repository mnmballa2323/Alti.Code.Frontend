/**
 * Copyright (c) 2024 Inso Code
 * 
 * TENANT SERVICE — Multi-Tenant Isolation
 * 
 * Every S&P 500 company is a tenant with:
 *   - Isolated data scope
 *   - Configurable quotas (AI tokens, requests, agents)
 *   - Compliance profiles (HIPAA, PCI-DSS, SOX, FedRAMP)  
 *   - GCP region pinning for data residency
 *   - Billing and usage tracking
 */

import { logger } from '../../../shared/logger.js';

// ── Compliance Profiles ──
const COMPLIANCE_PROFILES = {
    STANDARD: { label: 'Standard', regulations: [] },
    SOX: { label: 'Sarbanes-Oxley', regulations: ['sox'], auditRetention: 2555 }, // 7 years
    HIPAA: { label: 'HIPAA', regulations: ['hipaa'], auditRetention: 2190, encryption: 'AES-256', baa: true },
    PCI_DSS: { label: 'PCI-DSS', regulations: ['pci-dss'], auditRetention: 365, encryption: 'AES-256', tokenization: true },
    FEDRAMP: { label: 'FedRAMP', regulations: ['fedramp', 'nist-800-53'], auditRetention: 1095, fips: true },
    GDPR: { label: 'GDPR', regulations: ['gdpr'], auditRetention: 1825, dataMinimization: true, rightToErasure: true },
    COMBINED: { label: 'Full Enterprise', regulations: ['sox', 'hipaa', 'pci-dss', 'gdpr'], auditRetention: 2555 },
};

// ── Plan Tiers ──
const PLANS = {
    STARTER: {
        name: 'Starter',
        maxUsers: 10,
        maxAgents: 20,
        requestsPerMinute: 100,
        tokensPerMonth: 1_000_000,
        workflows: 10,
        support: 'community',
    },
    PROFESSIONAL: {
        name: 'Professional',
        maxUsers: 100,
        maxAgents: 72,
        requestsPerMinute: 500,
        tokensPerMonth: 10_000_000,
        workflows: 100,
        support: 'business',
    },
    ENTERPRISE: {
        name: 'Enterprise',
        maxUsers: 10000,
        maxAgents: 115,
        requestsPerMinute: 5000,
        tokensPerMonth: 100_000_000,
        workflows: -1, // unlimited
        support: 'dedicated',
        sla: '99.9%',
    },
    SP500: {
        name: 'S&P 500',
        maxUsers: -1,     // unlimited
        maxAgents: -1,    // unlimited
        requestsPerMinute: 50000,
        tokensPerMonth: -1, // unlimited (pay-as-you-go)
        workflows: -1,
        support: 'white-glove',
        sla: '99.99%',
        dedicatedInfra: true,
    },
};

class TenantService {
    constructor() {
        /** @type {Map<string, object>} In-memory tenant registry (production: Firestore) */
        this.tenants = new Map();
        this._seedDefaults();
    }

    /** Seed the default tenant for development */
    _seedDefaults() {
        this.register({
            id: 'default',
            name: 'Inso Code (Dev)',
            plan: 'ENTERPRISE',
            region: 'us-central1',
            compliance: ['STANDARD'],
            owner: 'admin@alti.code.studio',
        });
    }

    /**
     * Register a new tenant
     * @param {object} config - Tenant configuration
     * @returns {object} - The registered tenant
     */
    register(config) {
        const plan = PLANS[config.plan] || PLANS.STARTER;
        const complianceProfiles = (config.compliance || ['STANDARD'])
            .map(c => COMPLIANCE_PROFILES[c])
            .filter(Boolean);

        const tenant = {
            id: config.id,
            name: config.name,
            plan: config.plan,
            region: config.region || 'us-central1',
            status: 'active',
            quotas: {
                maxUsers: plan.maxUsers,
                maxAgents: plan.maxAgents,
                requestsPerMinute: plan.requestsPerMinute,
                tokensPerMonth: plan.tokensPerMonth,
                workflows: plan.workflows,
            },
            compliance: complianceProfiles,
            sla: plan.sla || null,
            support: plan.support,
            dedicatedInfra: plan.dedicatedInfra || false,
            owner: config.owner,
            usage: {
                currentMonthTokens: 0,
                currentMonthRequests: 0,
                activeUsers: 0,
                activeWorkflows: 0,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.tenants.set(config.id, tenant);
        logger.info(`🏢 TenantService: Registered "${tenant.name}" [${tenant.plan}] in ${tenant.region}`);
        return tenant;
    }

    async resolve(tenantId) {
        let tenant = this.tenants.get(tenantId);
        if (!tenant && tenantId) {
            // Dynamically register tenant in development/offline mode so it resolves
            tenant = this.register({
                id: tenantId,
                name: `Workspace - ${tenantId.substring(0, 8)}`,
                plan: 'ENTERPRISE',
                region: 'us-central1',
            });
        }
        return tenant || null;
    }

    /**
     * Track usage for a tenant
     * @param {string} tenantId
     * @param {object} usage - { tokens, requests }
     */
    trackUsage(tenantId, { tokens = 0, requests = 1 } = {}) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) return;

        tenant.usage.currentMonthTokens += tokens;
        tenant.usage.currentMonthRequests += requests;
        tenant.updatedAt = new Date().toISOString();

        // Check quota limits
        if (tenant.quotas.tokensPerMonth > 0 && tenant.usage.currentMonthTokens > tenant.quotas.tokensPerMonth) {
            logger.warn(`⚠️ TenantService: "${tenant.name}" exceeded token quota`);
        }
    }

    /**
     * Suspend a tenant
     * @param {string} tenantId
     * @param {string} reason
     */
    suspend(tenantId, reason) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) return;
        tenant.status = 'suspended';
        tenant.suspendedReason = reason;
        tenant.updatedAt = new Date().toISOString();
        logger.warn(`🚫 TenantService: Suspended "${tenant.name}" — ${reason}`);
    }

    /** List all tenants */
    list() {
        return Array.from(this.tenants.values());
    }

    /** Get tenant count */
    get count() {
        return this.tenants.size;
    }
}

export const tenantService = new TenantService();
export { PLANS, COMPLIANCE_PROFILES };
