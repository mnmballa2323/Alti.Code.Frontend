/**
 * Copyright (c) 2026 Inso Code
 * 
 * Tenant Database Router Middleware Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tenantDbRouter } from './tenantDbRouter.js';
import { prisma, getTenantPrisma } from './prismaClient.js';

// Mock getTenantPrisma
vi.mock('./prismaClient.js', () => {
  return {
    prisma: {
      tenant: {
        findUnique: vi.fn(),
      },
    },
    getTenantPrisma: vi.fn(),
  };
});

describe('Platform Tenant Database Router Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
