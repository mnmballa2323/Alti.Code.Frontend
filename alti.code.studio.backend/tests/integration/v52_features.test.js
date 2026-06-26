import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import axios from 'axios';
import { aiProvider } from '../../src/app/modules/ai/ai.provider.js';
import { OfflineEmbeddingCache } from '../../src/app/modules/ai/offline_embedding_cache.js';

// Mock axios
vi.mock('axios', () => {
    return {
        default: {
            post: vi.fn()
        }
    };
});

describe('Milestone v52.0.0 Feature Tests', () => {
    const originalEnv = { ...process.env };
    const FILE_CACHE_PATH = path.resolve('logs/offline_embeddings_cache.json');

    beforeEach(() => {
        process.env.AIR_GAPPED_MODE = 'true';
        vi.clearAllMocks();
        // Remove file cache if exists
        try {
            fs.unlinkSync(FILE_CACHE_PATH);
        } catch (e) {}
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        try {
            fs.unlinkSync(FILE_CACHE_PATH);
        } catch (e) {}
    });

    describe('Pillar 1: Local Model Routing in AIProvider', () => {
        it('should route reasoning and debate critiques to llama3', async () => {
            axios.post.mockResolvedValue({
                data: { response: 'Llama3 reasoning output' }
            });

            const result = await aiProvider.reason('You are the Socratic Critic. Evaluate the refined proposal.');
            
            expect(result).toBe('Llama3 reasoning output');
            expect(axios.post).toHaveBeenCalled();
            const callArgs = vi.mocked(axios.post).mock.calls[0];
            expect(callArgs[0]).toContain('/api/generate');
            expect(callArgs[1].model).toBe('llama3');
            expect(callArgs[1].options.temperature).toBe(0.2);
        });

        it('should route code-related generation prompts to codestral', async () => {
            axios.post.mockResolvedValue({
                data: { response: 'function codestralOutput() {}' }
            });

            const result = await aiProvider.generate('Provide the updated, refactored solution as code: function test() {}');
            
            expect(result).toBe('function codestralOutput() {}');
            expect(axios.post).toHaveBeenCalled();
            const callArgs = vi.mocked(axios.post).mock.calls[0];
            expect(callArgs[0]).toContain('/api/generate');
            expect(callArgs[1].model).toBe('codestral');
            expect(callArgs[1].options.temperature).toBe(0.7);
        });
    });

    describe('Pillar 2: Offline Vector Embedding Cache', () => {
        it('should fetch embedding from Ollama on cache miss and hit cache on subsequent call', async () => {
            const mockEmbedding = [0.1, 0.2, 0.3];
            axios.post.mockResolvedValue({
                data: { embedding: mockEmbedding }
            });

            const text = 'Compute the semantic similarity of RAG pipeline';
            
            // First call: Cache Miss -> calls axios.post
            const embed1 = await aiProvider.embed(text);
            expect(embed1).toEqual(mockEmbedding);
            expect(axios.post).toHaveBeenCalledTimes(1);

            const firstCallArgs = vi.mocked(axios.post).mock.calls[0];
            expect(firstCallArgs[0]).toContain('/api/embeddings');
            expect(firstCallArgs[1].model).toBe('nomic-embed-text');
            expect(firstCallArgs[1].prompt).toBe(text);

            // Verify file cache was created
            expect(fs.existsSync(FILE_CACHE_PATH)).toBe(true);

            // Second call: Cache Hit -> returns cached result, no axios.post call
            vi.clearAllMocks();
            const embed2 = await aiProvider.embed(text);
            expect(embed2).toEqual(mockEmbedding);
            expect(axios.post).not.toHaveBeenCalled();
        });
    });

    describe('Pillar 3: GCP deploy script dry-run validation', () => {
        it('should validate Google Cloud sovereign deployment parameters in dry-run', () => {
            const rootPath = path.resolve(process.cwd(), '..');
            const result = execSync(
                `bash ./deploy_enterprise.sh --deployment-option government --region us-gov-west1 --project alti-gov-project --dry-run`,
                { encoding: 'utf8', cwd: rootPath }
            );

            expect(result).toContain('🌍 ALTI CODE STUDIO: GCP SOVEREIGN ENTERPRISE DEPLOYER');
            expect(result).toContain('[DRY RUN] Simulating GCP Sovereign deployment...');
            expect(result).toContain('-var="gcp_project_id=alti-gov-project"');
            expect(result).toContain('-var="gcp_region_government=us-gov-west1"');
            expect(result).toContain('-var="enable_gcp_government=true"');
        });
    });
});
