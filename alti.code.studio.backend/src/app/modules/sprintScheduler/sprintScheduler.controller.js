/**
 * Sprint Scheduler Controller — v6.3.0
 *
 * Routes (all mounted at /api/v1/scheduler):
 *   POST /start              → start the cron scheduler
 *   POST /stop               → stop the scheduler
 *   POST /trigger            → immediate scan + sprint cycle
 *   GET  /status             → scheduler state + active sprint + last cycle
 *   GET  /backlog            → current goal backlog
 *   POST /backlog/add        → manually add a goal to the backlog
 *   DELETE /backlog          → clear the backlog
 *   GET  /history            → cycle run history (last N)
 *   GET  /events             → SSE stream of scheduler events
 */

import express from 'express';
import {
  sprintSchedulerService,
  schedulerBus,
} from './sprintScheduler.service.js';
import { logger } from '../../../shared/logger.js';

export const schedulerRouter = express.Router();

// POST /start
schedulerRouter.post('/start', (req, res) => {
  const { intervalMs, scanDir, runNow = true } = req.body;
  try {
    const result = sprintSchedulerService.start({
      intervalMs,
      scanDir,
      runNow,
    });
    return res.json({ success: true, data: result });
  } catch (e) {
    logger.error('Scheduler /start error:', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// POST /stop
schedulerRouter.post('/stop', (req, res) => {
  const result = sprintSchedulerService.stop();
  return res.json({ success: true, data: result });
});

// POST /trigger
// Body: { reason?: string }
schedulerRouter.post('/trigger', async (req, res) => {
  const { reason = 'api_trigger' } = req.body;
  try {
    // Fire cycle asynchronously — respond immediately with 202
    res
      .status(202)
      .json({ success: true, message: 'Scheduler cycle triggered.', reason });
    await sprintSchedulerService.triggerNow(reason);
  } catch (e) {
    logger.error('Scheduler /trigger error:', e.message);
  }
});

// GET /status
schedulerRouter.get('/status', (req, res) => {
  return res.json({ success: true, data: sprintSchedulerService.getStatus() });
});

// GET /backlog
schedulerRouter.get('/backlog', (req, res) => {
  return res.json({ success: true, data: sprintSchedulerService.getBacklog() });
});

// POST /backlog/add
// Body: { goal: string, priority?: 1-4 }
schedulerRouter.post('/backlog/add', (req, res) => {
  const { goal, priority } = req.body;
  if (!goal || typeof goal !== 'string') {
    return res
      .status(400)
      .json({ success: false, message: 'goal (string) is required.' });
  }
  const entry = sprintSchedulerService.addGoalToBacklog(goal, priority);
  return res.status(201).json({ success: true, data: entry });
});

// DELETE /backlog
schedulerRouter.delete('/backlog', (req, res) => {
  const result = sprintSchedulerService.clearBacklog();
  return res.json({ success: true, data: result });
});

// GET /history?limit=10
schedulerRouter.get('/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  return res.json({
    success: true,
    data: sprintSchedulerService.getHistory(limit),
  });
});

// GET /events — SSE stream
schedulerRouter.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const events = [
    'scheduler:started',
    'scheduler:stopped',
    'scheduler:triggered',
    'scheduler:cycle:start',
    'scheduler:cycle:done',
    'scheduler:cycle:idle',
    'scheduler:cycle:skipped',
    'scheduler:phase',
    'scheduler:signals',
    'scheduler:goals:synthesized',
    'scheduler:backlog:updated',
    'scheduler:backlog:cleared',
    'scheduler:sprint:done',
    'scheduler:sprint:failed',
  ];

  const handlers = events.map(event => {
    const handler = data => sendEvent(event, data);
    schedulerBus.on(event, handler);
    return { event, handler };
  });

  // Heartbeat
  const hb = setInterval(() => res.write(': heartbeat\n\n'), 30_000);

  req.on('close', () => {
    clearInterval(hb);
    handlers.forEach(({ event, handler }) => schedulerBus.off(event, handler));
  });
});
