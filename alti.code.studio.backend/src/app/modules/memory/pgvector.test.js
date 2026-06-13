import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vectorStoreService } from './vector.store.js';
import { ragService } from './rag.service.js';
import { vertexService } from '../ai/vertex.service.js';

vi.mock('../ai/vertex.service.js');
vi.mock('./vector.store.js', async () => {
    const original = await vi.importActual('./vector.store.js');
    return {
        ...original,
        vectorStoreService: {
            add: vi.fn(),
            search: vi.fn()
        }
    };
});

describe('Global Enterprise Memory (AlloyDB/pgvector)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('ragService should chunk documents and store them in the vector store', async () => {
        const mockTexts = ['Fragment 1 representing code context', 'Fragment 2 detailing architecture'];
        vectorStoreService.add.mockResolvedValue('test_id');

        await ragService.createIndex(mockTexts);

        expect(vectorStoreService.add).toHaveBeenCalledTimes(2);
        expect(vectorStoreService.add).toHaveBeenCalledWith('Fragment 1 representing code context', { source: 'rag_service', chunkIndex: 0 }, 'default_enterprise_tenant');
        expect(vectorStoreService.add).toHaveBeenCalledWith('Fragment 2 detailing architecture', { source: 'rag_service', chunkIndex: 1 }, 'default_enterprise_tenant');
    });

    it('ragService should query the vector store and synthesize a response via Gemini', async () => {
        vertexService.getEmbeddings.mockResolvedValue([0.1, 0.2]);
        vertexVectorSearch.queryContext.mockResolvedValue([{ id: 'test_id' }]);
        vectorStoreService.getByIds.mockResolvedValue(['Fragment 1 representing code context']);
        vertexService.generateContent.mockResolvedValue('Synthesized response based on context.');

        const response = await ragService.query('What is the architecture?');

        expect(vertexVectorSearch.queryContext).toHaveBeenCalledWith([0.1, 0.2], 5);
        expect(vectorStoreService.getByIds).toHaveBeenCalledWith(['test_id'], 'default_enterprise_tenant');
        expect(vertexService.generateContent).toHaveBeenCalled();
        expect(response).toBe('Synthesized response based on context.');
    });

    it('ragService should return a fallback message if no context is found', async () => {
        vertexService.getEmbeddings.mockResolvedValue([0.1, 0.2]);
        vertexVectorSearch.queryContext.mockResolvedValue([]);

        const response = await ragService.query('Is there anything here?');

        expect(vertexVectorSearch.queryContext).toHaveBeenCalledWith([0.1, 0.2], 5);
        expect(vertexService.generateContent).not.toHaveBeenCalled();
        expect(response).toBe('No relevant context found in Enterprise Memory to answer the query.');
    });
});
