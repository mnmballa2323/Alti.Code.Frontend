/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { OrchestratorController } from './orchestrator.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
<<<<<<< HEAD
import { ENUM_USER_ROLE } from '../../../enums/user.js';
=======
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
import { validateRequest } from '../../middlewares/validateRequest/validateRequest.js';
import { OrchestratorValidation } from './orchestrator.validation.js';

const router = express.Router();
const adminOnly = authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN);

// Mission — natural language goal → autonomous execution
router.post('/mission', adminOnly, validateRequest(OrchestratorValidation.missionZodSchema), OrchestratorController.startMission);
router.get('/mission/:traceId', adminOnly, OrchestratorController.getMissionStatus);
router.get('/missions', adminOnly, OrchestratorController.listMissions);

export const orchestratorRoutes = router;
