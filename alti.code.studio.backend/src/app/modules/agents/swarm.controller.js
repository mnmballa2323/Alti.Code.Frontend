/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * swarm.controller.js — REST API surface for the Swarm
 * 
 * Exposes:
 *   GET  /api/swarm/health          → Full swarm health report
 *   GET  /api/swarm/agents          → List all agents (optional ?q= filter)
 *   GET  /api/swarm/agents/:name    → Get a single agent's index entry
 *   GET  /api/swarm/stats           → Aggregate capability stats
 *   POST /api/swarm/route           → Route a query to the best agent
 *   POST /api/swarm/dispatch        → Route + auto-consult the best agent
 *   POST /api/swarm/fanout          → Dispatch to top-N agents in parallel
 */

import express from 'express';
import { logger } from '../../../shared/logger.js';
import { capabilityRouter } from '../agents/capability.router.js';
import { swarmHealthMonitor } from '../agents/swarm.health.js';
import { agentIndex } from '../agents/agent.index.js';
import { validateRequest } from '../../middlewares/validateRequest/validateRequest.js';
import { SwarmValidation } from './swarm.validation.js';
import { selfExpandingSwarmService, swarmBus } from './self_expanding_swarm.service.js';

const router = express.Router();

/* ─── GET /api/swarm/health ─────────────────────────────────────────────── */
router.get('/health', async (req, res) => {
    try {
        // Trigger a fresh sweep if first call
        if (!swarmHealthMonitor.isRunning) {
            await swarmHealthMonitor.sweep();
        }
        const report = swarmHealthMonitor.getReport();
        res.json({ success: true, data: report });
    } catch (err) {
        logger.error('Swarm /health error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ─── GET /api/swarm/agents ─────────────────────────────────────────────── */
router.get('/agents', (req, res) => {
    try {
        const { q } = req.query;
        const agents = q ? agentIndex.search(String(q)) : agentIndex.list();
        res.json({ success: true, count: agents.length, data: agents });
    } catch (err) {
        logger.error('Swarm /agents error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ─── GET /api/swarm/agents/:name ───────────────────────────────────────── */
router.get('/agents/:name', (req, res) => {
    try {
        const entry = agentIndex.get(req.params.name);
        if (!entry) return res.status(404).json({ success: false, error: 'Agent not found' });
        res.json({ success: true, data: entry });
    } catch (err) {
        logger.error('Swarm /agents/:name error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ─── GET /api/swarm/stats ──────────────────────────────────────────────── */
router.get('/stats', (req, res) => {
    try {
        const stats = agentIndex.stats();
        res.json({ success: true, data: stats });
    } catch (err) {
        logger.error('Swarm /stats error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ─── POST /api/swarm/route ─────────────────────────────────────────────── */
router.post('/route', validateRequest(SwarmValidation.routeQueryZodSchema), (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ success: false, error: 'query is required' });

        const match = capabilityRouter.route(query);
        if (!match) return res.json({ success: true, matched: false, data: null });

        res.json({
            success: true,
            matched: true,
            data: {
                agent: match.name,
                score: match.score,
                description: match.agent.description,
            }
        });
    } catch (err) {
        logger.error('Swarm /route error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ─── POST /api/swarm/dispatch ──────────────────────────────────────────── */
router.post('/dispatch', validateRequest(SwarmValidation.dispatchQueryZodSchema), async (req, res) => {
    try {
        const { query, contextData = [] } = req.body;
        if (!query) return res.status(400).json({ success: false, error: 'query is required' });

        logger.info(`🗺️ Swarm Dispatch: "${query.substring(0, 60)}..."`);
        const result = await capabilityRouter.dispatch(query, contextData);

        if (!result) {
            return res.json({ success: true, matched: false, result: null });
        }

        res.json({ success: true, matched: true, result });
    } catch (err) {
        logger.error('Swarm /dispatch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ─── POST /api/swarm/fanout ────────────────────────────────────────────── */
router.post('/fanout', validateRequest(SwarmValidation.fanoutQueryZodSchema), async (req, res) => {
    try {
        const { query, contextData = [], n = 3 } = req.body;
        if (!query) return res.status(400).json({ success: false, error: 'query is required' });

        logger.info(`🗺️ Swarm Fan-Out (n=${n}): "${query.substring(0, 60)}..."`);
        const results = await capabilityRouter.fanOut(query, contextData, Math.min(n, 5));

        res.json({ success: true, count: results.length, results });
    } catch (err) {
        logger.error('Swarm /fanout error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ─── POST /api/swarm/synthesize ────────────────────────────────────────── */
router.post('/synthesize', async (req, res) => {
    try {
        const { domain, triggerQuery } = req.body;
        if (!domain || !triggerQuery) {
            return res.status(400).json({ success: false, error: 'domain and triggerQuery are required' });
        }
        res.json({ success: true, message: 'Synthesis triggered. Connect to /stream for live logs.' });
        // Run background async
        selfExpandingSwarmService.synthesizeAgent(domain, triggerQuery).catch(e => logger.error('Synthesis Background Error:', e));
    } catch (err) {
        logger.error('Swarm /synthesize error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ─── GET /api/swarm/stream ─────────────────────────────────────────────── */
router.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const writeEvent = (event, data) => {
        try {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        } catch (e) { }
    };

    const listeners = [
        ['swarm:synthesis_started', d => writeEvent('synthesis_started', d)],
        ['swarm:synthesis_blocked', d => writeEvent('synthesis_blocked', d)],
        ['swarm:agent_written', d => writeEvent('agent_written', d)],
        ['swarm:agent_registered', d => writeEvent('agent_registered', d)],
        ['swarm:synthesis_failed', d => writeEvent('synthesis_failed', d)]
    ];

    listeners.forEach(([e, cb]) => swarmBus.on(e, cb));

    req.on('close', () => {
        listeners.forEach(([e, cb]) => swarmBus.off(e, cb));
    });
});

/* ─── GET /api/swarm/synthesis-report ───────────────────────────────────── */
router.get('/synthesis-report', (req, res) => {
    try {
        res.json({ success: true, data: selfExpandingSwarmService.getSynthesisReport() });
    } catch (err) {
        logger.error('Swarm /synthesis-report error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
