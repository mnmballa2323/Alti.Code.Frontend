import { describe, it, expect, beforeEach } from 'vitest';
import { promptCacheGatewayService } from './prompt_cache_gateway.service.js';

describe('PromptCacheGatewayService Tests', () => {
    beforeEach(() => {
        promptCacheGatewayService.clearStats();
    });

    it('should format the optimized prompt cleanly', () => {
        const sys = 'You are an engineer';
        const files = [{ path: 'src/index.js', content: 'console.log("hello");' }];
        const query = 'Add a comment';

        const result = promptCacheGatewayService.optimizePrompt(sys, files, query);

        expect(result.finalPrompt).toContain('System: You are an engineer');
        expect(result.finalPrompt).toContain('--- FILE: src/index.js ---');
        expect(result.finalPrompt).toContain('User Request: Add a comment');
    });

    it('should register a miss on first compile, and a hit on subsequent identical runs', () => {
        const sys = 'System preamble';
        const files = [{ path: 'file.js', content: 'code' }];
        const query1 = 'Query 1';
        const query2 = 'Query 2';

        const result1 = promptCacheGatewayService.optimizePrompt(sys, files, query1);
        expect(result1.cacheHit).toBe(false);
        expect(result1.stats.misses).toBe(1);
        expect(result1.stats.hits).toBe(0);

        // Run again with different volatile user query, but identical static files context
        const result2 = promptCacheGatewayService.optimizePrompt(sys, files, query2);
        expect(result2.cacheHit).toBe(true);
        expect(result2.stats.misses).toBe(1);
        expect(result2.stats.hits).toBe(1);
    });

    it('should register a miss if the static file contexts are updated', () => {
        const sys = 'System preamble';
        const files1 = [{ path: 'file.js', content: 'content v1' }];
        const files2 = [{ path: 'file.js', content: 'content v2' }];
        const query = 'Run audit';

        const result1 = promptCacheGatewayService.optimizePrompt(sys, files1, query);
        expect(result1.cacheHit).toBe(false);

        const result2 = promptCacheGatewayService.optimizePrompt(sys, files2, query);
        expect(result2.cacheHit).toBe(false);
        expect(result2.stats.misses).toBe(2);
        expect(result2.stats.hits).toBe(0);
    });
});
