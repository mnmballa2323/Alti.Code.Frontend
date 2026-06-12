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
      const { vertexService } =
        await import('../../src/app/modules/ai/vertex.service.js');
      vi.spyOn(vertexService, 'getEmbeddings').mockResolvedValue([
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
});
