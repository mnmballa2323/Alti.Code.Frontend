/**
 * Autopilot Controller — Enhanced with supervised mode, sessions, diff approval
 */
import { autopilotService } from './autopilot.service.js';
import { logger } from '../../../shared/logger.js';

const processHeartbeat = async (req, res) => {
  try {
    const correlationId =
      req.headers['x-cloud-trace-context'] || Date.now().toString();
    const result = await autopilotService.processHeartbeat(correlationId);
    res
      .status(202)
      .json({ success: true, message: 'Heartbeat acknowledged', data: result });
  } catch (err) {
    logger.error(`[AutopilotController] heartbeat: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const getMode = async (req, res) => {
  res.json({ success: true, ...autopilotService.getMode() });
};

const setMode = async (req, res) => {
  try {
    const { mode } = req.body;
    const result = autopilotService.setMode(mode);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const launchSession = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: '"goal" is required.' });
    const result = await autopilotService.launchSession(goal);
    res.status(202).json({ success: true, ...result });
  } catch (err) {
    logger.error(`[AutopilotController] launchSession: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const listSessions = async (req, res) => {
  res.json({ success: true, sessions: autopilotService.listSessions() });
};

const getSession = async (req, res) => {
  try {
    const session = autopilotService.getSession(req.params.id);
    res.json({ success: true, session });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const approveHunk = async (req, res) => {
  try {
    const { hunkId } = req.body;
    if (!hunkId)
      return res
        .status(400)
        .json({ error: '"hunkId" is required (or "all").' });
    const result = await autopilotService.approveHunk(req.params.id, hunkId);
    res.json({ success: true, ...result });
  } catch (err) {
    logger.error(`[AutopilotController] approveHunk: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const rejectHunk = async (req, res) => {
  try {
    const { hunkId } = req.body;
    const result = await autopilotService.rejectHunk(
      req.params.id,
      hunkId || 'all',
    );
    res.json({ success: true, ...result });
  } catch (err) {
    logger.error(`[AutopilotController] rejectHunk: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const interruptSession = async (req, res) => {
  try {
    const result = autopilotService.interruptSession(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const revertSession = async (req, res) => {
  try {
    const result = await autopilotService.revertSession(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    logger.error(`[AutopilotController] revertSession: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const autopilotController = {
  processHeartbeat,
  getMode,
  setMode,
  launchSession,
  listSessions,
  getSession,
  approveHunk,
  rejectHunk,
  interruptSession,
  revertSession,
};
