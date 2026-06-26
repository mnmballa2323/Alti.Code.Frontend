/**
 * Copyright (c) 2024 Inso Code
 *
 * OPENAPI / SWAGGER DOCUMENTATION (Phase 55)
 *
 * Auto-generated API documentation:
 *   - OpenAPI 3.1 spec generation
 *   - Route registration and schema inference
 *   - Interactive documentation UI metadata
 *   - Request/response schema definitions
 *   - Authentication documentation
 *   - Example request/response generation
 *   - Grouping by tags/categories
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════
// OpenAPI Spec Generator
// ═══════════════════════════════════════════════

const API_VERSION = '3.1.0';

const DEFAULT_INFO = {
  title: 'Inso Code Enterprise API',
  description: 'S&P 500 Enterprise Agent Orchestration Platform',
  version: '2.0.0',
  contact: { name: 'Inso Code', email: 'api@alticode.studio' },
  license: { name: 'Proprietary', url: 'https://alticode.studio/license' },
};

const SECURITY_SCHEMES = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'SSO JWT token from /auth/token',
  },
  apiKey: {
    type: 'apiKey',
    in: 'header',
    name: 'X-API-Key',
    description: 'HMAC API key from /enterprise/api-keys',
  },
};

const TAG_DEFINITIONS = [
  { name: 'Authentication', description: 'SSO & JWT token management' },
  { name: 'Tenants', description: 'Multi-tenant configuration' },
  { name: 'Agents', description: 'Agent registry & dispatch' },
  { name: 'Workflows', description: 'DAG-based workflow orchestration' },
  { name: 'Pipelines', description: 'Data pipeline / ETL processing' },
  { name: 'Search', description: 'Enterprise full-text search' },
  { name: 'Marketplace', description: 'Agent marketplace & distribution' },
  { name: 'Cron', description: 'Scheduled jobs & automation' },
  { name: 'Admin', description: 'Platform administration' },
  { name: 'Compliance', description: 'Security, audit, DLP' },
  { name: 'Observability', description: 'Monitoring, metrics, tracing' },
  { name: 'Health', description: 'Health checks & probes' },
  { name: 'Billing', description: 'Token metering & billing' },
];

class OpenAPIGenerator {
  constructor() {
    this.routes = [];
    this.schemas = new Map();
    this.spec = null;
  }

  // ── Route Registration ──

  registerRoute(route) {
    const {
      method,
      path,
      summary = '',
      description = '',
      tag = 'General',
      parameters = [],
      requestBody = null,
      responses = {},
      auth = ['bearerAuth'],
    } = route;

    this.routes.push({
      id: `route_${this.routes.length}`,
      method: method.toUpperCase(),
      path,
      summary,
      description,
      tag,
      parameters,
      requestBody,
      responses:
        Object.keys(responses).length > 0
          ? responses
          : { 200: { description: 'Success' } },
      auth,
      addedAt: new Date().toISOString(),
    });

    return { registered: true, total: this.routes.length };
  }

  // ── Bulk Registration ──

  registerRoutes(routes) {
    for (const r of routes) this.registerRoute(r);
    return { registered: routes.length, total: this.routes.length };
  }

  // ── Schema Registration ──

  registerSchema(name, schema) {
    const schemaId = `schema_${crypto.randomBytes(4).toString('hex')}`;
    this.schemas.set(name, { ...schema, id: schemaId });
    return { schemaId, name };
  }

  // ── Generate Full Spec ──

  generateSpec(options = {}) {
    const info = { ...DEFAULT_INFO, ...(options.info || {}) };

    const paths = {};
    for (const route of this.routes) {
      const pathKey = route.path;
      if (!paths[pathKey]) paths[pathKey] = {};

      const operation = {
        summary: route.summary,
        description: route.description,
        tags: [route.tag],
        parameters: route.parameters,
        responses: route.responses,
        security: route.auth.map(a => ({ [a]: [] })),
      };

      if (route.requestBody) {
        operation.requestBody = {
          required: true,
          content: { 'application/json': { schema: route.requestBody } },
        };
      }

      paths[pathKey][route.method.toLowerCase()] = operation;
    }

    this.spec = {
      openapi: API_VERSION,
      info,
      servers: [
        { url: 'http://localhost:3000', description: 'Development' },
        { url: 'https://api.alticode.studio', description: 'Production' },
      ],
      security: [{ bearerAuth: [] }],
      tags: TAG_DEFINITIONS,
      paths,
      components: {
        securitySchemes: SECURITY_SCHEMES,
        schemas: Object.fromEntries(this.schemas),
      },
    };

    logger.info(
      `📄 OpenAPI spec generated: ${this.routes.length} routes, ${this.schemas.size} schemas`,
    );
    return this.spec;
  }

  // ── Enterprise Route Auto-Registration ──

  autoRegisterEnterprise() {
    const enterpriseRoutes = [
      // Auth
      {
        method: 'POST',
        path: '/enterprise/auth/token',
        summary: 'Generate JWT token',
        tag: 'Authentication',
      },
      {
        method: 'POST',
        path: '/enterprise/auth/validate',
        summary: 'Validate JWT',
        tag: 'Authentication',
      },
      // Tenants
      {
        method: 'POST',
        path: '/enterprise/tenants',
        summary: 'Create tenant',
        tag: 'Tenants',
      },
      {
        method: 'GET',
        path: '/enterprise/tenants',
        summary: 'List tenants',
        tag: 'Tenants',
      },
      // Agents
      {
        method: 'POST',
        path: '/enterprise/dispatch',
        summary: 'Dispatch agent',
        tag: 'Agents',
      },
      {
        method: 'GET',
        path: '/enterprise/agents',
        summary: 'List agents',
        tag: 'Agents',
      },
      // Workflows
      {
        method: 'POST',
        path: '/enterprise/workflows/define',
        summary: 'Define workflow',
        tag: 'Workflows',
      },
      {
        method: 'POST',
        path: '/enterprise/workflows/execute/{workflowId}',
        summary: 'Execute workflow',
        tag: 'Workflows',
      },
      {
        method: 'GET',
        path: '/enterprise/workflows',
        summary: 'List workflows',
        tag: 'Workflows',
      },
      // Pipelines
      {
        method: 'POST',
        path: '/enterprise/pipelines/define',
        summary: 'Define pipeline',
        tag: 'Pipelines',
      },
      {
        method: 'POST',
        path: '/enterprise/pipelines/execute/{pipelineId}',
        summary: 'Execute pipeline',
        tag: 'Pipelines',
      },
      {
        method: 'GET',
        path: '/enterprise/pipelines',
        summary: 'List pipelines',
        tag: 'Pipelines',
      },
      // Search
      {
        method: 'POST',
        path: '/enterprise/search/index',
        summary: 'Index document',
        tag: 'Search',
      },
      {
        method: 'GET',
        path: '/enterprise/search',
        summary: 'Full-text search',
        tag: 'Search',
      },
      // Marketplace
      {
        method: 'POST',
        path: '/enterprise/marketplace/publish',
        summary: 'Publish agent',
        tag: 'Marketplace',
      },
      {
        method: 'POST',
        path: '/enterprise/marketplace/install',
        summary: 'Install agent',
        tag: 'Marketplace',
      },
      {
        method: 'GET',
        path: '/enterprise/marketplace/browse',
        summary: 'Browse marketplace',
        tag: 'Marketplace',
      },
      // Cron
      {
        method: 'POST',
        path: '/enterprise/cron/schedule',
        summary: 'Schedule job',
        tag: 'Cron',
      },
      {
        method: 'GET',
        path: '/enterprise/cron/jobs',
        summary: 'List jobs',
        tag: 'Cron',
      },
      // Admin
      {
        method: 'POST',
        path: '/enterprise/admin/tenants',
        summary: 'Create tenant',
        tag: 'Admin',
      },
      {
        method: 'POST',
        path: '/enterprise/admin/users',
        summary: 'Provision user',
        tag: 'Admin',
      },
      {
        method: 'GET',
        path: '/enterprise/admin/system',
        summary: 'System state',
        tag: 'Admin',
      },
      // Health
      {
        method: 'GET',
        path: '/enterprise/health',
        summary: 'Liveness probe',
        tag: 'Health',
      },
      {
        method: 'GET',
        path: '/enterprise/ready',
        summary: 'Readiness probe',
        tag: 'Health',
      },
      // Compliance
      {
        method: 'GET',
        path: '/enterprise/audit/export',
        summary: 'Export audit logs',
        tag: 'Compliance',
      },
      {
        method: 'GET',
        path: '/enterprise/compliance/report',
        summary: 'Compliance report',
        tag: 'Compliance',
      },
    ];

    return this.registerRoutes(enterpriseRoutes);
  }

  // ── Queries ──

  getSpec() {
    return this.spec;
  }

  getRouteCount() {
    return this.routes.length;
  }

  getRoutesByTag(tag) {
    return this.routes.filter(r => r.tag === tag);
  }

  listTags() {
    return TAG_DEFINITIONS;
  }

  getStats() {
    const byTag = {};
    for (const r of this.routes) byTag[r.tag] = (byTag[r.tag] || 0) + 1;

    return {
      totalRoutes: this.routes.length,
      totalSchemas: this.schemas.size,
      tags: TAG_DEFINITIONS.length,
      routesByTag: byTag,
      specVersion: API_VERSION,
      securitySchemes: Object.keys(SECURITY_SCHEMES).length,
    };
  }
}

export const openAPIGenerator = new OpenAPIGenerator();
export { API_VERSION, SECURITY_SCHEMES, TAG_DEFINITIONS };
