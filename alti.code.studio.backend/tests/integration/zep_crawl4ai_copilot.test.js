/**
 * Copyright (c) 2026 Inso Code
 *
 * zep_crawl4ai_copilot.test.js — Integration tests for evaluation, scraping, memory and copilot modules.
 */

import '../../polyfill.js';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { zepMemoryService } from '../../src/app/modules/memory/zep.service.js';
import { Crawl4AiService } from '../../src/app/modules/scraper/crawl4ai.service.js';
import { copilotRoutes } from '../../src/app/modules/copilot/copilot.route.js';
import { PageBrowserAutomation } from '../../src/app/modules/browser/page_browser_automation.js';

describe('Zep, Crawl4AI, and CopilotKit Integration Tests', () => {
    let app;
    let server;
    let port;

    beforeAll(async () => {
        app = express();
        app.use(express.json());
        app.use('/api/v1/copilot', copilotRoutes);

        server = await new Promise((resolve) => {
            const s = app.listen(0, () => resolve(s));
        });
        port = server.address().port;

        // Mock PageBrowserAutomation to avoid spawning real Chromium instances during test runs
        vi.spyOn(PageBrowserAutomation, 'scrapePage').mockResolvedValue({
            success: true,
            title: 'Mocked Example Title',
            extractedText: 'This is mocked text from PageBrowserAutomation.'
        });
    });

    afterAll(() => {
        server.close();
        vi.restoreAllMocks();
    });

    it('should verify Zep memory service fallback behaviour', async () => {
        // Zep is not configured in test environment by default, isActive should be false
        expect(zepMemoryService.isActive()).toBe(false);

        // Test methods fail gracefully/noop when not active
        await expect(zepMemoryService.addMemory('session-test-1', 'human', 'Hello')).resolves.not.toThrow();
        const mem = await zepMemoryService.getMemory('session-test-1');
        expect(mem).toEqual({ summary: '', relevantHistory: [] });
    });

    it('should verify Crawl4AI fallback to Puppeteer browser automation', async () => {
        const result = await Crawl4AiService.crawl('https://example.com');
        
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.title).toBe('Mocked Example Title');
        expect(result.content).toBe('This is mocked text from PageBrowserAutomation.');
        expect(result.source).toBe('puppeteer');
    });

    it('should verify CopilotKit stream endpoint returns a valid SSE stream', async () => {
        const response = await fetch(`http://localhost:${port}/api/v1/copilot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: 'Hello Copilot!' }
                ]
            })
        });

        expect(response.status).toBe(200);
        
        const body = await response.text();
        expect(body).toContain('data:');
        expect(body).toContain('[MOCK GEMINI COPILOT]');
        expect(body).toContain('data: [DONE]');
    });
});
