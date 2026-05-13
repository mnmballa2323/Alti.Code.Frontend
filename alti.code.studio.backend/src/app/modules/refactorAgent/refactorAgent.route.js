/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { RefactorAgentController } from './refactorAgent.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
<<<<<<< HEAD
import { ENUM_USER_ROLE } from '../../../enums/user.js';
=======
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

const router = express.Router();
const userOrAdmin = authMiddleware(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN);

// Queue a refactor job (returns jobId immediately — 202 Accepted)
router.post('/refactor', userOrAdmin, RefactorAgentController.startRefactor);

// Poll job status (wired to the underlying queue service)
router.get('/refactor/status/:jobId', userOrAdmin, RefactorAgentController.getJobStatus);

export const refactorAgentRoutes = router;
