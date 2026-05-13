/**
 * Telemetry Controller — v6.4.0 REST + SSE API
 *
 * Routes (all mounted at /api/v1/telemetry):
 *   GET  /metrics            → current sliding-window metrics snapshot
 *   GET  /incidents          → incident history (last N)
 *   POST /record/llm         → manually record an LLM call outcome
 *   POST /record/exception   → manually record an exception
 *   POST /detect             → trigger an immediate anomaly check
 *   POST /detection/start    → start the anomaly detection loop
 *   POST /detection/stop     → stop the anomaly detection loop
 *   GET  /events             → SSE: live telemetry events, anomalies, incidents
 */

import express from 'express';
import { telemetryService } from './telemetry.service.js';
import { telemetryBus } from './telemetry.bus.js';
import { logger } from '../../../shared/logger.js';

export const telemetryRoutes = express.Router();

// GET /metrics
telemetryRoutes.get('/metrics', (req, res) => {
    try {
        const metrics = telemetryService.getMetrics();
        return res.json({ success: true, data: metrics });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// GET /incidents?limit=20
telemetryRoutes.get('/incidents', (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    return res.json({ success: true, data: telemetryService.getIncidents(limit) });
});

// POST /record/llm
// Body: { model?, latencyMs, success, error?, tokens? }
telemetryRoutes.post('/record/llm', (req, res) => {
    try {
        telemetryService.recordLlmCall(req.body);
        return res.json({ success: true });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// POST /record/exception
// Body: { message, name?, context? }
telemetryRoutes.post('/record/exception', (req, res) => {
    const { message, name = 'Error', context = '' } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'message is required.' });
    const err = Object.assign(new Error(message), { constructor: { name } });
    const result = telemetryService.recordException(err, context);
    return res.json({ success: true, data: result });
});

// POST /detect — immediate anomaly check
telemetryRoutes.post('/detect', async (req, res) => {
    try {
        res.status(202).json({ success: true, message: 'Anomaly detection triggered.' });
        await telemetryService._runDetection();
    } catch (e) {
        logger.error('Telemetry /detect error:', e.message);
    }
});

// POST /detection/start
// Body: { intervalMs? }
telemetryRoutes.post('/detection/start', (req, res) => {
    const { intervalMs } = req.body;
    telemetryService.startDetection(intervalMs);
    return res.json({ success: true, message: 'Anomaly detection started.' });
});

// POST /detection/stop
telemetryRoutes.post('/detection/stop', (req, res) => {
    telemetryService.stopDetection();
    return res.json({ success: true, message: 'Anomaly detection stopped.' });
});

// GET /events — SSE stream
telemetryRoutes.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (event, data) => {
        try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch { }
    };

    const events = [
        'telemetry:event',
        'anomaly:detected',
        'incident:resolved',
        'incident:vetoed',
        'incident:injected',
    ];

    const handlers = events.map(event => {
        const handler = (data) => sendEvent(event, data);
        telemetryBus.on(event, handler);
        return { event, handler };
    });

    // Send initial metrics on connect
    sendEvent('telemetry:connected', telemetryService.getMetrics());

    const hb = setInterval(() => {
        try { res.write(': heartbeat\n\n'); } catch { }
    }, 30_000);

    req.on('close', () => {
        clearInterval(hb);
        handlers.forEach(({ event, handler }) => telemetryBus.off(event, handler));
    });
});
