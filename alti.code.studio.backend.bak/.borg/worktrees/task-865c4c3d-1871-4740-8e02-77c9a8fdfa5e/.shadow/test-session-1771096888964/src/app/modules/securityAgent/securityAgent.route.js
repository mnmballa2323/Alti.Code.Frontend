import express from 'express';
import { SecurityAgentController } from './securityAgent.controller.js';

const router = express.Router();

router.post('/audit', SecurityAgentController.startAudit);

export const securityAgentRoutes = router;
