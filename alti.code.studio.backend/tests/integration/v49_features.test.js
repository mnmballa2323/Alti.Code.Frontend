import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GitContextGrounder } from '../../src/app/modules/sandbox/git_context_grounder.js';
import { AstGraphNavigator } from '../../src/app/modules/sandbox/ast_graph_navigator.js';
import { SocraticDebateChamber } from '../../src/app/modules/agents/socratic_debate_chamber.js';
import { filesystemTool } from '../../src/app/modules/mcp/tools/filesystem.tool.js';
import { neo4jService } from '../../src/app/services/neo4j.service.js';
import { socketService } from '../../src/app/services/socket.service.js';
import { aiProvider } from '../../src/app/modules/ai/ai.provider.js';

// Mock neo4jService and socketService
vi.mock('../../src/app/services/neo4j.service.js', () => ({
    neo4jService: {
        executeCypher: vi.fn(async () => [])
    }
}));

vi.mock('../../src/app/services/socket.service.js', () => ({
    socketService: {
        broadcast: vi.fn()
    }
}));

// Mock aiProvider for deterministic prompts
vi.mock('../../src/app/modules/ai/ai.provider.js', () => ({
    aiProvider: {
        reason: vi.fn(async () => 'DECISION: APPROVED'),
        generate: vi.fn(async () => 'function optimized() {}')
    }
}));

describe('Milestone v49.0.0 Feature Tests', () => {
    const mockCodeFile = path.resolve('./logs/workspaces/v49_mock_file.js');

    beforeAll(() => {
        AstGraphNavigator.debounceDelay = 0;
        const mockCode = `
            class MathOperations {
                async add(a, b) {
                    return a + b;
                }
            }
            function subtract(a, b) {
                return a - b;
            }
        `;
        fs.mkdirSync(path.dirname(mockCodeFile), { recursive: true });
        fs.writeFileSync(mockCodeFile, mockCode, 'utf8');
    });

    afterAll(() => {
        try {
            fs.unlinkSync(mockCodeFile);
        } catch (e) {}
    });

    describe('Pillar 1: Git Blame Context Grounder', () => {
        it('should fetch git blame details and commit message for a file range', async () => {
            // We run it on our existing code_execution_sandbox.js which has committed history
            const targetFile = path.resolve('src/app/modules/sandbox/code_execution_sandbox.js');
            const context = await GitContextGrounder.getLineBlameContext(targetFile, 15, 20);

            expect(context).toContain('[Git Context Grounding');
            expect(context).toContain('Commit:');
            expect(context).toContain('Author:');
            expect(context).toContain('Message:');
        });

        it('should fallback gracefully for untracked or non-existent files', async () => {
            const context = await GitContextGrounder.getLineBlameContext('non_existent.js', 1, 5);
            expect(context).toContain('does not exist');
        });
    });

    describe('Pillar 2: Unified Neo4j AST Code-Graph Ingestion', () => {
        it('should parse symbols and sync them to Neo4j with correct labels and relations', async () => {
            vi.clearAllMocks();
            await AstGraphNavigator.syncFileToNeo4j(mockCodeFile);

            expect(neo4jService.executeCypher).toHaveBeenCalled();
            // Verify MERGE file node query was triggered
            const calls = vi.mocked(neo4jService.executeCypher).mock.calls;
            expect(calls.some(c => c[0].includes('MERGE (f:File'))).toBe(true);
            expect(calls.some(c => c[0].includes('MERGE (s:AstSymbol'))).toBe(true);
        });
    });

    describe('Pillar 3: Socratic Debate Context Grounding', () => {
        it('should query Git and AST contexts and inject them into Socratic prompts', async () => {
            vi.clearAllMocks();
            const topic = 'Optimize add function';
            const proposal = 'async add(a,b) { return a+b; }';

            const outcome = await SocraticDebateChamber.runDebate(topic, proposal, 1, {
                filePath: mockCodeFile,
                symbolName: 'MathOperations.add'
            });

            expect(outcome.consensus).toBe(true);
            
            // Check that GitContextGrounder context was fetched and passed to aiProvider
            const calls = vi.mocked(aiProvider.reason).mock.calls;
            expect(calls.length).toBeGreaterThan(0);
            expect(calls[0][0]).toContain('Grounded Codebase Context');
            expect(calls[0][0]).toContain('Git Ownership & History');
            expect(calls[0][0]).toContain('Target AST Symbol Code');
        });
    });

    describe('Pillar 4: Real-Time Workspace Broadcasting', () => {
        it('should broadcast filesystem write_file event and trigger Neo4j sync', async () => {
            vi.clearAllMocks();
            const tempWritePath = 'logs/workspaces/broadcast_test.js';
            const absoluteTempPath = path.resolve(tempWritePath);

            await filesystemTool.handler({
                action: 'write_file',
                path: tempWritePath,
                content: 'console.log("hello");'
            });

            // Verify broadcast event was emitted
            expect(socketService.broadcast).toHaveBeenCalledWith('workspace', 'changed', {
                path: tempWritePath,
                action: 'write_file'
            });

            // Wait for debounced sync to complete
            await new Promise(resolve => setTimeout(resolve, 50));

            // Verify Neo4j sync was triggered for the written file
            expect(neo4jService.executeCypher).toHaveBeenCalled();

            // Cleanup
            try {
                fs.unlinkSync(absoluteTempPath);
            } catch (e) {}
        });
    });
});
