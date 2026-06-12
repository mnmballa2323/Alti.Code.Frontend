import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { mimoCheckpointService } from './mimo_checkpoint.service.js';
import { mimoDreamService } from './mimo_dream.service.js';
import { mimoDistillerService } from './mimo_distiller.service.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { agentMemoryService } from './agentmemory.service.js';

vi.mock('../gemini/gemini.service.js', () => ({
    GeminiAiService: {
        generateContent: vi.fn(),
    }
}));

vi.mock('./agentmemory.service.js', () => ({
    agentMemoryService: {
        isReady: true,
        smartSearch: vi.fn(),
        getContext: vi.fn(),
    }
}));

describe('MiMo-Code Active Memory Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(async () => {
        // Cleanup generated test files
        try {
            await fs.unlink(mimoCheckpointService.checkpointPath);
        } catch {}

        try {
            const testAgentPath = path.join(mimoDistillerService.definitionsDir, 'agent.test.agent.yaml');
            await fs.unlink(testAgentPath);
        } catch {}
    });

    describe('MimoCheckpointService', () => {
        it('should skip compaction if context size is below threshold', async () => {
            const context = ['Small log entry', 'Another short line'];
            const result = await mimoCheckpointService.checkAndCompact(context, 1000);
            expect(result).toBe(context);
        });

        it('should compact context and write milestone checkpoint if size exceeds threshold', async () => {
            const context = [
                'Very long context log entry item 1 '.repeat(100),
                'Very long context log entry item 2 '.repeat(100),
            ];
            
            const mockCheckpointMarkdown = '### Milestone Checkpoint\n- Achieved: Verified server startup.';
            GeminiAiService.generateContent.mockResolvedValue(mockCheckpointMarkdown);

            const result = await mimoCheckpointService.checkAndCompact(context, 1000);

            // Verify file was written
            const fileContent = await fs.readFile(mimoCheckpointService.checkpointPath, 'utf8');
            expect(fileContent).toContain('Milestone Checkpoint');
            expect(fileContent).toContain('Verified server startup.');

            // Verify context was compacted
            expect(result.length).toBe(1);
            expect(result[0]).toContain('[MIMO_ACTIVE_CHECKPOINT]');
            expect(result[0]).toContain('Verified server startup.');
        });
    });

    describe('MimoDreamService', () => {
        it('should process dream cycle and synthesize MEMORY.md', async () => {
            const mockMemories = {
                results: [
                    { content: 'Configured Redis on port 6379 in server.js' },
                    { content: 'Added dynamic routes in route.js' }
                ]
            };
            agentMemoryService.smartSearch.mockResolvedValue(mockMemories);

            const mockDreamSummary = '# Alti.Code.Studio Memory\n\n## Architectural Patterns\n- Redis running on 6379 in server.js\n- Routes are dynamic in route.js';
            GeminiAiService.generateContent.mockResolvedValue(mockDreamSummary);

            const result = await mimoDreamService.dream();

            expect(result.success).toBe(true);
            expect(result.changes).toBe(2);

            const memoryFileContent = await fs.readFile(mimoDreamService.memoryMdPath, 'utf8');
            expect(memoryFileContent).toContain('Architectural Patterns');
            expect(memoryFileContent).toContain('Redis running on 6379');
        });
    });

    describe('MimoDistillerService', () => {
        it('should distill trajectory into new agent.yaml', async () => {
            const mockYaml = `
id: agent.test
name: Test Agent
version: "1.0.0"
description: Test Specialist Agent
preamble: |
  You specialize in verifying dynamic imports.
capabilities:
  - testing
`;
            GeminiAiService.generateContent.mockResolvedValue(mockYaml);

            const result = await mimoDistillerService.distill(
                'Verify imports functionality',
                'Log: Loaded imports successfully.\nLog: Resolved import hooks.',
                'agent.test'
            );

            expect(result.success).toBe(true);
            expect(result.agentId).toBe('agent.test');
            
            const fileContent = await fs.readFile(result.filePath, 'utf8');
            expect(fileContent).toContain('name: Test Agent');
            expect(fileContent).toContain('capabilities:\n  - testing');
        });
    });

    describe('MimoDreamService Lifecycle', () => {
        it('should initialize dream intervals and shutdown cleanly', () => {
            const spySetTimeout = vi.spyOn(global, 'setTimeout');
            const spySetInterval = vi.spyOn(global, 'setInterval');
            const spyClearInterval = vi.spyOn(global, 'clearInterval');

            mimoDreamService.init();

            expect(spySetTimeout).toHaveBeenCalled();
            expect(spySetInterval).toHaveBeenCalled();

            mimoDreamService.shutdown();
            expect(spyClearInterval).toHaveBeenCalled();
        });
    });

    describe('MemoryController MiMo REST Endpoints', () => {
        it('should trigger mimoDream endpoint successfully', async () => {
            const { MemoryController } = await import('./memory.controller.js');
            const mockDream = vi.spyOn(mimoDreamService, 'dream').mockResolvedValue({ success: true });

            const req = { body: { project: 'test-project' } };
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            };

            await MemoryController.mimoDream(req, res);

            expect(mockDream).toHaveBeenCalledWith('test-project');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: expect.stringContaining('MimoDream')
            }));
        });

        it('should trigger mimoDistill endpoint successfully', async () => {
            const { MemoryController } = await import('./memory.controller.js');
            const mockDistill = vi.spyOn(mimoDistillerService, 'distill').mockResolvedValue({ success: true });

            const req = { body: { taskDescription: 'Test task', logs: 'Log info', targetId: 'agent.test' } };
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            };

            await MemoryController.mimoDistill(req, res);

            expect(mockDistill).toHaveBeenCalledWith('Test task', 'Log info', 'agent.test');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: expect.stringContaining('MimoDistiller')
            }));
        });
    });

    describe('Tri-Brain Consensus Distillation Trigger', () => {
        it('should trigger mimoDistillerService.distill on APPROVED consensus status', async () => {
            const { triBrainService } = await import('../agents/tri_brain.service.js');
            const mockDistill = vi.spyOn(mimoDistillerService, 'distill').mockResolvedValue({ success: true });

            // Mock TriBrainService internal calls to bypass real LLMs
            vi.spyOn(triBrainService.azureOpenAi.chat.completions, 'create').mockResolvedValue({
                choices: [{ message: { content: 'APPROVED\nNO_CHANGE' } }]
            });
            vi.spyOn(triBrainService.anthropic.messages, 'create').mockResolvedValue({
                content: [{ text: 'const a = 1;' }]
            });

            // Mock imports
            vi.mock('../knowledge/knowledge.rag.service.js', () => ({
                knowledgeRagService: {
                    queryKnowledgeBase: () => ({ answer: 'Mock answer', citations: [] })
                }
            }));
            vi.mock('./graph.memory.service.js', () => ({
                graphMemoryService: {
                    queryIntentGraph: () => 'Mock graph'
                }
            }));

            await triBrainService.executeConsensusLoop('Implement oauth setup');

            expect(mockDistill).toHaveBeenCalled();
            expect(mockDistill.mock.calls[0][0]).toBe('Implement oauth setup');
            expect(mockDistill.mock.calls[0][1]).toContain('const a = 1;');
            expect(mockDistill.mock.calls[0][2]).toContain('agent.distilled.consensus');
        });
    });

    describe('AutonomousRepairDaemon Dream Trigger', () => {
        it('should trigger mimoDreamService.dream during scanForArchitecturalDecay', async () => {
            const { autonomousRepairDaemon } = await import('../agents/autonomous_repair_daemon.js');
            const mockDream = vi.spyOn(mimoDreamService, 'dream').mockResolvedValue({ success: true });

            // Mock calculating centrality to bypass real file system crawling
            vi.spyOn(autonomousRepairDaemon, 'calculateLocalDependencyCentrality').mockResolvedValue([
                { name: 'src/app/modules/memory/vector.store.js', score: 1 }
            ]);

            await autonomousRepairDaemon.scanForArchitecturalDecay();

            expect(mockDream).toHaveBeenCalled();
        });
    });

    describe('AgentMemoryHooks Local MD Entrenchment', () => {
        it('should inject local memory rules matched by keywords', async () => {
            const mockMemoryMd = `# Alti.Code.Studio Memory\n\n- Redis running on port 6379 in server.js\n- Postgres database uses pgvector extension\n- General unrelated rule\n`;
            vi.spyOn(fs, 'readFile').mockResolvedValue(mockMemoryMd);

            const { AgentMemoryHooks } = await import('./agentmemory.hooks.js');
            agentMemoryService.smartSearch.mockResolvedValue({ results: [] });

            const results = await AgentMemoryHooks.recallContext('We need to check the Redis port configuration', 5);

            expect(results).toContain('[MimoMemory] Redis running on port 6379 in server.js');
            expect(results).not.toContain('[MimoMemory] Postgres database uses pgvector extension');
            expect(results).not.toContain('[MimoMemory] General unrelated rule');
        });

        it('should prepend local memory rules to project context', async () => {
            const mockMemoryMd = `# Alti.Code.Studio Memory\n- Redis running on 6379\n`;
            vi.spyOn(fs, 'readFile').mockResolvedValue(mockMemoryMd);

            const { AgentMemoryHooks } = await import('./agentmemory.hooks.js');
            agentMemoryService.getContext.mockResolvedValue({ context: 'AgentMemory context' });

            const context = await AgentMemoryHooks.getProjectContext(2000);

            expect(context).toContain('=== COMPACTED LONG-TERM MEMORY RULES ===');
            expect(context).toContain('- Redis running on 6379');
            expect(context).toContain('AgentMemory context');
        });
    });
});
