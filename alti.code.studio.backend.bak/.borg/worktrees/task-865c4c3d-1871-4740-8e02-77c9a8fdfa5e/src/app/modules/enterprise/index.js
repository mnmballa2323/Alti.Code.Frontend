/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * ENTERPRISE MODULE INDEX
 * 
 * The unified entry point for all S&P 500 enterprise infrastructure.
 * Import this single module to get access to every enterprise feature.
 */

// ── Phase 26: Enterprise Auth & Tenant Isolation ──
export { enterpriseSSO, ROLES, PERMISSIONS, GCP_REGIONS } from './sso.provider.js';
export { rbac, enforceResidency, rateLimiter } from './rbac.middleware.js';
export { tenantService, PLANS, COMPLIANCE_PROFILES } from './tenant.service.js';

// ── Phase 27: Observability & Cost Attribution ──
export { resultStore } from './result.store.js';

// ── Phase 28: Resilience & SLA Infrastructure ──
export { resilientAI, healthChecker, CircuitBreaker } from './resilience.js';

// ── Phase 29: Integration Layer ──
export { eventBus, webhookDispatcher, EVENT_TYPES } from './event.bus.js';

// ── Phase 30: Scale-Out ──
export { batchProcessor } from './batch.processor.js';

// ── Phase 31: Compliance & Security ──
export { complianceEngine, DATA_CLASSES } from './compliance.engine.js';

// ── Phase 32: Developer Platform ──
export { agentSDK } from './agent.sdk.js';

// ── Phase 33: Enterprise Bridge ──
export { enterpriseBridge } from './enterprise.bridge.js';

// ── Phase 35: Observability Pipeline ──
export { metrics, tracer, dashboard } from './observability.js';

// ── Phase 36: Multi-Region Failover ──
export { multiRegion } from './multi.region.js';

// ── Phase 37: Admin Dashboard ──
export { adminDashboard } from './admin.dashboard.js';

// ── Phase 39: API Key Management & Rate Limiting ──
export { apiKeyManager, rateLimiter, RATE_TIERS } from './api.keys.js';

// ── Phase 40: Enterprise Caching Layer ──
export { cacheController } from './cache.layer.js';

// ── Phase 41: Error Recovery Pipeline ──
export { dlq, retryPolicy, schemaValidator, errorBudget } from './error.recovery.js';

// ── Phase 42: Audit Log Export ──
export { auditExporter, SEVERITY, RETENTION_POLICIES } from './audit.exporter.js';

// ── Phase 43: WebSocket Real-Time Feed ──
export { wsFeed, CHANNELS } from './websocket.feed.js';

// ── Phase 44: Secret Rotation Automation ──
export { secretManager, SECRET_TYPES, ROTATION_SCHEDULES } from './secret.rotation.js';

// ── Phase 45: Tenant Quota & Usage Metering ──
export { quotaMeter, PLAN_QUOTAS } from './quota.meter.js';

// ── Phase 47: Enterprise Notification Center ──
export { notificationCenter, NOTIFICATION_CHANNELS, SEVERITY_ROUTES, DIGEST_SCHEDULES, DEFAULT_TEMPLATES } from './notification.center.js';

// ── Phase 48: Workflow Engine ──
export { workflowEngine, STEP_TYPES, WORKFLOW_STATUSES } from './workflow.engine.js';

// ── Phase 49: Data Pipeline / ETL ──
export { dataPipeline, TRANSFORMERS } from './data.pipeline.js';

// ── Phase 50: Enterprise Search ──
export { enterpriseSearch, ENTITY_TYPES } from './enterprise.search.js';

// ── Phase 51: Agent Marketplace ──
export { agentMarketplace, CATEGORIES, BADGES, REVENUE_SPLIT } from './agent.marketplace.js';

// ── Phase 52: Scheduled Jobs & Cron Engine ──
export { cronEngine, CRON_PRESETS, JOB_STATUSES } from './cron.engine.js';

// ── Phase 53: Admin Console API ──
export { adminConsole, ADMIN_ROLES, FEATURE_FLAGS } from './admin.console.js';

// ── Phase 54: Health Check & Readiness Probes ──
export { healthCheck, HEALTH_STATUSES } from './health.check.js';

// ── Phase 55: OpenAPI/Swagger Documentation ──
export { openAPIGenerator, TAG_DEFINITIONS, SECURITY_SCHEMES } from './openapi.generator.js';

// ── Phase 56: E2E Stress Test Suite ──
export { stressTestEngine, BENCHMARK_THRESHOLDS } from './stress.test.engine.js';

// ── Phase 57: Cost Analytics Dashboard API ──
export { costAnalytics, COST_CATEGORIES, DEFAULT_RATES } from './cost.analytics.js';

// ── Phase 58: Agent Performance Benchmarking ──
export { perfBenchmark, SLA_TIERS, EFFICIENCY_GRADES } from './perf.benchmark.js';

// ── Phase 59: Token Metering & Billing Engine ──
export { tokenBilling, TOKEN_PRICING_PLANS, MODEL_RATES } from './token.billing.js';

// ── Phase 60: Webhook Management System ──
export { webhookManager, WEBHOOK_EVENTS, CIRCUIT_STATES } from './webhook.manager.js';

// ── Phase 61: Data Export & Import Engine ──
export { dataExportImport, EXPORT_FORMATS, DELIVERY_TARGETS, CONFLICT_STRATEGIES } from './data.export.import.js';

// ── Phase 62: Role-Based Dashboard Builder ──
export { dashboardBuilder, WIDGET_TYPES, DASHBOARD_TEMPLATES } from './dashboard.builder.js';

// ── Phase 63: Agent Collaboration Protocol ──
export { agentCollaboration, COLLAB_PATTERNS, CHANNEL_TYPES, MESSAGE_PRIORITIES } from './agent.collaboration.js';

// ── Phase 64: Tenant Migration Tool ──
export { tenantMigration, MIGRATION_STAGES, MIGRATION_STATUSES, REGIONS, DATA_CATEGORIES } from './tenant.migration.js';

// ── Phase 65: Compliance Certification Engine ──
export { complianceCertification, FRAMEWORKS, EVIDENCE_TYPES } from './compliance.certification.js';
