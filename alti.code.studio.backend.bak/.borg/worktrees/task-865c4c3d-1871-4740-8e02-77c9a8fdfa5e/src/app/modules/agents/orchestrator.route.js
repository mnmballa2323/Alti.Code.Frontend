/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { OrchestratorController } from './orchestrator.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { ENUM_USER_ROLE } from '../../../enums/user.js';

const router = express.Router();

router.post('/mission', authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), OrchestratorController.startMission);

export const orchestratorRoutes = router;
