import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { requireScimToken } from './scimAuth.js';
import { getUsers, getUserById, createUser, updateUser, patchUser, deleteUser } from './scimController.js';
import config from '../../../../config/index.js';
import { prisma } from '../db/prismaClient.js';

vi.mock('../db/prismaClient.js', () => {
  const mockUserMethods = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const mockTenantMethods = {
    findUnique: vi.fn(),
  };
  return {
    prisma: {
      tenant: mockTenantMethods,
      user: mockUserMethods,
    },
    getTenantPrisma: vi.fn(),
  };
});

describe('Platform SCIM 2.0 User Provisioning', () => {
  const mockSecret = 'super-secret-key-for-scim-testing-12345';
  let originalSecret;

  beforeEach(() => {
    originalSecret = config.jwt?.access_token;
    if (!config.jwt) config.jwt = {};
    config.jwt.access_token = mockSecret;
    vi.clearAllMocks();
  });

  afterEach(() => {
    config.jwt.access_token = originalSecret;
  });

  describe('SCIM Authentication Middleware (requireScimToken)', () => {
    it('should pass and route queries to tenant database client on valid token', async () => {
      const token = jwt.sign({ tenantId: 'tenant-123', scope: 'scim-sync' }, mockSecret);
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {};
      const next = vi.fn();

      prisma.tenant.findUnique.mockResolvedValueOnce({
        id: 'tenant-123',
        name: 'Workspace - Test Tenant',
        dedicatedDatabaseUrl: null,
      });

      await requireScimToken(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.tenantId).toBe('tenant-123');
      expect(req.db).toBeDefined();
    });

    it('should throw UNAUTHORIZED if authorization header is missing', async () => {
      const req = { headers: {} };
      const res = {};
      const next = vi.fn();

      await requireScimToken(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
        })
      );
    });

    it('should throw FORBIDDEN if token lacks tenantId context', async () => {
      const token = jwt.sign({ scope: 'scim-sync' }, mockSecret);
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {};
      const next = vi.fn();

      await requireScimToken(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.FORBIDDEN,
        })
      );
    });
  });

  describe('SCIM Controller Handlers', () => {
    const mockUser = {
      id: 'usr-123',
      email: 'john.doe@example.com',
      role: 'user',
      tenantId: 'tenant-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    describe('getUsers', () => {
      it('should list users belonging to the tenant in SCIM ListResponse format', async () => {
        const req = {
          tenantId: 'tenant-123',
          db: prisma,
          query: {},
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };
        const next = vi.fn();

        prisma.user.findMany.mockResolvedValueOnce([mockUser]);

        await getUsers(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
            totalResults: 1,
            Resources: expect.arrayContaining([
              expect.objectContaining({
                userName: 'john.doe@example.com',
                id: 'usr-123',
              }),
            ]),
          })
        );
      });

      it('should support simple email eq filter query', async () => {
        const req = {
          tenantId: 'tenant-123',
          db: prisma,
          query: {
            filter: 'userName eq "john.doe@example.com"',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };
        const next = vi.fn();

        prisma.user.findMany.mockResolvedValueOnce([mockUser]);

        await getUsers(req, res, next);

        expect(prisma.user.findMany).toHaveBeenCalledWith({
          where: {
            tenantId: 'tenant-123',
            email: 'john.doe@example.com',
          },
        });
      });
    });

    describe('createUser', () => {
      it('should provision a new user and return 201 Created', async () => {
        const req = {
          tenantId: 'tenant-123',
          db: prisma,
          body: {
            userName: 'new@example.com',
            emails: [{ value: 'new@example.com', primary: true }],
            active: true,
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };
        const next = vi.fn();

        prisma.user.findUnique.mockResolvedValueOnce(null);
        prisma.user.create.mockResolvedValueOnce({
          id: 'usr-456',
          email: 'new@example.com',
          role: 'user',
          tenantId: 'tenant-123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await createUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'usr-456',
            userName: 'new@example.com',
            active: true,
          })
        );
      });

      it('should throw 409 Conflict if email is already taken', async () => {
        const req = {
          tenantId: 'tenant-123',
          db: prisma,
          body: {
            userName: 'john.doe@example.com',
            emails: [{ value: 'john.doe@example.com', primary: true }],
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };
        const next = vi.fn();

        prisma.user.findUnique.mockResolvedValueOnce(mockUser);

        await createUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(httpStatus.CONFLICT);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
            status: '409',
          })
        );
      });
    });

    describe('patchUser (Suspend / Reactivate)', () => {
      it('should suspend a user (role: unauthorized) when active is set to false', async () => {
        const req = {
          tenantId: 'tenant-123',
          db: prisma,
          params: { id: 'usr-123' },
          body: {
            schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
            Operations: [
              {
                op: 'replace',
                path: 'active',
                value: false,
              },
            ],
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        };
        const next = vi.fn();

        prisma.user.findFirst.mockResolvedValueOnce(mockUser);
        prisma.user.update.mockResolvedValueOnce({
          ...mockUser,
          role: 'unauthorized',
        });

        await patchUser(req, res, next);

        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: 'usr-123' },
          data: { role: 'unauthorized' },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            active: false,
          })
        );
      });
    });

    describe('deleteUser', () => {
      it('should delete a user and return 204 No Content', async () => {
        const req = {
          tenantId: 'tenant-123',
          db: prisma,
          params: { id: 'usr-123' },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          end: vi.fn(),
        };
        const next = vi.fn();

        prisma.user.findFirst.mockResolvedValueOnce(mockUser);
        prisma.user.delete.mockResolvedValueOnce(mockUser);

        await deleteUser(req, res, next);

        expect(prisma.user.delete).toHaveBeenCalledWith({
          where: { id: 'usr-123' },
        });
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.end).toHaveBeenCalled();
      });
    });
  });
});
