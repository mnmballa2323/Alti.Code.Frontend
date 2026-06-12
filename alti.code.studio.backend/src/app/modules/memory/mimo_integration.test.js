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
});
