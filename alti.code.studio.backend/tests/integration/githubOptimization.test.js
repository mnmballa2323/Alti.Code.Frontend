import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { githubDocsService } from '../../src/app/modules/githubDocs/githubDocs.service.js';
import { ragService } from '../../src/app/modules/memory/rag.service.js';
import { GeminiAiService } from '../../src/app/modules/gemini/gemini.service.js';

// Mock axios and ragService
vi.mock('axios');
vi.mock('../../src/app/modules/memory/rag.service.js', () => ({
    ragService: {
        createIndex: vi.fn().mockResolvedValue(true)
    }
}));

describe('GitHub Swarm Production Optimization & Dispatch Gateway', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        githubDocsService.hashCache.clear();
        githubDocsService.syncedArticles = 0;
        githubDocsService.failedArticles = 0;
    });

    describe('Ingestion MD5 Content Hashing Cache', () => {
        it('should index article into RAG vector store on first ingestion, and skip on subsequent syncs if content is unchanged', async () => {
            const pathName = '/en/actions/quickstart';
            const mockMarkdown = '# Actions Quickstart\n\nWelcome to GitHub Actions!';

            axios.get.mockResolvedValue({ data: mockMarkdown });

            // 1. First Ingestion: Index should be created
            await githubDocsService.ingestArticle(pathName);

            expect(githubDocsService.syncedArticles).toBe(1);
            expect(githubDocsService.failedArticles).toBe(0);
            expect(ragService.createIndex).toHaveBeenCalledTimes(1);

            // 2. Second Ingestion (Unchanged Content): Should skip createIndex but count as synced
            await githubDocsService.ingestArticle(pathName);

            expect(githubDocsService.syncedArticles).toBe(2);
            expect(githubDocsService.failedArticles).toBe(0);
            expect(ragService.createIndex).toHaveBeenCalledTimes(1); // Still 1 time! Caching worked!
        });

        it('should re-index article if content has changed', async () => {
            const pathName = '/en/actions/quickstart';
            const mockMarkdown1 = '# Actions Quickstart\n\nWelcome to GitHub Actions!';
            const mockMarkdown2 = '# Actions Quickstart\n\nWelcome to GitHub Actions! [UPDATED CONTENT]';

            // First fetch returns mockMarkdown1
            axios.get.mockResolvedValueOnce({ data: mockMarkdown1 });
            await githubDocsService.ingestArticle(pathName);

            expect(ragService.createIndex).toHaveBeenCalledTimes(1);

            // Second fetch returns mockMarkdown2 (changed!)
            axios.get.mockResolvedValueOnce({ data: mockMarkdown2 });
            await githubDocsService.ingestArticle(pathName);

            expect(ragService.createIndex).toHaveBeenCalledTimes(2); // Ingested again! Cache successfully invalidated!
        });
    });

    describe('Swarm Dispatch API Gateway (/consult)', () => {
        it('should automatically route a YAML or CI/CD query to githubActionsVariablesManager', async () => {
            const query = 'How do I add environment variables to my build Actions workflow yaml?';
            const mockAiResponse = 'Route completed successfully by githubActionsVariablesManager';

            // Spy on searchDocs
            vi.spyOn(githubDocsService, 'searchDocs').mockResolvedValue('actions grounded content');
            
            // Mock Gemini AI Content Generation
            const generateContentSpy = vi
                .spyOn(GeminiAiService, 'generateContent')
                .mockResolvedValue(mockAiResponse);

            // Dispatch query
            const result = await githubDocsService.dispatchQueryToSwarm(query);

            expect(result.agent).toBe('githubActionsVariablesManager');
            expect(result.content).toBe(mockAiResponse);
            expect(generateContentSpy).toHaveBeenCalled();
        });

        it('should automatically route a Webhook or App query to githubAppWebhookVerifier', async () => {
            const query = 'Validate x-hub-signature-256 webhook signatures using a secret key';
            const mockAiResponse = 'Route completed successfully by githubAppWebhookVerifier';

            vi.spyOn(githubDocsService, 'searchDocs').mockResolvedValue('security app webhooks grounded content');
            
            const generateContentSpy = vi
                .spyOn(GeminiAiService, 'generateContent')
                .mockResolvedValue(mockAiResponse);

            const result = await githubDocsService.dispatchQueryToSwarm(query);

            expect(result.agent).toBe('githubAppWebhookVerifier');
            expect(result.content).toBe(mockAiResponse);
            expect(generateContentSpy).toHaveBeenCalled();
        });

        it('should automatically route a project board or CODEOWNERS query to githubBranchProtector', async () => {
            const query = 'How to structure branch protection rules and CODEOWNERS matrices?';
            const mockAiResponse = 'Route completed successfully by githubBranchProtector';

            vi.spyOn(githubDocsService, 'searchDocs').mockResolvedValue('collaboration projects board grounded content');
            
            const generateContentSpy = vi
                .spyOn(GeminiAiService, 'generateContent')
                .mockResolvedValue(mockAiResponse);

            const result = await githubDocsService.dispatchQueryToSwarm(query);

            expect(result.agent).toBe('githubBranchProtector');
            expect(result.content).toBe(mockAiResponse);
            expect(generateContentSpy).toHaveBeenCalled();
        });

        it('should route general REST API and CLI queries to githubExpert coordinator', async () => {
            const query = 'Fetch all repository releases via Octokit REST API';
            const mockAiResponse = 'Route completed successfully by githubExpert';

            vi.spyOn(githubDocsService, 'searchDocs').mockResolvedValue('general docs grounded content');
            
            const generateContentSpy = vi
                .spyOn(GeminiAiService, 'generateContent')
                .mockResolvedValue(mockAiResponse);

            const result = await githubDocsService.dispatchQueryToSwarm(query);

            expect(result.agent).toBe('githubExpert');
            expect(result.content).toBe(mockAiResponse);
            expect(generateContentSpy).toHaveBeenCalled();
        });

        it('should respect a preferred agent override bypass', async () => {
            const query = 'Write branch protections'; // Typically routes to githubProjectsManager
            const mockAiResponse = 'Explicit override response';

            vi.spyOn(githubDocsService, 'searchDocs').mockResolvedValue('override docs');
            
            vi.spyOn(GeminiAiService, 'generateContent').mockResolvedValue(mockAiResponse);

            // Bypass auto-routing, target githubAppAuditor explicitly
            const result = await githubDocsService.dispatchQueryToSwarm(query, 'githubAppAuditor');

            expect(result.agent).toBe('githubAppAuditor');
            expect(result.content).toBe(mockAiResponse);
        });
    });
});
