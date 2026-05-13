/**
 * Undo Routes
 * Mounted at: /api/autopilot/sessions/:sessionId/undo
 */
import express from 'express';
import { undoController } from './undo.controller.js';

const router = express.Router({ mergeParams: true });

// GET  /api/autopilot/sessions/:sessionId/undo         - full history
router.get('/', (req, res) => undoController.getHistory(req, res));

// GET  /api/autopilot/sessions/:sessionId/undo/:entryId - specific entry (with before/after)
router.get('/:entryId', (req, res) => undoController.getEntry(req, res));

// POST /api/autopilot/sessions/:sessionId/undo/last    - undo most recent change
router.post('/last', (req, res) => undoController.undoLast(req, res));

// POST /api/autopilot/sessions/:sessionId/undo/file    - undo a specific file { filePath }
router.post('/file', (req, res) => undoController.undoFile(req, res));

// POST /api/autopilot/sessions/:sessionId/undo/all     - undo all session changes
router.post('/all', (req, res) => undoController.undoAll(req, res));

// DELETE /api/autopilot/sessions/:sessionId/undo       - clear history
router.delete('/', (req, res) => undoController.clearSession(req, res));

export const undoRoutes = router;
