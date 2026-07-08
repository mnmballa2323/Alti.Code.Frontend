import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vectorStoreService } from '../../src/app/modules/memory/vector.store.js';
import { swarmTraceService } from '../../src/app/modules/telemetry/trace.service.js';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { gitlabSwarmFactory } from '../../src/app/modules/agents/gitlab_swarm_factory.js';
import { GeminiAiService } from '../../src/app/modules/gemini/gemini.service.js';

describe('Enterprise Readiness: Isolation, Tracing & Sandboxing Integration Tests', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    // Load plugins so the registry has gitlab agents
    agentRegistry.pluginsLoaded = false;
    await agentRegistry.loadPlugins();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Multi-Tenant Data Isolation (pgvector)', () => {
    it('should perform pgvector searches strictly scoped to the tenantId parameter', async () => {
      const querySpy = vi
        .spyOn(vectorStoreService.pool, 'query')
        .mockResolvedValue({
          rows: [
            {
              id: 'doc_1',
              metadata: {},
              document: 'Tenant A doc',
              distance: 0.1,
            },
          ],
        });

      // Mock vertex embeddings call
      const { gcpSovereignCompatService } =
        await import('../../src/app/modules/ai/gcpSovereignCompat.service.js');
      vi.spyOn(gcpSovereignCompatService, 'getEmbeddings').mockResolvedValue([
        0.1, 0.2, 0.3,
      ]);

      const result = await vectorStoreService.search(
        'some query',
        5,
        'tenant_A',
      );

      expect(result.documents[0][0]).toBe('Tenant A doc');
      expect(querySpy).toHaveBeenCalledTimes(1);

      // Check that the SQL query includes WHERE tenant_id = $2
      const sqlCall = querySpy.mock.calls[0][0];
      const argsCall = querySpy.mock.calls[0][1];
      expect(sqlCall).toContain('WHERE tenant_id = $2');
      expect(argsCall).toContain('tenant_A');
    });

    it('should fail safely if tenantId is omitted during search', async () => {
      const querySpy = vi.spyOn(vectorStoreService.pool, 'query');
      const result = await vectorStoreService.search(
        'some query',
        5,
        undefined,
      );

      // Should return empty results safely without hitting database
      expect(result.documents).toEqual([]);
      expect(querySpy).not.toHaveBeenCalled();
    });

    it('should fail safely if tenantId is omitted during add', async () => {
      await expect(
        vectorStoreService.add('some document', {}, undefined),
      ).rejects.toThrow('VectorStoreService: tenantId is required');
    });
  });

  describe('Swarm Telemetry Tracing (OpenTelemetry)', () => {
    it('should trace specialist consultations and propagate parent-child span IDs', async () => {
      const startSpanSpy = vi
        .spyOn(swarmTraceService, 'startSpan')
        .mockResolvedValue('mock_span_id');
      const endSpanSpy = vi
        .spyOn(swarmTraceService, 'endSpan')
        .mockResolvedValue();

      // Mock Gemini content generation
      vi.spyOn(GeminiAiService, 'generateContent').mockResolvedValue(
        'Mocked response content',
      );

      const agent = agentRegistry.get('gitlabProjectCreator', 'tenant_123');
      expect(agent).toBeDefined();

      // Consult agent with explicit parent span ID
      await agent.instance.consult(
        'Hello agent',
        [],
        'tenant_123',
        'parent_span_999',
      );

      expect(startSpanSpy).toHaveBeenCalledWith(
        'gitlabProjectCreator',
        'parent_span_999',
        'tenant_123',
        'Hello agent',
      );
      expect(endSpanSpy).toHaveBeenCalled();
    });

    it('should automatically propagate parent span ID down nested agent call stack', async () => {
      // Mock DB inserts and updates
      const dbQuerySpy = vi
        .spyOn(swarmTraceService.pool, 'query')
        .mockResolvedValue({ rows: [] });
      vi.spyOn(GeminiAiService, 'generateContent').mockResolvedValue(
        'Mocked response',
      );

      const agentA = agentRegistry.get(
        'gitlabProjectCreator',
        'tenant_123',
      ).instance;
      const agentB = agentRegistry.get('gitlabMrMerger', 'tenant_123').instance;

      // Mock agentA._invoke to call agentB.consult
      const originalInvoke = agentA._invoke;
      agentA._invoke = async (prompt, context, tenantId, spanId) => {
        return (await agentB.consult('child query', [], tenantId, spanId))
          .content;
      };

      try {
        await agentA.consult('parent query', [], 'tenant_123');

        // There should be at least two start span calls in the DB
        const insertCalls = dbQuerySpy.mock.calls.filter(call =>
          call[0].includes('INSERT INTO swarm_traces'),
        );
        expect(insertCalls.length).toBe(2);

        const parentInsert = insertCalls[0];
        const childInsert = insertCalls[1];

        const parentSpanId = parentInsert[1][0]; // generated span ID for parent
        const childParentId = childInsert[1][1]; // parent_id column value in child span insertion

        expect(childParentId).toBe(parentSpanId);
      } finally {
        // Restore original _invoke
        agentA._invoke = originalInvoke;
      }
    });
  });

  describe('Secure VM Sandboxed Execution', () => {
    it('should execute safe JS scripts inside the sandboxed context', async () => {
      const agent = agentRegistry.get(
        'gitlabProjectCreator',
        'tenant_123',
      ).instance;
      const result = await agent.runSandboxed('Math.max(10, 20) + 5');
      expect(result).toBe(25);
    });

    it('should block require / process access and throw a sandboxing security violation', async () => {
      const agent = agentRegistry.get(
        'gitlabProjectCreator',
        'tenant_123',
      ).instance;

      expect(() => {
        agent.runSandboxed(
          "const fs = require('fs'); fs.writeFileSync('/tmp/hack.txt', 'compromised');",
        );
      }).toThrow('Security Violation');

      expect(() => {
        agent.runSandboxed('process.exit(1);');
      }).toThrow('Security Violation');

      expect(() => {
        agent.runSandboxed(
          "const cp = require('child_process'); cp.exec('ls');",
        );
      }).toThrow('Security Violation');
    });
  });

  describe('Enterprise Hardening: SSO, RBAC & HA Fallback', () => {
    it('should allow Admin to update Vault credentials but reject Viewer with 403 Forbidden', async () => {
      const { VaultController } = await import('../../src/app/modules/vault/vault.controller.js');
      const { VaultService } = await import('../../src/app/modules/vault/vault.service.js');
      
      const updateSpy = vi.spyOn(VaultService, 'updateCredentials').mockResolvedValue({ success: true });
      
      // 1. Mock Request for Admin user (authorized)
      const reqAdmin = {
        user: { id: 'usr-admin', role: 'admin', tenantRole: 'admin' },
        body: { githubToken: 'gh_token' },
      };
      
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      
      await VaultController.updateKeys(reqAdmin, res, () => {});
      expect(updateSpy).toHaveBeenCalledTimes(1);
      
      // 2. Mock Request for Viewer user (unauthorized)
      const reqViewer = {
        user: { id: 'usr-viewer', role: 'user', tenantRole: 'viewer' },
        body: { githubToken: 'gh_token' },
      };
      
      let nextError = null;
      await VaultController.updateKeys(reqViewer, res, (err) => {
        nextError = err;
      });
      
      expect(nextError).toBeDefined();
      expect(nextError.message).toContain('Forbidden: You do not have permissions to modify vault credentials');
    });

    it('should fallback read operations to standby replica upon primary DB connection failure', async () => {
      const { prisma } = await import('../../src/app/platform/db/prismaClient.js');
      const { logger } = await import('../../src/shared/logger.js');
      
      process.env.STANDBY_DATABASE_URL = 'postgresql://postgres:password@127.0.0.1:5432/standby_db';
      const warnSpy = vi.spyOn(logger, 'warn');

      try {
        await prisma.userBilling.findUnique({ where: { userId: 'tenant-1' } });
      } catch (err) {
        console.log("ACTUAL DB ERROR:", err.message || err);
      }

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Main database connection failed. Routing read query to standby replica')
      );
    });

    it('should generate secure HMAC signature for SIEM dispatches when KMS is offline', async () => {
      const { siemService } = await import('../../src/app/modules/security/siem.service.js');
      const { prisma } = await import('../../src/config/prisma.js');
      
      const webhookSpy = vi.spyOn(prisma.siemWebhook, 'findMany').mockResolvedValueOnce([
        { id: '1', tenantId: 'tenant-1', endpoint: 'http://siem.internal/log', isActive: true, authToken: 'tok' }
      ]);
      
      const axios = (await import('axios')).default;
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({ status: 200 });

      await siemService.dispatchEvent('tenant-1', 'ABAC_CLEARANCE_DENIED', { user: 'hack' });
      
      expect(webhookSpy).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', isActive: true }
      });
      expect(postSpy).toHaveBeenCalled();
      const headers = postSpy.mock.calls[0][2].headers;
      expect(headers['X-Alti-Signature']).toBeDefined();
    });
  });
});
