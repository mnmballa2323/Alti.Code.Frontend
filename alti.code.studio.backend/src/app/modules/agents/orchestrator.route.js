/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { OrchestratorController } from './orchestrator.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import { validateRequest } from '../../middlewares/validateRequest/validateRequest.js';
import { OrchestratorValidation } from './orchestrator.validation.js';

const router = express.Router();
const adminOnly = authMiddleware(
  ENUM_USER_ROLE.ADMIN,
  ENUM_USER_ROLE.SUPER_ADMIN,
);

// Mission — natural language goal → autonomous execution
router.post(
  '/mission',
  adminOnly,
  validateRequest(OrchestratorValidation.missionZodSchema),
  OrchestratorController.startMission,
);
router.get(
  '/mission/:traceId',
  adminOnly,
  OrchestratorController.getMissionStatus,
);
router.get('/missions', adminOnly, OrchestratorController.listMissions);

export const orchestratorRoutes = router;
