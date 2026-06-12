import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService, canonicalize } from './audit.service.js';

const { mockCreate, mockFindFirst, mockFindMany } = vi.hoisted(() => {
  return {
    mockCreate: vi.fn(),
    mockFindFirst: vi.fn(),
    mockFindMany: vi.fn(),
  };
});

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      constructor() {
        this.auditLog = {
          create: mockCreate,
          findFirst: mockFindFirst,
          findMany: mockFindMany,
        };
      }
    },
  };
});

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('log', () => {
    it('should append an audit log with productId and verify the cryptographic WORM seal', async () => {
      const mockLastLog = { hash: 'previous-hash-123' };
      mockFindFirst.mockResolvedValueOnce(mockLastLog);

      const logData = {
        tenantId: 'tenant-abc',
        productId: 'inso-code',
        actor: 'user-123',
        action: 'FILE_READ',
        metadata: { path: '/src/index.js' },
        status: 'SUCCESS',
      };

      mockCreate.mockImplementationOnce(async ({ data }) => {
        return { id: 'new-log-uuid', ...data, createdAt: new Date() };
      });

      const result = await AuditService.log(logData);

      expect(mockFindFirst).toHaveBeenCalledWith({
        orderBy: { timestamp: 'desc' },
        select: { hash: true },
      });

      expect(mockCreate).toHaveBeenCalled();
      const calledData = mockCreate.mock.calls[0][0].data;
      expect(calledData.tenantId).toBe('tenant-abc');
      expect(calledData.productId).toBe('inso-code');
      expect(calledData.actor).toBe('user-123');
      expect(calledData.action).toBe('FILE_READ');
      expect(calledData.previousHash).toBe('previous-hash-123');
      expect(calledData.hash).toBeDefined();

      // Check if hash matches manually computed hash
      const payload = {
        tenantId: 'tenant-abc',
        actor: 'user-123',
        action: 'FILE_READ',
        metadata: { path: '/src/index.js' },
        status: 'SUCCESS',
        productId: 'inso-code',
      };
      const expectedHash = AuditService._hashPayload(payload, 'previous-hash-123');
      expect(calledData.hash).toBe(expectedHash);
      expect(result.id).toBe('new-log-uuid');
    });

    it('should generate audit log successfully even when tenantId and productId are omitted', async () => {
      mockFindFirst.mockResolvedValueOnce(null);

      const logData = {
        actor: 'system-agent',
        action: 'SERVICE_BOOT',
      };

      mockCreate.mockImplementationOnce(async ({ data }) => {
        return { id: 'new-log-uuid-2', ...data, createdAt: new Date() };
      });

      const result = await AuditService.log(logData);

      expect(mockCreate).toHaveBeenCalled();
      const calledData = mockCreate.mock.calls[0][0].data;
      expect(calledData.tenantId).toBeUndefined();
      expect(calledData.productId).toBeUndefined();
      expect(calledData.previousHash).toBe('0000000000000000000000000000000000000000000000000000000000000000');

      const payload = {
        tenantId: null,
        actor: 'system-agent',
        action: 'SERVICE_BOOT',
        metadata: {},
        status: 'SUCCESS',
      };
      const expectedHash = AuditService._hashPayload(payload, '0000000000000000000000000000000000000000000000000000000000000000');
      expect(calledData.hash).toBe(expectedHash);
    });
  });

  describe('verifyChainIntegrity', () => {
    it('should verify the chain successfully with a mix of product-scoped and unscoped logs', async () => {
      const logs = [
        {
          id: 'log-1',
          tenantId: 'tenant-1',
          actor: 'user-1',
          action: 'LOGIN',
          metadata: {},
          status: 'SUCCESS',
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        },
        {
          id: 'log-2',
          tenantId: 'tenant-1',
          productId: 'inso-ai',
          actor: 'user-1',
          action: 'PROMPT_COMPLETION',
          metadata: { tokens: 15 },
          status: 'SUCCESS',
          previousHash: '', // Will populate below
        },
        {
          id: 'log-3',
          tenantId: 'tenant-1',
          productId: 'inso-code',
          actor: 'user-2',
          action: 'CODE_COMMIT',
          metadata: {},
          status: 'FAILURE',
          previousHash: '', // Will populate below
        },
      ];

      // Calculate correct hashes sequentially
      let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      for (const log of logs) {
        log.previousHash = prevHash;
        const payload = {
          tenantId: log.tenantId,
          actor: log.actor,
          action: log.action,
          metadata: log.metadata,
          status: log.status,
        };
        if (log.productId) {
          payload.productId = log.productId;
        }
        log.hash = AuditService._hashPayload(payload, prevHash);
        prevHash = log.hash;
      }

      mockFindMany.mockResolvedValueOnce(logs);

      const verification = await AuditService.verifyChainIntegrity();
      expect(verification.valid).toBe(true);
    });

    it('should detect tampering if any log hash does not match computed value', async () => {
      const logs = [
        {
          id: 'log-1',
          tenantId: 'tenant-1',
          actor: 'user-1',
          action: 'LOGIN',
          metadata: {},
          status: 'SUCCESS',
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        },
      ];
      logs[0].hash = 'fake-tampered-hash';

      mockFindMany.mockResolvedValueOnce(logs);

      const verification = await AuditService.verifyChainIntegrity();
      expect(verification.valid).toBe(false);
      expect(verification.brokenAtId).toBe('log-1');
      expect(verification.reason).toBe('Hash tampering detected');
    });

    it('should detect a break in the hash linkage (previousHash mismatch)', async () => {
      const logs = [
        {
          id: 'log-1',
          tenantId: 'tenant-1',
          actor: 'user-1',
          action: 'LOGIN',
          metadata: {},
          status: 'SUCCESS',
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        },
        {
          id: 'log-2',
          tenantId: 'tenant-1',
          actor: 'user-1',
          action: 'LOGOUT',
          metadata: {},
          status: 'SUCCESS',
          previousHash: 'mismatched-prev-hash-here',
        },
      ];

      // Set valid hash for log-1
      const payload = {
        tenantId: logs[0].tenantId,
        actor: logs[0].actor,
        action: logs[0].action,
        metadata: logs[0].metadata,
        status: logs[0].status,
      };
      logs[0].hash = AuditService._hashPayload(payload, logs[0].previousHash);

      mockFindMany.mockResolvedValueOnce(logs);

      const verification = await AuditService.verifyChainIntegrity();
      expect(verification.valid).toBe(false);
      expect(verification.brokenAtId).toBe('log-2');
      expect(verification.reason).toBe('Previous hash mismatch');
    });
  });

  describe('logAction backwards compatibility wrapper', () => {
    it('should route logAction arguments to log method correctly', async () => {
      const spyLog = vi.spyOn(AuditService, 'log').mockResolvedValueOnce({ id: 'log-123' });

      await AuditService.logAction(
        'system-user',
        'ACTION_RUN',
        { detail: 'test' },
        'SUCCESS',
        'tenant-id-123',
        'inso-cloud'
      );

      expect(spyLog).toHaveBeenCalledWith({
        actor: 'system-user',
        action: 'ACTION_RUN',
        metadata: { detail: 'test' },
        status: 'SUCCESS',
        tenantId: 'tenant-id-123',
        productId: 'inso-cloud',
      });
    });
  });

  describe('canonicalize key sorting', () => {
    it('should recursively sort object keys alphabetically', () => {
      const objA = { b: 2, a: { d: 4, c: 3 }, e: [ { g: 7, f: 6 } ] };
      const objB = { a: { c: 3, d: 4 }, b: 2, e: [ { f: 6, g: 7 } ] };

      const canonicalA = canonicalize(objA);
      const canonicalB = canonicalize(objB);

      // They should be deeply equal and have identical JSON.stringify outputs
      expect(canonicalA).toEqual(canonicalB);
      expect(JSON.stringify(canonicalA)).toBe(JSON.stringify(canonicalB));
      
      // Check exact sorted string structure
      expect(JSON.stringify(canonicalA)).toBe('{"a":{"c":3,"d":4},"b":2,"e":[{"f":6,"g":7}]}');
    });

    it('should produce identical SHA-256 hashes regardless of payload key order', () => {
      const payloadA = {
        tenantId: 'tenant-123',
        actor: 'user-xyz',
        metadata: { z: 1, x: 2, y: { b: 2, a: 1 } },
        action: 'MUTATE_CONFIG'
      };

      const payloadB = {
        action: 'MUTATE_CONFIG',
        actor: 'user-xyz',
        tenantId: 'tenant-123',
        metadata: { x: 2, y: { a: 1, b: 2 }, z: 1 }
      };

      const hashA = AuditService._hashPayload(payloadA, 'prev-hash-val');
      const hashB = AuditService._hashPayload(payloadB, 'prev-hash-val');

      expect(hashA).toBe(hashB);
    });
  });
});
