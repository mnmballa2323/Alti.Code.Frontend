import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tenantDbRouter } from './tenantDbRouter.js';
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
});
