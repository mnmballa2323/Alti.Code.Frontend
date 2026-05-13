import express from 'express';
import { DebugAgentController } from './debugAgent.controller.js';

const router = express.Router();

router.post('/debug', DebugAgentController.startDebug);

export const debugAgentRoutes = router;
