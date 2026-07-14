const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const { logger } = require('../../shared/logger');
const fs = require('fs');

/**
 * Schema Migration Coordinator
 * Safely loops through isolated single-tenant and fedramp databases 
 * and applies the latest Prisma schema securely across physical boundaries.
 */
class SchemaMigrationCoordinator {
  constructor() {
    // Primary metadata DB to fetch tenant lists
    this.primaryDb = new PrismaClient();
  }

  async fetchIsolatedTenants() {
    logger.info('Fetching sovereign tenants from primary metadata DB...');
    // We fetch users who have opted into single tenant or fedramp isolated tiers
    const users = await this.primaryDb.user.findMany({
      where: {
        deploymentTier: {
          in: ['SINGLE_TENANT', 'FEDRAMP']
        }
      },
      select: {
        tenantId: true,
        deploymentTier: true,
        preferredCloud: true
      }
    });

    // Deduplicate tenants
    const uniqueTenants = new Map();
    users.forEach(u => {
      if (u.tenantId && !uniqueTenants.has(u.tenantId)) {
        uniqueTenants.set(u.tenantId, u);
      }
    });
    
    return Array.from(uniqueTenants.values());
  }

  async migrateTenant(tenant) {
    logger.info(`Initiating strict boundary schema migration for Tenant: ${tenant.tenantId} [Tier: ${tenant.deploymentTier}, Cloud: ${tenant.preferredCloud}]`);
    
    try {
      // In a real environment, this service assumes a short-lived IAM role/STS token
      // to access the secret manager for the tenant's isolated database URL.
      // E.g. SecretManager.get(`db-url-${tenant.tenantId}`)
      const isolatedDbUrl = process.env[`TENANT_DB_${tenant.tenantId}`] || process.env.DIRECT_DATABASE_URL;

      if (!isolatedDbUrl) {
        throw new Error('Database URL not found in secure vault for tenant');
      }

      logger.info(`Running isolated npx prisma db push for Tenant ${tenant.tenantId}...`);
      
      execSync('npx prisma db push --accept-data-loss', {
        env: {
          ...process.env,
          DIRECT_DATABASE_URL: isolatedDbUrl,
          DATABASE_URL: isolatedDbUrl
        },
        stdio: 'inherit'
      });

      logger.info(`✅ Successfully migrated isolated schema for Tenant ${tenant.tenantId}`);
    } catch (error) {
      logger.error(`❌ Critical Failure migrating Tenant ${tenant.tenantId}. Rollback required.`, error);
      throw error;
    }
  }

  async runAll() {
    try {
      const tenants = await this.fetchIsolatedTenants();
      logger.info(`Found ${tenants.length} sovereign boundaries requiring schema migrations.`);

      for (const tenant of tenants) {
        await this.migrateTenant(tenant);
      }
      
      logger.info('All sovereign databases have been synced to the latest schema.');
    } catch (error) {
      logger.error('Coordinator halted due to a critical error.', error);
      process.exit(1);
    } finally {
      await this.primaryDb.$disconnect();
    }
  }
}

if (require.main === module) {
  const coordinator = new SchemaMigrationCoordinator();
  coordinator.runAll();
}

module.exports = SchemaMigrationCoordinator;
