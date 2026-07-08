/**
 * Copyright (c) 2024 Inso Code
 *
 * ENTERPRISE ADMIN DASHBOARD CONTROLLER (Phase 37)
 *
 * Unified admin API for Fortune 100 CTO/VP-Eng:
 *   - System overview (clusters, agents, tenants, costs)
 *   - Agent fleet operations (enable/disable, status, metrics)
 *   - Tenant analytics & billing
 *   - Executive summary generator
 *   - Capacity planning projections
 */

import { tenantService } from './tenant.service.js';
import { resultStore } from './result.store.js';
import { complianceEngine } from './compliance.engine.js';
import { eventBus } from './event.bus.js';
import { agentSDK } from './agent.sdk.js';
import { healthChecker, resilientAI } from './resilience.js';
import { enterpriseBridge } from './enterprise.bridge.js';
import { metrics, tracer, dashboard } from './observability.js';
import { multiRegion } from './multi.region.js';
import { logger } from '../../../shared/logger.js';

// ═══════════════════════════════════════════════
// Enterprise Admin Controller
// ═══════════════════════════════════════════════

class AdminDashboardController {
  constructor() {
    this.startTime = Date.now();
  }

  // ═══════════════════════════════
  // System Overview (C-Suite View)
  // ═══════════════════════════════

