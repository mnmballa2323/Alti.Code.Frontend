/**
 * Collaboration Controller — v6.1.0 REST API
 *
 * Routes (all mounted at /api/v1/collab):
 *   POST /session/create     → create or retrieve a collab session
 *   POST /session/join       → join an existing session with collabToken
 *   POST /session/leave      → leave a session
 *   GET  /session/:id        → get session info
 *   GET  /sessions           → list all active sessions
 *   GET  /session/:id/presence → get user presence list
 *   GET  /session/:id/cursors  → get cursor positions
 *   POST /session/:id/context  → append context item
 */

import express from 'express';
import { collaborationService } from './collaboration.service.js';
import { logger } from '../../../shared/logger.js';

export const collaborationRoutes = express.Router();

// POST /create
collaborationRoutes.post('/session/create', (req, res) => {
  const { sessionId, ownerId } = req.body;
  if (!sessionId || !ownerId) {
    return res
      .status(400)
      .json({ success: false, message: 'sessionId and ownerId are required.' });
  }
  try {
    const result = collaborationService.createCollabSession(sessionId, ownerId);
    return res.status(201).json({ success: true, data: result });
  } catch (e) {
    logger.error('Collab /create error:', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// POST /session/join
collaborationRoutes.post('/session/join', (req, res) => {
  const { sessionId, userId, collabToken } = req.body;
  if (!sessionId || !userId || !collabToken) {
    return res.status(400).json({
      success: false,
      message: 'sessionId, userId, and collabToken are required.',
    });
  }
  const result = collaborationService.joinSession(
    sessionId,
    userId,
    collabToken,
  );
  if (!result.success)
    return res.status(403).json({ success: false, message: result.reason });
  return res.json({ success: true, data: result });
});

// POST /session/leave
collaborationRoutes.post('/session/leave', (req, res) => {
  const { sessionId, userId } = req.body;
  if (!sessionId || !userId) {
    return res
      .status(400)
      .json({ success: false, message: 'sessionId and userId are required.' });
  }
  collaborationService.leaveSession(sessionId, userId);
  return res.json({ success: true, message: 'Left session.' });
});

// GET /session/:id
collaborationRoutes.get('/session/:id', (req, res) => {
  const session = collaborationService.getSession(req.params.id);
  if (!session)
    return res
      .status(404)
      .json({ success: false, message: 'Session not found.' });
  return res.json({ success: true, data: session });
});

// GET /sessions
collaborationRoutes.get('/sessions', (req, res) => {
  const list = collaborationService.listSessions();
  return res.json({ success: true, count: list.length, data: list });
});

// GET /session/:id/presence
collaborationRoutes.get('/session/:id/presence', (req, res) => {
  const data = collaborationService.getPresence(req.params.id);
  return res.json({ success: true, count: data.length, data });
});

// GET /session/:id/cursors
collaborationRoutes.get('/session/:id/cursors', (req, res) => {
  const data = collaborationService.getCursors(req.params.id);
  return res.json({ success: true, data });
});

// POST /session/:id/context
collaborationRoutes.post('/session/:id/context', (req, res) => {
  const { userId, role = 'user', content, agentName } = req.body;
  if (!userId || !content) {
    return res
      .status(400)
      .json({ success: false, message: 'userId and content are required.' });
  }
  const item = collaborationService.appendContext(req.params.id, userId, {
    role,
    content,
    agentName,
  });
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: 'Session not found.' });
  return res.json({ success: true, data: item });
});
