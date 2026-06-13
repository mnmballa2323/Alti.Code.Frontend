/**
 * Copyright (c) 2026 Inso Code
 * 
 * Shared Database Client & Multi-Tenant Connection Pooler
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../../shared/logger.js';
import { memorystoreService } from '../../modules/googleCloud/memorystore.service.js';
import crypto from 'crypto';

const basePrisma = new PrismaClient({
  log: ['error', 'warn'],
});

const queryExtensions = {
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // 1. Identify Read Operations
        const isReadOperation = ['findUnique', 'findMany', 'findFirst', 'count'].includes(operation);
        
        // 2. Bypass cache if it's a mutation or if Redis is offline
        if (!isReadOperation || !memorystoreService.isInitialized) {
          return query(args);
        }

        // 3. Cryptographic Cache Key Generation
        const hash = crypto.createHash('sha256').update(JSON.stringify(args || {})).digest('hex');
        const cacheKey = `pg_cache:${model}:${operation}:${hash}`;

        // 4. Redis Cache Retrieval
        const cachedStr = await memorystoreService.getCache(cacheKey);
        if (cachedStr) {
          try {
            return JSON.parse(cachedStr);
          } catch(e) {
            /* Malformed cache, fall through */
          }
        }

        // 5. Cache Miss: Execute heavy Postgres Query
        const result = await query(args);

        // 6. Asynchronous Redis Write (60s TTL to absorb traffic spikes)
        if (result !== undefined && result !== null) {
          memorystoreService.setCache(cacheKey, JSON.stringify(result), 60).catch(() => {});
        }

        return result;
      }
    }
  }
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
    const sanitizedProductId = productId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    schemaName = `${schemaName}_product_${sanitizedProductId}`;
  }

  try {
    const url = new URL(baseDbUrl);
    url.searchParams.set('schema', schemaName);
    return url.toString();
  } catch (error) {
    const separator = baseDbUrl.includes('?') ? '&' : '?';
    return `${baseDbUrl}${separator}schema=${schemaName}`;
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
  
  logger.info(`🔌 [Platform DataLayer] Dynamically provisioned dedicated connection pool for Tenant ID: ${tenantId}`);
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
    await basePrisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    
    logger.info('✅ PostgreSQL (via Prisma) connected successfully. pgvector extension active.');
    logger.info('🚀 Universal Redis Caching Layer injected into Prisma Client.');
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL:', error);
    if (process.env.NODE_ENV === 'production') {
      logger.error('❌ FATAL: PostgreSQL connection is mandatory in production. Exiting process.');
      process.exit(1);
    }
  }
}

export const prismaClient = {
  prisma,
  getTenantPrisma,
  connectPrisma,
  getSchemaConnectionUrl,
};
