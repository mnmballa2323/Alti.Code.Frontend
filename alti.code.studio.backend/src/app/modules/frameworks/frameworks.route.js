/**
 * Copyright (c) 2026 Inso Code
 *
 * frameworks.route.js — Endpoint router for trending open-source frameworks.
 * Exposes controllers for Vercel AI SDK, ElizaOS, GenSX, and Mastra.
 */

import express from 'express';
import { catchAsync } from '../../../shared/catchAsync.js';
import { VercelAiService } from '../ai/vercel_ai.service.js';
import { ElizaAgentService } from '../agents/eliza_agent.service.js';
import { GenSxWorkflowService } from '../workflow/gensx_workflow.service.js';
import { MastraAgentService } from '../agents/mastra_agent.service.js';

const router = express.Router();

// 1. Vercel AI SDK Endpoint
router.post('/vercel-ai', catchAsync(async (req, res) => {
    const { prompt, model } = req.body;
    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    const result = await VercelAiService.generate(prompt, { model });
    res.status(200).json({ success: true, ...result });
}));

// 2. ElizaOS Endpoint
router.post('/eliza', catchAsync(async (req, res) => {
    const { character, prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    const char = ElizaAgentService.createCharacter(character || {
        name: 'Eliza Tester',
        bio: ['A testing persona for ElizaOS integration.'],
        lore: ['Created in an integration sandbox.']
    });
    const responseText = await ElizaAgentService.generateCharacterResponse(char, prompt);
    res.status(200).json({ success: true, name: char.name, response: responseText });
}));

// 3. GenSX Endpoint
router.post('/gensx', catchAsync(async (req, res) => {
    const { input } = req.body;
    
    // Define a dummy GenSX component for testing
    const testComponent = GenSxWorkflowService.createComponent('TestGenSXComponent', async (props) => {
        return `GenSX Workflow Result: successfully processed input [${props.input || 'default'}]`;
    });

    const result = await GenSxWorkflowService.execute(testComponent, { input });
    res.status(200).json({ success: true, result });
}));

// 4. Mastra Endpoint
router.post('/mastra', catchAsync(async (req, res) => {
    const { prompt, instructions, model } = req.body;
    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    const agent = MastraAgentService.createAgent({
        id: 'mastra-test-agent',
        name: 'Mastra Tester',
        instructions: instructions || 'You are a test assistant.',
        model
    });
    const result = await MastraAgentService.generate(agent, prompt);
    res.status(200).json({ success: true, result: result.text });
}));

export const frameworksRoutes = router;
