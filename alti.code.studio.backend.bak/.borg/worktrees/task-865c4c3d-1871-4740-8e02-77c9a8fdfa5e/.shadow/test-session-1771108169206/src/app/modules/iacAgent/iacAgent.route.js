import express from 'express';
import { IacAgentController } from './iacAgent.controller.js';

const router = express.Router();

router.post('/apply', IacAgentController.applyInfrastructure);

export const iacAgentRoutes = router;
