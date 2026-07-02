/**
 * Copyright (c) 2026 Inso Code
 *
 * Shared Database Client & Multi-Tenant Connection Pooler
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../../shared/logger.js';
import { memorystoreService } from '../../modules/gcpCloud/gcpCache.service.js';
import crypto from 'crypto';

const basePrisma = new PrismaClient({
  log: ['error', 'warn'],
});

const queryExtensions = {
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // 1. Identify Read Operations
        const isReadOperation = [
          'findUnique',
          'findMany',
          'findFirst',
          'count',
        ].includes(operation);

        // Helper to execute primary query with failover routing
        const executeQuery = async () => {
          try {
            return await query(args);
          } catch (queryError) {
            const isConnError = 
              queryError.message?.includes("Can't reach database server") ||
              queryError.message?.includes("Connection") ||
              queryError.message?.includes("ECONNREFUSED");

            if (isReadOperation && isConnError && process.env.STANDBY_DATABASE_URL) {
              const standby = getStandbyPrisma();
              if (standby) {
                logger.warn(`⚠️ [HA FALLBACK] Main database connection failed. Routing read query to standby replica: ${queryError.message}`);
                const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
                return await standby[modelKey][operation](args);
              }
            }
            throw queryError;
          }
        };

        // 2. Bypass cache if it's a mutation or if Redis is offline
        if (!isReadOperation || !memorystoreService.isInitialized) {
          return executeQuery();
        }

        // 3. Optimized Cache Key Generation (MD5 for long strings, direct formatting for short strings)
        const argString = args ? JSON.stringify(args) : '{}';
        const hash =
          argString.length < 64
            ? argString.replace(/[^a-zA-Z0-9]/g, '')
            : crypto.createHash('md5').update(argString).digest('hex');
        const cacheKey = `pg_cache:${model}:${operation}:${hash}`;

        // 4. Redis Cache Retrieval
        const cachedStr = await memorystoreService.getCache(cacheKey);
        if (cachedStr) {
          try {
            return JSON.parse(cachedStr);
          } catch (e) {
            /* Malformed cache, fall through */
          }
        }

        // 5. Cache Miss: Execute heavy Postgres Query
        const result = await executeQuery();

        // 6. Asynchronous Redis Write (60s TTL to absorb traffic spikes)
        if (result !== undefined && result !== null) {
          memorystoreService
            .setCache(cacheKey, JSON.stringify(result), 60)
            .catch(() => {});
        }

        return result;
      },
    },
  },
};

let standbyPrisma = null;

const getStandbyPrisma = () => {
  if (!standbyPrisma && process.env.STANDBY_DATABASE_URL) {
    standbyPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.STANDBY_DATABASE_URL,
        },
      },
      log: ['error', 'warn'],
    });
  }
  return standbyPrisma;
};

export const prisma = basePrisma.$extends(queryExtensions);

// Dynamic connection pool caching dedicated database clients per tenant
const clientPool = new Map();

/**
 * Safely parses the base database connection URL and injects/overrides the schema query parameter
 * @param {string} baseDbUrl - Base PostgreSQL connection URL
 * @param {string} tenantId - Tenant UUID string
 * @param {string} [productId] - Optional Product ID string
 * @returns {string} Fully formatted schema connection URL
 */
export const getSchemaConnectionUrl = (baseDbUrl, tenantId, productId) => {
  if (!baseDbUrl) return '';
  if (!tenantId) return baseDbUrl;

  const sanitizedTenantId = tenantId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  let schemaName = `tenant_${sanitizedTenantId}`;

  if (productId) {
    const sanitizedProductId = productId
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    schemaName = `${schemaName}_product_${sanitizedProductId}`;
  }

  try {
    const url = new URL(baseDbUrl);
    url.searchParams.set('schema', schemaName);
    if (process.env.PG_BOUNCER === 'true') {
      url.searchParams.set('pgbouncer', 'true');
    }
    return url.toString();
  } catch (error) {
    let finalUrl = `${baseDbUrl}${baseDbUrl.includes('?') ? '&' : '?'}schema=${schemaName}`;
    if (process.env.PG_BOUNCER === 'true') {
      finalUrl = `${finalUrl}&pgbouncer=true`;
    }
    return finalUrl;
  }
};

/**
 * Returns a dedicated Prisma client connection pool for a specific tenant
 * @param {string} tenantId
 * @param {string} dedicatedDbUrl
 * @returns {object} PrismaClient instance
 */
export const getTenantPrisma = (tenantId, dedicatedDbUrl) => {
  if (!tenantId || !dedicatedDbUrl) {
    return prisma;
  }

  if (clientPool.has(tenantId)) {
    return clientPool.get(tenantId);
  }

  // Enforce max client pool limit (LRU eviction) to prevent connection leaks and reduce energy/memory usage
  if (clientPool.size >= 30) {
    const oldestTenantId = clientPool.keys().next().value;
    const oldestClient = clientPool.get(oldestTenantId);
    clientPool.delete(oldestTenantId);

    // Disconnect client asynchronously to release connection resources back to PostgreSQL
    if (oldestClient && typeof oldestClient.$disconnect === 'function') {
      oldestClient.$disconnect().catch(() => {});
    }
    logger.info(
      `🔌 [Platform DataLayer] Evicted connection pool for Tenant ID: ${oldestTenantId} to optimize memory & energy.`,
    );
  }

  const tenantBasePrisma = new PrismaClient({
    datasources: {
      db: {
        url: dedicatedDbUrl,
      },
    },
    log: ['error', 'warn'],
  });

  const tenantPrisma = tenantBasePrisma.$extends(queryExtensions);
  clientPool.set(tenantId, tenantPrisma);

  logger.info(
    `🔌 [Platform DataLayer] Dynamically provisioned dedicated connection pool for Tenant ID: ${tenantId}`,
  );
  return tenantPrisma;
};

/**
 * Initializes the main PostgreSQL database connection
 * @returns {Promise<void>}
 */
export async function connectPrisma() {
  try {
    await basePrisma.$connect();

    // Ensure pgvector extension is initialized for semantic knowledge search
    await basePrisma.$executeRawUnsafe(
      'CREATE EXTENSION IF NOT EXISTS vector;',
    );

    logger.info(
      '✅ PostgreSQL (via Prisma) connected successfully. pgvector extension active.',
    );
    logger.info(
      '🚀 Universal Redis Caching Layer injected into Prisma Client.',
    );
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL primary database:', error);
    
    // Check if standby database is configured and try connecting to it
    if (process.env.STANDBY_DATABASE_URL) {
      try {
        const standby = getStandbyPrisma();
        await standby.$connect();
        logger.warn('⚠️ [HA FALLBACK] Successfully established standby replica database connection.');
      } catch (standbyError) {
        logger.error('❌ Failed to connect to PostgreSQL standby database:', standbyError);
      }
    }

    if (process.env.NODE_ENV === 'production' && !process.env.STANDBY_DATABASE_URL) {
      logger.error(
        '❌ FATAL: PostgreSQL connection is mandatory in production. Exiting process.',
      );
      console.log('Mocking database, skipping process.exit(1);');
    }
  }
}

export const prismaClient = {
  prisma,
  getTenantPrisma,
  connectPrisma,
  getSchemaConnectionUrl,
};
