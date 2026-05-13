/**
 * Multi-Repo Orchestration Controller — v6.0.0 REST API
 *
 * Routes:
 *   POST /api/v1/multi-repo/scan     → scan all repos for a goal
 *   POST /api/v1/multi-repo/plan     → generate cross-repo change plan
 *   POST /api/v1/multi-repo/run      → scan + plan + execute atomically
 *   POST /api/v1/multi-repo/register → register a new repo at runtime
 *   GET  /api/v1/multi-repo/events   → SSE stream
 */

import express from 'express';
import { multiRepoOrchestrationService, multiRepoBus } from '../multiRepoOrchestration/multiRepoOrchestration.service.js';
import { selfExpandingSwarmService, swarmBus } from '../agents/self_expanding_swarm.service.js';
import { logger } from '../../../shared/logger.js';

export const multiRepoRouter = express.Router();

// POST /api/v1/multi-repo/scan
multiRepoRouter.post('/scan', async (req, res) => {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ success: false, message: 'goal is required.' });
    try {
        const results = await multiRepoOrchestrationService.scanAllRepos(goal);
        return res.json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// POST /api/v1/multi-repo/plan
multiRepoRouter.post('/plan', async (req, res) => {
    const { goal, scanResults } = req.body;
    if (!goal || !Array.isArray(scanResults)) {
        return res.status(400).json({ success: false, message: 'goal and scanResults[] are required.' });
    }
    try {
        const result = await multiRepoOrchestrationService.planCrossRepoChanges(goal, scanResults);
        return res.json({ success: true, data: result });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// POST /api/v1/multi-repo/run
multiRepoRouter.post('/run', async (req, res) => {
    const { goal, branchPrefix } = req.body;
    if (!goal) return res.status(400).json({ success: false, message: 'goal is required.' });
    try {
        const result = await multiRepoOrchestrationService.runCrossRepoTask(goal, { branchPrefix });
        return res.json({ success: true, data: result });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// POST /api/v1/multi-repo/register
multiRepoRouter.post('/register', (req, res) => {
    const { id, name, path: repoPath } = req.body;
    if (!id || !repoPath) return res.status(400).json({ success: false, message: 'id and path are required.' });
    try {
        multiRepoOrchestrationService.registerRepo({ id, name: name || id, path: repoPath });
        return res.json({ success: true, message: `Repo "${id}" registered.` });
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    }
});

// GET /api/v1/multi-repo/swarm-report (self-expanding swarm status)
multiRepoRouter.get('/swarm-report', (req, res) => {
    const report = selfExpandingSwarmService.getSynthesisReport();
    return res.json({ success: true, data: report });
});

// GET /api/v1/multi-repo/events — SSE stream for multi-repo + swarm events
multiRepoRouter.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (event, data) => res.write(`data: ${JSON.stringify({ event, ...data })}\n\n`);

    const multiEvents = ['multirepo:task_started', 'multirepo:plan', 'multirepo:branch_created', 'multirepo:step:start', 'multirepo:step:done', 'multirepo:committed', 'multirepo:completed', 'multirepo:rollback'];
    const swarmEvents = ['swarm:gap_detected', 'swarm:synthesis_started', 'swarm:agent_written', 'swarm:agent_registered', 'swarm:synthesis_blocked', 'swarm:synthesis_failed'];

    multiEvents.forEach(e => multiRepoBus.on(e, (d) => send(e, d)));
    swarmEvents.forEach(e => swarmBus.on(e, (d) => send(e, d)));

    const ping = setInterval(() => res.write(':ping\n\n'), 30000);
    req.on('close', () => {
        clearInterval(ping);
        multiEvents.forEach(e => multiRepoBus.removeAllListeners(e));
        swarmEvents.forEach(e => swarmBus.removeAllListeners(e));
    });
});
