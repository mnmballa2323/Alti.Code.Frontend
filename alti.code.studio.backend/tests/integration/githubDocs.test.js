import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { githubDocsService } from '../../src/app/modules/githubDocs/githubDocs.service.js';

// Mock axios
vi.mock('axios');

describe('GitHub Docs Ingestion Service Integration', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        githubDocsService.status = 'idle';
        githubDocsService.totalArticles = 0;
        githubDocsService.syncedArticles = 0;
        githubDocsService.failedArticles = 0;
        githubDocsService.syncError = null;
        githubDocsService.cancelRequested = false;
    });

    it('should successfully initialize the service with default values', () => {
        expect(githubDocsService).toBeDefined();
        expect(githubDocsService.status).toBe('idle');
        expect(githubDocsService.totalArticles).toBe(0);
        expect(githubDocsService.syncedArticles).toBe(0);
        expect(githubDocsService.failedArticles).toBe(0);
        
        const status = githubDocsService.getStatus();
        expect(status.status).toBe('idle');
        expect(status.progress).toBe('0.00');
    });

    it('should successfully fetch the page list and ingest mocked articles', async () => {
        // Mock Page List API response
        axios.get.mockImplementation((url) => {
            if (url.includes('pagelist')) {
                return Promise.resolve({
                    data: '/en/get-started\n/en/actions\n/en/rest'
                });
            } else if (url.includes('article/body')) {
                return Promise.resolve({
                    data: '# Mock GitHub Article Body\n\nThis is a beautiful article to test RAG and AgentMemory.'
                });
            }
            return Promise.reject(new Error('Unknown URL mocked'));
        });

        // Set batchSize small for fast testing
        githubDocsService.batchSize = 2;
        githubDocsService.delayBetweenBatchesMs = 1;

        const result = await githubDocsService.syncDocs();
        
        expect(githubDocsService.status).toBe('completed');
        expect(githubDocsService.totalArticles).toBe(3);
        expect(githubDocsService.syncedArticles).toBe(3);
        expect(githubDocsService.failedArticles).toBe(0);
        expect(githubDocsService.lastSyncTime).toBeDefined();
        expect(result).toBeUndefined();
    });

    it('should cancel the sync gracefully if cancellation is requested', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('pagelist')) {
                return Promise.resolve({
                    data: '/en/a\n/en/b\n/en/c\n/en/d\n/en/e'
                });
            } else {
                return Promise.resolve({ data: '# article body' });
            }
        });

        githubDocsService.batchSize = 1;
        githubDocsService.delayBetweenBatchesMs = 10;

        // Start sync
        const syncPromise = githubDocsService.syncDocs();
        
        // Immediately request cancel
        githubDocsService.cancelSync();

        const result = await syncPromise;
        expect(result).toEqual({ status: 'cancelled' });
        expect(githubDocsService.status).toBe('idle');
    });
});
