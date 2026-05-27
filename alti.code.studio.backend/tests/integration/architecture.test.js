global.self = global;
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as ArchitectureService from '../../src/app/modules/architecture/architecture.service.js';
import { ultimateRagService } from '../../src/app/modules/rag/ultimate_rag.service.js';
import { GoogleGenAiService } from '../../src/app/modules/googleGenAi/googleGenAi.service.js';
import { ArchitectureNode, ArchitectureEdge } from '../../src/app/modules/architecture/architecture.model.js';

vi.mock('../../src/app/modules/googleGenAi/googleGenAi.service.js', () => ({
    GoogleGenAiService: {
        generateContent: vi.fn()
    }
}));

vi.mock('../../src/app/modules/rag/ultimate_rag.service.js', () => ({
    ultimateRagService: {
        synthesize: vi.fn().mockResolvedValue({
            synthesis: 'Mocked RAG synthesis answer about architecture.',
            pipeline: {
                sources: [
                    {
                        id: 'vertex',
                        status: 'done',
                        result: [
                            { document: { id: 'src/app/modules/auth/auth.service.js', name: 'auth.service.js' } }
                        ]
                    }
                ],
                retrievalMs: 150,
                synthesisMs: 200,
                totalMs: 350,
                activeSources: 1
            }
        })
    }
}));

vi.mock('../../src/app/modules/architecture/architecture.model.js', () => ({
    ArchitectureNode: {
        find: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
                { _id: 'node-id-1', type: 'file', name: 'AuthService', layer: 'backend', path: 'src/app/modules/auth/auth.service.js' }
            ])
        }),
        findById: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue({
                _id: 'node-id-1', name: 'AuthService', path: 'src/app/modules/auth/auth.service.js', layer: 'backend', metadata: {}, aiEnrichment: { summary: 'Mock node' }
            })
        }),
        countDocuments: vi.fn().mockResolvedValue(1)
    },
    ArchitectureEdge: {
        find: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([])
        })
    }
}));

describe('Architecture Microservice & QA RAG Integration Tests', () => {
    it('should retrieve graph nodes and edges from database', async () => {
        const graph = await ArchitectureService.getGraph('mock-repo-id');
        expect(graph.nodes.length).toBeGreaterThan(0);
        expect(graph.nodes[0].name).toBe('AuthService');
    });

    it('should retrieve node details successfully', async () => {
        const node = await ArchitectureService.getNodeDetails('node-id-1');
        expect(node.name).toBe('AuthService');
        expect(node.path).toBe('src/app/modules/auth/auth.service.js');
    });

    it('should retrieve cluster details successfully', async () => {
        const cluster = await ArchitectureService.getClusterDetails('backend');
        expect(cluster.layer).toBe('backend');
        expect(cluster.nodeCount).toBe(1);
    });

    it('should execute high-fidelity RAG QA when askQuestion is called', async () => {
        const result = await ArchitectureService.askQuestion('How is authentication secured?', 'mock-repo-id');
        expect(result.answer).toBe('Mocked RAG synthesis answer about architecture.');
        expect(result.references).toContain('src/app/modules/auth/auth.service.js');
        expect(result.telemetry.totalMs).toBe(350);
    });
});
