/**
 * Copyright (c) 2026 Inso Code
 *
 * frameworks.test.js — Integration tests for Vercel AI SDK, ElizaOS, GenSX and Mastra modules.
 */

import '../../polyfill.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { VercelAiService } from '../../src/app/modules/ai/vercel_ai.service.js';
import { ElizaAgentService } from '../../src/app/modules/agents/eliza_agent.service.js';
import { GenSxWorkflowService } from '../../src/app/modules/workflow/gensx_workflow.service.js';
import { MastraAgentService } from '../../src/app/modules/agents/mastra_agent.service.js';
import { frameworksRoutes } from '../../src/app/modules/frameworks/frameworks.route.js';

describe('Trending Open Source Frameworks Integration Tests', () => {
    let app;
    let server;
    let port;

    beforeAll(async () => {
        app = express();
        app.use(express.json());
        app.use('/api/v1/frameworks', frameworksRoutes);

        server = await new Promise((resolve) => {
            const s = app.listen(0, () => resolve(s));
        });
        port = server.address().port;
    });

    afterAll(() => {
        server.close();
    });

    describe('Vercel AI SDK Wrapper', () => {
        it('should generate text using Vercel AI SDK wrapper', async () => {
            const res = await VercelAiService.generate('Write a list of top git tips.');
            expect(res).toBeDefined();
            expect(res.text).toContain('[Vercel AI Mock]');
            expect(res.usage).toEqual({ promptTokens: 10, completionTokens: 20 });
        });

        it('should handle POST requests to vercel-ai endpoint', async () => {
            const response = await fetch(`http://localhost:${port}/api/v1/frameworks/vercel-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: 'Hello Vercel AI SDK!' })
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.text).toContain('[Vercel AI Mock]');
        });
    });

    describe('ElizaOS Wrapper', () => {
        it('should format Eliza character sheets to system prompts', () => {
            const character = ElizaAgentService.createCharacter({
                name: 'Eliza Tester',
                bio: ['Line 1 of bio', 'Line 2 of bio'],
                lore: ['Line 1 of lore'],
                style: { all: ['All style 1'] }
            });
            const prompt = ElizaAgentService.formatSystemPrompt(character);
            expect(prompt).toContain('You are Eliza Tester');
            expect(prompt).toContain('Line 1 of bio');
            expect(prompt).toContain('Line 1 of lore');
            expect(prompt).toContain('All style 1');
        });

        it('should handle POST requests to eliza endpoint', async () => {
            const response = await fetch(`http://localhost:${port}/api/v1/frameworks/eliza`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: 'Tell me a story.' })
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.name).toBe('Eliza Tester');
            expect(data.response).toBeDefined();
        });
    });

    describe('GenSX Wrapper', () => {
        it('should declare components and run GenSX workflows', async () => {
            const testComponent = GenSxWorkflowService.createComponent('TestWorkflow', async (props) => {
                return `Output: ${props.value}`;
            });
            const result = await GenSxWorkflowService.execute(testComponent, { value: 'Inso Code' });
            expect(result).toBe('Output: Inso Code');
        });

        it('should handle POST requests to gensx endpoint', async () => {
            const response = await fetch(`http://localhost:${port}/api/v1/frameworks/gensx`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: 'TS Component Flow' })
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.result).toContain('TS Component Flow');
        });
    });

    describe('Mastra Wrapper', () => {
        it('should initialize and execute Mastra agents', async () => {
            const agent = MastraAgentService.createAgent({
                id: 'test-mastra',
                name: 'Mastra Assistant',
                instructions: 'Test instructions'
            });
            expect(agent).toBeDefined();
            expect(agent.id).toBe('test-mastra');
            expect(agent.name).toBe('Mastra Assistant');

            const res = await MastraAgentService.generate(agent, 'Help me build a schema.');
            expect(res.text).toContain('[Mastra Agent Mock]');
        });

        it('should handle POST requests to mastra endpoint', async () => {
            const response = await fetch(`http://localhost:${port}/api/v1/frameworks/mastra`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: 'Build a DB route' })
            });
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.result).toContain('Build a DB route');
        });
    });
});
