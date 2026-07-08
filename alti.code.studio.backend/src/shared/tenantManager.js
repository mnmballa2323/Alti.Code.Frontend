/**
 * Tenant Manager
 * 
 * Enterprise multi-tenancy:
 * - Tenant CRUD with plan management
 * - Tenant isolation enforcement
 * - Feature flags per tenant
 * - Resource quota management
 * - Tenant lifecycle (trial → active → suspended → archived)
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { auditLogger } from './auditLogger.js';
import { usageMetering } from './usageMetering.js';
import crypto from 'crypto';

const TENANT_STATES = ['trial', 'active', 'suspended', 'archived'];

const PLAN_FEATURES = {
  cloud: {
    sso: false, scim: false, customDomain: false, auditExport: false,
    prioritySupport: false, dedicatedInfra: false, aiGuardrails: true,
  },
  dedicated: {
    sso: true, scim: true, customDomain: true, auditExport: true,
    prioritySupport: true, dedicatedInfra: false, aiGuardrails: true,
  },
  sovereign: {
    sso: true, scim: true, customDomain: true, auditExport: true,
    prioritySupport: true, dedicatedInfra: true, aiGuardrails: true,
  },
};

class TenantManager {
  constructor() {
    this.tenants = new Map();
  }

  async createTenant(config) {
    const { name, domain, plan = 'cloud', adminEmail, industry } = config;
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const tenant = {
      id: tenantId,
      name,
      domain,
      plan,
      industry,
      state: 'trial',
      features: { ...PLAN_FEATURES[plan] },
      adminEmail,
      createdAt: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      memberCount: 1,
      settings: {},
    };

    this.tenants.set(tenantId, tenant);
    usageMetering.setPlan(tenantId, plan);

    await auditLogger.log({
      action: 'tenant.created',
      actor: { id: 'system', email: adminEmail },
      resource: { type: 'tenant', id: tenantId },
      result: 'success',
      tenantId,
    });

    metrics.incrementCounter('tenants_created', 1, { plan });
    logger.info(`[TenantManager] Created tenant: ${name} (${tenantId}), plan: ${plan}`);
    return tenant;
  }

  async updatePlan(tenantId, newPlan) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);

    const oldPlan = tenant.plan;
    tenant.plan = newPlan;
    tenant.features = { ...PLAN_FEATURES[newPlan] };
    usageMetering.setPlan(tenantId, newPlan);

    await auditLogger.log({
      action: 'tenant.plan_changed',
      actor: { id: 'system' },
      resource: { type: 'tenant', id: tenantId },
      result: 'success',
      metadata: { from: oldPlan, to: newPlan },
      tenantId,
    });

    logger.info(`[TenantManager] Plan changed: ${tenantId} ${oldPlan} → ${newPlan}`);
    return tenant;
  }

  async updateState(tenantId, newState) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);
    if (!TENANT_STATES.includes(newState)) throw new Error(`Invalid state: ${newState}`);

    const oldState = tenant.state;
    tenant.state = newState;

    await auditLogger.log({
      action: 'tenant.state_changed',
      actor: { id: 'system' },
      resource: { type: 'tenant', id: tenantId },
      result: 'success',
      metadata: { from: oldState, to: newState },
      tenantId,
    });

    return tenant;
  }

  getTenant(tenantId) {
    return this.tenants.get(tenantId) || null;
  }

  listTenants(filters = {}) {
    let tenants = Array.from(this.tenants.values());
    if (filters.plan) tenants = tenants.filter(t => t.plan === filters.plan);
    if (filters.state) tenants = tenants.filter(t => t.state === filters.state);
    return tenants;
  }

  hasFeature(tenantId, feature) {
    const tenant = this.tenants.get(tenantId);
    return tenant?.features?.[feature] || false;
  }

  getStats() {
    const tenants = Array.from(this.tenants.values());
    return {
      total: tenants.length,
      byPlan: { cloud: tenants.filter(t => t.plan === 'cloud').length, dedicated: tenants.filter(t => t.plan === 'dedicated').length, sovereign: tenants.filter(t => t.plan === 'sovereign').length },
      byState: { trial: tenants.filter(t => t.state === 'trial').length, active: tenants.filter(t => t.state === 'active').length, suspended: tenants.filter(t => t.state === 'suspended').length },
    };
  }

  async impersonateTenant(superAdminId, targetTenantId, reason) {
    const tenant = this.tenants.get(targetTenantId);
    if (!tenant) throw new Error(`Tenant ${targetTenantId} not found`);

    await auditLogger.log({
      action: 'tenant.impersonation_started',
      actor: { id: superAdminId },
      resource: { type: 'tenant', id: targetTenantId },
      metadata: { reason },
      tenantId: targetTenantId,
    });

    return {
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: Date.now() + 3600000,
      tenantId: targetTenantId,
      impersonator: superAdminId,
    };
  }
}

export const tenantManager = new TenantManager();
