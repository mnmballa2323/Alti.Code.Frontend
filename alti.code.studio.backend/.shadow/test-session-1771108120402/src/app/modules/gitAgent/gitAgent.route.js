import express from 'express';
import { GitAgentController } from './gitAgent.controller.js';

const router = express.Router();

router.post('/start', GitAgentController.start);
router.post('/stop', GitAgentController.stop);
router.get('/status', GitAgentController.status);
router.post('/sync', GitAgentController.forceSync);

export const gitAgentRoutes = router;
