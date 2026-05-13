/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { DevOpsAgentController } from './devOpsAgent.controller.js';

const router = express.Router();

router.post('/deploy', DevOpsAgentController.startDeployment);

export const devOpsAgentRoutes = router;
