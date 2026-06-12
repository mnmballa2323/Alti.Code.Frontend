import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tenantDbRouter, tenantCache } from './tenantDbRouter.js';
import { prisma, getTenantPrisma, getSchemaConnectionUrl } from './prismaClient.js';

// Mock prismaClient
vi.mock('./prismaClient.js', () => {
  return {
    prisma: {
      tenant: {
        findUnique: vi.fn(),
      },
    },
    getTenantPrisma: vi.fn(),
    getSchemaConnectionUrl: vi.fn((base, id) => {
      const sanitized = id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return `${base}?schema=tenant_${sanitized}`;
    }),
  };
});

describe('Platform Tenant Database Router Middleware', () => {
  const originalEnvSchema = process.env.SCHEMA_ISOLATION_ACTIVE;
  const originalEnvDb = process.env.DATABASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    tenantCache.clear();
    process.env.SCHEMA_ISOLATION_ACTIVE = originalEnvSchema;
    process.env.DATABASE_URL = originalEnvDb;
  });

  afterEach(() => {
    process.env.SCHEMA_ISOLATION_ACTIVE = originalEnvSchema;
    process.env.DATABASE_URL = originalEnvDb;
  });

  it('should fallback to default shared database if req.user has no tenantId', async () => {
    const req = { user: {} };
    const res = {};
    const next = vi.fn();

    await tenantDbRouter(req, res, next);

    expect(req.db).toBe(prisma);
    expect(next).toHaveBeenCalledWith();
  });

  it('should fallback to default database if tenant has no dedicated database url', async () => {
    const tenantId = 'tenant-123';
    const req = { user: { tenantId } };
    const res = {};
    const next = vi.fn();

    // Mock findUnique to return tenant without dedicatedDatabaseUrl
    prisma.tenant.findUnique.mockResolvedValueOnce({ dedicatedDatabaseUrl: null });

    await tenantDbRouter(req, res, next);

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { id: tenantId },
      select: { dedicatedDatabaseUrl: true },
    });
    expect(req.db).toBe(prisma);
    expect(next).toHaveBeenCalledWith();
  });

  it('should route requests to dynamic tenant client connection pool on dedicated database url', async () => {
    const tenantId = 'tenant-456';
    const dbUrl = 'postgresql://tenant:pass@127.0.0.1:5432/tenantdb';
    const req = { user: { tenantId } };
    const res = {};
    const next = vi.fn();

    const mockTenantDbClient = { query: vi.fn() };
    
    prisma.tenant.findUnique.mockResolvedValueOnce({ dedicatedDatabaseUrl: dbUrl });
    getTenantPrisma.mockReturnValueOnce(mockTenantDbClient);

    await tenantDbRouter(req, res, next);

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { id: tenantId },
      select: { dedicatedDatabaseUrl: true },
    });
    expect(getTenantPrisma).toHaveBeenCalledWith(tenantId, dbUrl);
    expect(req.db).toBe(mockTenantDbClient);
    expect(next).toHaveBeenCalledWith();
  });

  it('should route requests to schema-level connection pool when SCHEMA_ISOLATION_ACTIVE is active', async () => {
    process.env.SCHEMA_ISOLATION_ACTIVE = 'true';
    process.env.DATABASE_URL = 'postgresql://shared:pass@127.0.0.1:5432/shareddb';

    const tenantId = 'tenant-789';
    const req = { user: { tenantId } };
    const res = {};
    const next = vi.fn();

    const mockTenantSchemaClient = { query: vi.fn() };

    prisma.tenant.findUnique.mockResolvedValueOnce({ dedicatedDatabaseUrl: null });
    getTenantPrisma.mockReturnValueOnce(mockTenantSchemaClient);

    await tenantDbRouter(req, res, next);

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { id: tenantId },
      select: { dedicatedDatabaseUrl: true },
    });
    expect(getSchemaConnectionUrl).toHaveBeenCalledWith(
      'postgresql://shared:pass@127.0.0.1:5432/shareddb',
      tenantId
    );
    expect(getTenantPrisma).toHaveBeenCalledWith(tenantId, expect.stringContaining('schema=tenant_tenant789'));
    expect(req.db).toBe(mockTenantSchemaClient);
    expect(next).toHaveBeenCalledWith();
  });

  it('should pass database errors to express next handler', async () => {
    const req = { user: { tenantId: 'tenant-error' } };
    const res = {};
    const next = vi.fn();

    const dbError = new Error('Database connection timed out');
    prisma.tenant.findUnique.mockRejectedValueOnce(dbError);

    await tenantDbRouter(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });

  it('should query the database once and cache the tenant database configuration', async () => {
    const tenantId = 'tenant-cache-1';
    const dbUrl = 'postgresql://tenant:pass@127.0.0.1:5432/tenant_cache_1';
    const req = { user: { tenantId } };
    const res = {};
    const next = vi.fn();

    const mockTenantDbClient = { query: vi.fn() };
    prisma.tenant.findUnique.mockResolvedValueOnce({ dedicatedDatabaseUrl: dbUrl });
    getTenantPrisma.mockReturnValue(mockTenantDbClient);

    // First call: should query database and populate cache
    await tenantDbRouter(req, res, next);
    expect(prisma.tenant.findUnique).toHaveBeenCalledTimes(1);
    expect(req.db).toBe(mockTenantDbClient);

    // Second call: should read from cache and not query database again
    const req2 = { user: { tenantId } };
    const next2 = vi.fn();
    await tenantDbRouter(req2, res, next2);
    expect(prisma.tenant.findUnique).toHaveBeenCalledTimes(1); // Still 1
    expect(req2.db).toBe(mockTenantDbClient);
  });

  it('should query the database if cached config is expired', async () => {
    const tenantId = 'tenant-cache-2';
    const dbUrl = 'postgresql://tenant:pass@127.0.0.1:5432/tenant_cache_2';
    const req = { user: { tenantId } };
    const res = {};
    const next = vi.fn();

    const mockTenantDbClient = { query: vi.fn() };
    prisma.tenant.findUnique.mockResolvedValue({ dedicatedDatabaseUrl: dbUrl });
    getTenantPrisma.mockReturnValue(mockTenantDbClient);

    // Manually set an expired cache entry
    tenantCache.set(tenantId, {
      data: { dedicatedDatabaseUrl: dbUrl },
      expiresAt: Date.now() - 1000, // expired 1s ago
    });

    await tenantDbRouter(req, res, next);

    // Should have bypassed cache because it was expired and queried DB
    expect(prisma.tenant.findUnique).toHaveBeenCalledTimes(1);
    expect(req.db).toBe(mockTenantDbClient);
  });
});
