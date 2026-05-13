/**
 * Credits Routes
 */
import express from 'express';
import { creditsController } from './credits.controller.js';

const router = express.Router();

router.get('/', (req, res) => creditsController.getGlobal(req, res));
router.get('/sessions', (req, res) => creditsController.getAllSessions(req, res));
router.get('/sessions/:sessionId', (req, res) => creditsController.getSession(req, res));
router.delete('/sessions/:sessionId', (req, res) => creditsController.resetSession(req, res));

export const creditsRoutes = router;
