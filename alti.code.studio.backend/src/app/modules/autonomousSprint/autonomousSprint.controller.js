<<<<<<< HEAD
/**
 * Autonomous Sprint Controller — v6.0.0 REST API
 *
 * Routes:
 *   POST /api/v1/sprint/launch       → launch zero-human sprint
 *   GET  /api/v1/sprint/active        → list active sprints
 *   DELETE /api/v1/sprint/:id/cancel  → cancel a running sprint
 *   GET  /api/v1/sprint/events        → SSE stream of sprint events
 */

import express from 'express';
import { autonomousSprintService, sprintBus } from '../autonomousSprint/autonomousSprint.service.js';
import { logger } from '../../../shared/logger.js';

export const sprintRouter = express.Router();

// POST /api/v1/sprint/launch
sprintRouter.post('/launch', async (req, res) => {
    const { goal, repoPath, maxCostUsd, autoDeploy, branchPrefix } = req.body;

    if (!goal || typeof goal !== 'string') {
        return res.status(400).json({ success: false, message: 'goal is required and must be a string.' });
    }

    try {
        logger.info(`🏃 Sprint API: Launching sprint — "${goal.substring(0, 60)}"`);
        // Launch async — return sprintId immediately
        const sprintId = `${Date.now().toString(36)}`;

        // Fire and forget — client follows via SSE
        setImmediate(async () => {
            try {
                await autonomousSprintService.launchSprint(goal, { repoPath, maxCostUsd, autoDeploy, branchPrefix });
            } catch (err) {
                logger.error(`Sprint ${sprintId} failed after launch:`, err.message);
            }
        });

        return res.status(202).json({ success: true, message: 'Sprint launched. Follow events via /api/v1/sprint/events', goal });
    } catch (error) {
        logger.error('Sprint launch error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/v1/sprint/active
sprintRouter.get('/active', (req, res) => {
    const sprints = autonomousSprintService.getActiveSprints();
    return res.json({ success: true, count: sprints.length, data: sprints });
});

// DELETE /api/v1/sprint/:id/cancel
sprintRouter.delete('/:id/cancel', (req, res) => {
    const { id } = req.params;
    const result = autonomousSprintService.cancelSprint(id);
    if (result.cancelled) {
        return res.json({ success: true, message: `Sprint ${id} cancelled.` });
    }
    return res.status(404).json({ success: false, message: `Sprint ${id} not found or already completed.` });
});

// GET /api/v1/sprint/events — Server-Sent Events stream
sprintRouter.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const events = [
        'sprint:started', 'sprint:phase', 'sprint:plan', 'sprint:branch',
        'sprint:step:start', 'sprint:step:done', 'sprint:review',
        'sprint:deployed', 'sprint:completed', 'sprint:failed',
        'sprint:vetoed', 'sprint:cancelled', 'sprint:halted',
        // v6.2.0 — Closed-Loop Validation
        'sprint:sandbox', 'sprint:auto_test', 'sprint:heal',
        'sprint:tests', 'sprint:doc_updated', 'sprint:deploy_failed',
    ];

    const handler = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    events.forEach(event => sprintBus.on(event, (data) => handler({ event, ...data })));

    // Keep-alive ping every 30s
    const ping = setInterval(() => res.write(':ping\n\n'), 30000);

    req.on('close', () => {
        clearInterval(ping);
        events.forEach(event => sprintBus.removeListener(event, handler));
        logger.info('Sprint SSE client disconnected.');
    });
});
=======
import express from 'express';
export const sprintRouter = express.Router();
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
