/**
 * Copyright (c) 2026 Inso Code
 * 
 * Shared Tenant Database Router Middleware
 * 
 * Dynamically resolves connection pools for multi-tenant isolation,
 * mapping incoming requests to their respective database schemas.
 */

import { getTenantPrisma, prisma } from './prismaClient.js';

/**
 * Express middleware that checks the authenticated user's tenant context.
 * If the tenant has a dedicated PostgreSQL database URL configured,
 * it routes queries through a dedicated connection pool.
 */
export const tenantDbRouter = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      // Default to global shared database connection
      req.db = prisma;
      return next();
    }

    // Query tenant configuration from the shared metadata database
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { dedicatedDatabaseUrl: true },
    });

    if (tenant?.dedicatedDatabaseUrl) {
      // Route through dynamic client connection pool
      req.db = getTenantPrisma(tenantId, tenant.dedicatedDatabaseUrl);
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
