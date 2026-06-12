/**
 * Copyright (c) 2026 Inso Code
 * 
 * Shared Tenant Database Router Middleware
 * 
 * Dynamically resolves connection pools for multi-tenant isolation,
 * mapping incoming requests to their respective database schemas.
 */

import { getTenantPrisma, prisma, getSchemaConnectionUrl } from './prismaClient.js';

// In-memory cache for tenant configurations
export const tenantCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

/**
 * Express middleware that checks the authenticated user's tenant context.
 * If the tenant has a dedicated PostgreSQL database URL configured,
 * it routes queries through a dedicated connection pool.
 * Alternatively, if schema-level partitioning is active, it routes to a
 * schema-partitioned pool within the shared database.
 */
export const tenantDbRouter = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      // Default to global shared database connection
      req.db = prisma;
      return next();
    }

    let tenant;
    const now = Date.now();
    const cached = tenantCache.get(tenantId);

    if (cached && cached.expiresAt > now) {
      tenant = cached.data;
    } else {
      // Query tenant configuration from the shared metadata database
      tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { dedicatedDatabaseUrl: true },
      });
      tenantCache.set(tenantId, {
        data: tenant,
        expiresAt: now + CACHE_TTL_MS,
      });
    }

    if (tenant?.dedicatedDatabaseUrl) {
      // Route through dynamic client connection pool
      req.db = getTenantPrisma(tenantId, tenant.dedicatedDatabaseUrl);
    } else if (process.env.SCHEMA_ISOLATION_ACTIVE === 'true') {
      const baseDbUrl = process.env.DATABASE_URL;
      if (baseDbUrl) {
        const schemaUrl = getSchemaConnectionUrl(baseDbUrl, tenantId);
        req.db = getTenantPrisma(tenantId, schemaUrl);
      } else {
        req.db = prisma;
      }
    } else {
      // Fallback to global database client
      req.db = prisma;
    }

    next();
  } catch (error) {
    next(error);
  }
};
export default tenantDbRouter;
