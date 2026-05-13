import express from 'express';
import { DevOpsAgentController } from './devOpsAgent.controller.js';

const router = express.Router();

router.post('/deploy', DevOpsAgentController.startDeployment);

export const devOpsAgentRoutes = router;