  getSystemOverview() {
    const mem = process.memoryUsage();
    const bridgeStats = enterpriseBridge.getStats();
    const sdkStats = agentSDK.getStats();
    const eventStats = eventBus.getStats();
    const resultStats = resultStore.getStats();
    const regionStats = multiRegion.getStats();

    return {
      platform: {
        name: 'Inso Code',
        version: '2.0.0-enterprise',
        uptime: Math.round(process.uptime()),
        uptimeFormatted: this._formatUptime(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
      },
      infrastructure: {
        clusters: regionStats,
        memory: {
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
          rss: Math.round(mem.rss / 1024 / 1024),
          unit: 'MB',
        },
      },
      agents: {
        total: sdkStats.totalAgents,
        customAgents: sdkStats.customAgents,
        marketplaceListings: sdkStats.marketplaceListings,
        totalVersions: sdkStats.totalVersions,
      },
      tenants: {
        total: tenantService.count,
        planDistribution: this._getTenantPlanDistribution(),
      },
      operations: {
        totalDispatches: bridgeStats.totalDispatches,
        totalTokensConsumed: bridgeStats.totalTokens,
        piiDetections: bridgeStats.piiDetections,
        failovers: bridgeStats.failovers,
        totalEvents: eventStats.totalPublished,
        complianceScans: bridgeStats.complianceScans,
      },
      compliance: complianceEngine.getStats(),
      observability: {
        tracing: tracer.getStats(),
        metricsCount: this._countMetrics(),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════
  // Agent Fleet Dashboard
  // ═══════════════════════════════

  getAgentFleet() {
    const sdkStats = agentSDK.getStats();
    const customAgents = agentSDK.listCustomAgents
      ? agentSDK.listCustomAgents()
      : [];

    return {
      totalAgents: sdkStats.totalAgents,
      customAgents: customAgents.length,
      marketplace: sdkStats.marketplaceListings,
      versions: sdkStats.totalVersions,
      categories: this._getAgentCategories(),
      recentActivity: tracer.getRecentTraces(20).map(t => ({
        agent: t.metadata?.agentName || t.name,
        duration: t.durationMs,
        status: t.status,
        timestamp: t.endTime ? new Date(t.endTime).toISOString() : null,
      })),
    };
  }

  _getAgentCategories() {
    return {
      code: {
        label: 'Code Quality',
        count: 25,
        examples: ['codeReview', 'debugAgent', 'refactorAgent'],
      },
      security: {
        label: 'Security',
        count: 15,
        examples: ['securityAgent', 'guardianAgent', 'dlpAgent'],
      },
      devops: {
        label: 'DevOps',
        count: 18,
        examples: ['devOpsAgent', 'ciCdAgent', 'iacAgent'],
      },
      ai: {
        label: 'AI/ML',
        count: 12,
        examples: ['geminiAgent', 'claudeAgent', 'gdcAgent'],
      },
      general: {
        label: 'General',
        count: 20,
        examples: ['chatAgent', 'docsAgent', 'searchAgent'],
      },
      enterprise: {
        label: 'Enterprise',
        count: 25,
        examples: ['complianceAgent', 'auditAgent', 'billingAgent'],
      },
    };
  }

  // ═══════════════════════════════
  // Tenant Analytics
  // ═══════════════════════════════

  getTenantAnalytics(tenantId) {
    const tenant = tenantService.get(tenantId);
    if (!tenant) return { error: 'Tenant not found' };

    const costs = resultStore.getCostAttribution(tenantId, {});
    const compliance = complianceEngine.generateReport(tenantId, [
      'sox',
      'hipaa',
      'pci-dss',
      'gdpr',
    ]);
    const events = eventBus.query({ tenantId, limit: 50 });

    return {
      tenant: {
        id: tenantId,
        name: tenant.name,
        plan: tenant.plan,
        region: tenant.region,
        registeredAt: tenant.registeredAt,
      },
      costs,
      compliance: {
        overallScore: compliance.overallScore,
        frameworks: compliance.frameworks,
      },
      recentEvents: events.slice(0, 20),
      usage: {
        totalAgentCalls: costs.total?.requests || 0,
        totalTokens: costs.total?.tokens || 0,
        estimatedCostUSD: costs.total?.estimatedCostUSD || 0,
      },
    };
  }

  _getTenantPlanDistribution() {
    const plans = { starter: 0, professional: 0, enterprise: 0, sp500: 0 };
    for (const tenant of tenantService.list()) {
      const plan = tenant.plan || 'starter';
      if (plans[plan] !== undefined) plans[plan]++;
    }
    return plans;
  }

  // ═══════════════════════════════
  // Executive Summary
  // ═══════════════════════════════

  generateExecutiveSummary() {
    const overview = this.getSystemOverview();
    const sla = dashboard.getSLAReport();
    const dr = multiRegion.getDisasterRecoveryStatus();

    return {
      title: 'Inso Code — Enterprise Executive Summary',
      generatedAt: new Date().toISOString(),
      keyMetrics: {
        systemUptime: overview.platform.uptimeFormatted,
        slaAvailability: sla.availability,
        slaTarget: sla.slaTarget,
        slaViolation: sla.slaViolation,
        totalAgents: overview.agents.total,
        totalTenants: overview.tenants.total,
        totalDispatches: overview.operations.totalDispatches,
        estimatedMonthlyCost: `$${(overview.operations.totalTokensConsumed * 0.00001).toFixed(2)}`,
      },
      security: {
        piiDetections: overview.operations.piiDetections,
        complianceFrameworks: ['SOX', 'HIPAA', 'PCI-DSS', 'GDPR', 'FedRAMP'],
        encryptionStandard: 'AES-256-GCM + HSM',
        auditRetention: '7 years (SOX)',
      },
      infrastructure: {
        clusters: dr.clusters?.length || 0,
        failoverMode: overview.infrastructure.clusters.failoverMode,
        rtoTarget: dr.rtoTarget,
        rpoTarget: dr.rpoTarget,
        totalFailovers: dr.totalFailovers,
      },
      recommendations: this._generateRecommendations(overview, sla),
    };
  }

  _generateRecommendations(overview, sla) {
    const recs = [];

    if (parseFloat(sla.availability) < 99.99) {
      recs.push({
        severity: 'HIGH',
        category: 'SLA',
        message: `Current availability ${sla.availability} is below 99.99% target. Review error rates and add capacity.`,
      });
    }

    if (overview.operations.piiDetections > 0) {
      recs.push({
        severity: 'MEDIUM',
        category: 'SECURITY',
        message: `${overview.operations.piiDetections} PII detections logged. Review data handling procedures.`,
      });
    }

    if (overview.infrastructure.clusters.totalClusters < 2) {
      recs.push({
        severity: 'HIGH',
        category: 'INFRASTRUCTURE',
        message:
          'Running on single cluster. Deploy to at least 2 regions for HA.',
      });
    }

    if (recs.length === 0) {
      recs.push({
        severity: 'INFO',
        category: 'GENERAL',
        message:
          'System is operating within all target parameters. No action required.',
      });
    }

    return recs;
  }

  // ═══════════════════════════════
  // Capacity Planning
  // ═══════════════════════════════

  getCapacityProjections() {
    const bridgeStats = enterpriseBridge.getStats();
    const uptime = process.uptime();
    const dispatchesPerHour =
      uptime > 0
        ? Math.round(bridgeStats.totalDispatches / (uptime / 3600))
        : 0;
    const tokensPerHour =
      uptime > 0 ? Math.round(bridgeStats.totalTokens / (uptime / 3600)) : 0;

    return {
      current: {
        dispatchesPerHour,
        tokensPerHour,
        estimatedDailyCostUSD: (tokensPerHour * 24 * 0.00001).toFixed(2),
      },
      projections: {
        '30_days': {
          dispatches: dispatchesPerHour * 24 * 30,
          tokens: tokensPerHour * 24 * 30,
          estimatedCostUSD: (tokensPerHour * 24 * 30 * 0.00001).toFixed(2),
        },
        '90_days': {
          dispatches: dispatchesPerHour * 24 * 90,
          tokens: tokensPerHour * 24 * 90,
          estimatedCostUSD: (tokensPerHour * 24 * 90 * 0.00001).toFixed(2),
        },
        '365_days': {
          dispatches: dispatchesPerHour * 24 * 365,
          tokens: tokensPerHour * 24 * 365,
          estimatedCostUSD: (tokensPerHour * 24 * 365 * 0.00001).toFixed(2),
        },
      },
      recommendations: this._getCapacityRecommendations(dispatchesPerHour),
    };
  }

  _getCapacityRecommendations(dph) {
    if (dph > 10000)
      return [
        {
          action: 'SCALE_UP',
          message: 'Consider adding worker nodes. >10K dispatches/hour.',
        },
      ];
    if (dph > 5000)
      return [
        {
          action: 'MONITOR',
          message: 'Approaching capacity threshold. Monitor closely.',
        },
      ];
    return [{ action: 'NONE', message: 'Current capacity is sufficient.' }];
  }

  // ═══════════════════════════════
  // Utilities
  // ═══════════════════════════════

  _formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    return parts.join(' ');
  }

  _countMetrics() {
    const json = metrics.toJSON();
    return (
      Object.keys(json.counters).length +
      Object.keys(json.gauges).length +
      Object.keys(json.histograms).length
    );
  }
}

export const adminDashboard = new AdminDashboardController();
