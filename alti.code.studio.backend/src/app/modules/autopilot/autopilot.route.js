/**
 * Autopilot Routes
 */
import express from 'express';
import { autopilotController } from './autopilot.controller.js';
import { undoRoutes } from './undo.route.js';

const router = express.Router();

// Legacy heartbeat (GCP Cloud Scheduler)
router.post('/heartbeat', (req, res) => autopilotController.processHeartbeat(req, res));

// Mode management
router.get('/mode', (req, res) => autopilotController.getMode(req, res));
router.post('/mode', (req, res) => autopilotController.setMode(req, res));

// Session management
router.post('/sessions', (req, res) => autopilotController.launchSession(req, res));
router.get('/sessions', (req, res) => autopilotController.listSessions(req, res));
router.get('/sessions/:id', (req, res) => autopilotController.getSession(req, res));

// Supervised mode controls
router.post('/sessions/:id/approve', (req, res) => autopilotController.approveHunk(req, res));
router.post('/sessions/:id/reject', (req, res) => autopilotController.rejectHunk(req, res));
router.post('/sessions/:id/interrupt', (req, res) => autopilotController.interruptSession(req, res));
router.post('/sessions/:id/revert', (req, res) => autopilotController.revertSession(req, res));

// Undo stack — granular AI change undo (no git required)
// Mounts: GET/POST /autopilot/sessions/:id/undo/*
router.use('/sessions/:id/undo', (req, res, next) => {
    req.params.sessionId = req.params.id;
    next();
}, undoRoutes);

export const autopilotRoutes = router;

