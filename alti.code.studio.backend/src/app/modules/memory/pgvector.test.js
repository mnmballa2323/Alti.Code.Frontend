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
        expect(vectorStoreService.add).toHaveBeenCalledWith('Fragment 1 representing code context', { source: 'rag_service', chunkIndex: 0 });
        expect(vectorStoreService.add).toHaveBeenCalledWith('Fragment 2 detailing architecture', { source: 'rag_service', chunkIndex: 1 });
    });

    it('ragService should query the vector store and synthesize a response via Gemini', async () => {
        const mockResults = {
            documents: [['Fragment 1 representing code context']],
            metadatas: [[{ source: 'rag_service' }]],
            ids: [['test_id']]
        };
        vectorStoreService.search.mockResolvedValue(mockResults);
        vertexService.generateContent.mockResolvedValue('Synthesized response based on context.');

        const response = await ragService.query('What is the architecture?');

        expect(vectorStoreService.search).toHaveBeenCalledWith('What is the architecture?', 5);
        expect(vertexService.generateContent).toHaveBeenCalled();
        expect(response).toBe('Synthesized response based on context.');
    });

    it('ragService should return a fallback message if no context is found', async () => {
        const mockResults = {
            documents: [[]],
            metadatas: [[]],
            ids: [[]]
        };
        vectorStoreService.search.mockResolvedValue(mockResults);

        const response = await ragService.query('Is there anything here?');

        expect(vectorStoreService.search).toHaveBeenCalledWith('Is there anything here?', 5);
        expect(vertexService.generateContent).not.toHaveBeenCalled();
        expect(response).toBe('No relevant context found in Enterprise Memory to answer the query.');
    });
});
