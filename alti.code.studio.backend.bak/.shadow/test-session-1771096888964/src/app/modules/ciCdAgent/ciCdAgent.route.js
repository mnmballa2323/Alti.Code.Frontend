import express from 'express';
import { CiCdAgentController } from './ciCdAgent.controller.js';

const router = express.Router();

router.post('/pipeline', CiCdAgentController.triggerPipeline);

export const ciCdAgentRoutes = router;
