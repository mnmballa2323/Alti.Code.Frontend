import { logger } from '../../../shared/logger.js';

class GcpStartupValidator {
  constructor() {
    this.results = [];
    this.startTime = null;
  }

  async validate() {
    this.startTime = Date.now();
    logger.info('\n═══════════════════════════════════════════════════════');
    logger.info('  🔍 GCP STARTUP VALIDATION');
    logger.info('═══════════════════════════════════════════════════════');

    // Phase 1: Environment Variables
    this._checkEnv('GCP_PROJECT_ID', true);
    this._checkEnv('DATABASE_URL', true);
    this._checkEnv('REDIS_URL', false);
    this._checkEnv('GEMINI_API_KEY', false);
    this._checkEnv('GCP_REGION', false, 'us-central1');
    this._checkEnv('DEPLOYMENT_MODE', false, 'cloud');
    this._checkEnv('NODE_ENV', false, 'development');
    this._checkEnv('PORT', false, '5000');
    this._checkEnv('JWT_SECRET', true);
    this._checkEnv('GOOGLE_APPLICATION_CREDENTIALS', false);

    // Phase 2: GCP Connectivity
    await this._checkGcpAuth();

    // Phase 3: Database Connectivity
    await this._checkDatabase();

    // Phase 4: Redis Connectivity
    await this._checkRedis();

    // Report
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const warned = this.results.filter(r => r.status === 'WARN').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const elapsed = Date.now() - this.startTime;

    logger.info('');
    this.results.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌';
      logger.info(`  ${icon} ${r.name}: ${r.message}`);
    });
    logger.info('');
    logger.info(`  📊 Results: ${passed} passed, ${warned} warnings, ${failed} failed (${elapsed}ms)`);
    logger.info('═══════════════════════════════════════════════════════\n');

    if (failed > 0) {
      const criticalFailures = this.results.filter(r => r.status === 'FAIL' && r.critical);
      if (criticalFailures.length > 0) {
        logger.error('❌ CRITICAL: Required services unavailable. Server may not function correctly.');
        logger.error(`   Failed: ${criticalFailures.map(f => f.name).join(', ')}`);
      }
    }

    return { passed, warned, failed, results: this.results };
  }

  _checkEnv(name, required, defaultVal) {
    const value = process.env[name];
    if (value) {
      const masked = name.includes('KEY') || name.includes('SECRET') || name.includes('URL') || name.includes('CREDENTIALS')
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : value;
      this.results.push({ name: `ENV:${name}`, status: 'PASS', message: masked, critical: required });
    } else if (required) {
      this.results.push({ name: `ENV:${name}`, status: 'FAIL', message: 'MISSING (required)', critical: true });
    } else {
      const msg = defaultVal ? `Not set, using default: ${defaultVal}` : 'Not set (optional)';
      this.results.push({ name: `ENV:${name}`, status: 'WARN', message: msg, critical: false });
    }
  }

  async _checkGcpAuth() {
    try {
      const { GoogleAuth } = await import('google-auth-library');
      const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
      const client = await auth.getClient();
      const projectId = await auth.getProjectId();
      this.results.push({ name: 'GCP:Authentication', status: 'PASS', message: `Project: ${projectId}`, critical: false });
    } catch (e) {
      this.results.push({ name: 'GCP:Authentication', status: 'WARN', message: `Not authenticated: ${e.message.substring(0, 80)}`, critical: false });
    }
  }

  async _checkDatabase() {
    if (!process.env.DATABASE_URL) {
      this.results.push({ name: 'DB:PostgreSQL', status: 'FAIL', message: 'DATABASE_URL not set', critical: true });
      return;
    }
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      this.results.push({ name: 'DB:PostgreSQL', status: 'PASS', message: 'Connected', critical: true });
    } catch (e) {
      this.results.push({ name: 'DB:PostgreSQL', status: 'FAIL', message: `Failed: ${e.message.substring(0, 80)}`, critical: true });
    }
  }

  async _checkRedis() {
    if (!process.env.REDIS_URL) {
      this.results.push({ name: 'Cache:Redis', status: 'WARN', message: 'REDIS_URL not set (optional)', critical: false });
      return;
    }
    try {
      const { createClient } = await import('redis');
      const client = createClient({ url: process.env.REDIS_URL });
      await client.connect();
      await client.ping();
      await client.disconnect();
      this.results.push({ name: 'Cache:Redis', status: 'PASS', message: 'Connected', critical: false });
    } catch (e) {
      this.results.push({ name: 'Cache:Redis', status: 'WARN', message: `Failed: ${e.message.substring(0, 80)}`, critical: false });
    }
  }
}

export const gcpStartupValidator = new GcpStartupValidator();
