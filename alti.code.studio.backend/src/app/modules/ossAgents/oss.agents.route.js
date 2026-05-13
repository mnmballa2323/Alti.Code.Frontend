/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * oss.agents.route.js — OSS Trending Agent REST API
 *
 * Mounts at /api/v1/oss-agents
 *
 * Endpoints:
 *   GET  /               List all OSS agents (paginated, filterable)
 *   GET  /stats          Registry stats (total, by language, top stars)
 *   GET  /trending       Today's trending repos from GitHub (live)
 *   GET  /status         Scheduler status (last scan, history)
 *   POST /create         Force-create agent for any GitHub repo URL
 *   POST /scan           Trigger a manual trending scan now
 *   GET  /events         SSE stream of scan/creation events
 *   GET  /:slug(*)       Get single OSS agent record
 *   DELETE /:slug(*)     Remove an OSS agent
 */

import { Router } from 'express';
import { logger } from '../../../shared/logger.js';
import { ossAgentRegistry } from './oss.agent.registry.js';
import { ossTrendingScheduler } from './oss.trending.scheduler.js';
import { gitHubTrendingService } from './github.trending.service.js';
import { swarmBus } from '../agents/self_expanding_swarm.service.js';
import fs from 'fs/promises';

const router = Router();

// ── SSE Client Manager ────────────────────────────────────────────────────────
const sseClients = new Set();

// Forward relevant swarmBus events to all SSE clients
const OSS_EVENTS = [
    'oss:scan_started',
    'oss:scan_repos_found',
    'oss:scan_done',
    'oss:agent_synthesis_started',
    'oss:agent_written',
    'oss:agent_created',
    'oss:agent_blocked',
    'oss:agent_failed',
    'oss:batch_started',
    'oss:batch_done',
    'oss:rehydrated',
];

for (const event of OSS_EVENTS) {
    swarmBus.on(event, (data) => {
        const payload = `data: ${JSON.stringify({ event, ...data })}\n\n`;
        for (const client of sseClients) {
            try { client.write(payload); } catch { sseClients.delete(client); }
        }
    });
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/oss-agents/events
 * SSE stream of all OSS agent lifecycle events.
 */
router.get('/events', (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    const heartbeat = setInterval(() => {
        try { res.write(': heartbeat\n\n'); } catch { clearInterval(heartbeat); }
    }, 15000);

    sseClients.add(res);
    res.write(`data: ${JSON.stringify({ event: 'connected', clientCount: sseClients.size })}\n\n`);

    req.on('close', () => {
        sseClients.delete(res);
        clearInterval(heartbeat);
    });
});

/**
 * GET /api/v1/oss-agents/stats
 * Registry aggregate statistics.
 */
router.get('/stats', (req, res) => {
    try {
        const stats = ossAgentRegistry.getStats();
        res.json({ success: true, stats });
    } catch (err) {
        logger.error('OssAgents /stats error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/v1/oss-agents/status
 * Scheduler status, last scan results, scan history.
 */
router.get('/status', (req, res) => {
    try {
        res.json({ success: true, ...ossTrendingScheduler.getStatus() });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/v1/oss-agents/trending
 * Today's live trending repos from GitHub (not yet synthesized).
 * Query: ?language=javascript&since=daily
 */
router.get('/trending', async (req, res) => {
    try {
        const { language = '', since = 'daily' } = req.query;
        const trending = await gitHubTrendingService.scanTrending(language, since);
        const knownSlugs = new Set(ossAgentRegistry.getAllSlugs());

        const enriched = trending.map(r => ({
            ...r,
            hasAgent: knownSlugs.has(r.slug),
        }));

        res.json({
            success: true,
            count: enriched.length,
            newCount: enriched.filter(r => !r.hasAgent).length,
            repos: enriched,
        });
    } catch (err) {
        logger.error('OssAgents /trending error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/v1/oss-agents/scan
 * Trigger a manual scan + agent creation run.
 * Body: { language?: string }
 */
router.post('/scan', async (req, res) => {
    try {
        const { language = '' } = req.body || {};
        // Return immediately, scan runs in background
        res.json({ success: true, message: 'Trending scan triggered. Listen to /events for updates.' });
        ossTrendingScheduler.triggerNow(language).catch(e =>
            logger.error('OssAgents scan error:', e.message)
        );
    } catch (err) {
        logger.error('OssAgents /scan error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/v1/oss-agents/create
 * Force-create an agent for any specific GitHub repo URL.
 * Body: { repoUrl: string }
 */
router.post('/create', async (req, res) => {
    try {
        const { repoUrl } = req.body || {};
        if (!repoUrl) return res.status(400).json({ success: false, error: 'repoUrl is required' });
        if (!repoUrl.includes('github.com')) return res.status(400).json({ success: false, error: 'Must be a github.com URL' });

        // Return immediately, creation runs in background
        res.json({
            success: true,
            message: `Agent creation triggered for ${repoUrl}. Listen to /events for progress.`,
        });
        ossTrendingScheduler.forceCreate(repoUrl).catch(e =>
            logger.error('OssAgents forceCreate error:', e.message)
        );
    } catch (err) {
        logger.error('OssAgents /create error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/v1/oss-agents
 * List all OSS agents with optional filtering.
 * Query: ?q=react&language=javascript&limit=50&offset=0
 */
router.get('/', (req, res) => {
    try {
        const { q, language, limit = '100', offset = '0' } = req.query;
        const agents = ossAgentRegistry.list({
            q,
            language,
            limit: Math.min(Number(limit), 500),
            offset: Number(offset),
        });
        const total = ossAgentRegistry.getStats().total;

        res.json({
            success: true,
            total,
            count: agents.length,
            offset: Number(offset),
            agents,
        });
    } catch (err) {
        logger.error('OssAgents / list error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/v1/oss-agents/:owner/:name
 * Get a single OSS agent by slug (owner/name).
 */
router.get('/:owner/:name', (req, res) => {
    try {
        const slug = `${req.params.owner}/${req.params.name}`;
        const agent = ossAgentRegistry.get(slug);
        if (!agent) return res.status(404).json({ success: false, error: `No OSS agent for ${slug}` });
        res.json({ success: true, agent });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * DELETE /api/v1/oss-agents/:owner/:name
 * Remove an OSS agent — unregisters from registry and deletes file.
 */
router.delete('/:owner/:name', async (req, res) => {
    try {
        const slug = `${req.params.owner}/${req.params.name}`;
        const record = ossAgentRegistry.get(slug);
        if (!record) return res.status(404).json({ success: false, error: `No OSS agent for ${slug}` });

        // Delete agent file
        try { await fs.unlink(record.filePath); } catch { /* already gone */ }

        // Remove from registry
        await ossAgentRegistry.remove(slug);

        logger.info(`🗑️ OssAgents: Deleted ${slug}`);
        res.json({ success: true, message: `OSS agent for ${slug} removed` });
    } catch (err) {
        logger.error('OssAgents DELETE error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
