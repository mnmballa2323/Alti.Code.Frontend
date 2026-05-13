/**
 * Agent Profiler Controller — v6.5.0
 *
 * Routes (all mounted at /api/v1/agents):
 *   GET  /profiles            → all agent profiles sorted by score
 *   GET  /profiles/:name      → single agent profile
 *   GET  /leaderboard         → top N agents by composite score
 *   GET  /surge               → currently demoted (surged) agents
 *   POST /record              → manually record a dispatch outcome
 *   POST /flush               → immediately flush profiles to vector store
 *   DELETE /surge/:name       → manually clear surge on a specific agent
 *   GET  /events              → SSE stream of profiler events
 */

import express from 'express';
import { agentProfiler, profilerBus } from './agentProfiler.service.js';
import { logger } from '../../../shared/logger.js';

export const agentProfilerRoutes = express.Router();

// GET /profiles
agentProfilerRoutes.get('/profiles', (req, res) => {
    return res.json({ success: true, data: agentProfiler.getAllProfiles() });
});

// GET /profiles/:name
agentProfilerRoutes.get('/profiles/:name', (req, res) => {
    const profile = agentProfiler.getProfile(req.params.name);
    if (!profile) return res.status(404).json({ success: false, message: 'Agent profile not found.' });
    return res.json({ success: true, data: profile });
});

// GET /leaderboard?limit=10
agentProfilerRoutes.get('/leaderboard', (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    return res.json({ success: true, data: agentProfiler.getLeaderboard(limit) });
});

// GET /surge
agentProfilerRoutes.get('/surge', (req, res) => {
    return res.json({ success: true, data: agentProfiler.getSurgedAgents() });
});

// POST /record
// Body: { agentName, success, latencyMs, testPassed?, costUsd? }
agentProfilerRoutes.post('/record', (req, res) => {
    const { agentName, success, latencyMs, testPassed, costUsd } = req.body;
    if (!agentName || typeof success !== 'boolean') {
        return res.status(400).json({ success: false, message: 'agentName and success (boolean) required.' });
    }
    agentProfiler.record(agentName, success, latencyMs || 0, { testPassed, costUsd });
    return res.json({ success: true, profile: agentProfiler.getProfile(agentName) });
});

// POST /flush
agentProfilerRoutes.post('/flush', async (req, res) => {
    try {
        await agentProfiler._flushToStore();
        return res.json({ success: true, message: 'Profiles flushed to vector store.' });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// DELETE /surge/:name — manually clear surge
agentProfilerRoutes.delete('/surge/:name', (req, res) => {
    const profile = agentProfiler.getProfile(req.params.name);
    if (!profile) return res.status(404).json({ success: false, message: 'Agent not found.' });
    profile.surgedUntil = null;
    profile.consecutiveFails = 0;
    logger.info(`📊 Manual surge clear: "${req.params.name}"`);
    return res.json({ success: true, message: `Surge cleared for "${req.params.name}".` });
});

// GET /events — SSE
agentProfilerRoutes.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (event, data) => {
        try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch {}
    };

    const events = [
        'profiler:recorded', 'profiler:surge',
        'profiler:self_tune:started', 'profiler:self_tune:done', 'profiler:self_tune:failed',
    ];

    const handlers = events.map(event => {
        const handler = (data) => sendEvent(event, data);
        profilerBus.on(event, handler);
        return { event, handler };
    });

    // Send initial leaderboard on connect
    sendEvent('profiler:connected', { leaderboard: agentProfiler.getLeaderboard(10) });

    const hb = setInterval(() => { try { res.write(': heartbeat\n\n'); } catch {} }, 30_000);
    req.on('close', () => {
        clearInterval(hb);
        handlers.forEach(({ event, handler }) => profilerBus.off(event, handler));
    });
});
