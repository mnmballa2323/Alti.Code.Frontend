/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { SecurityAgentController } from './securityAgent.controller.js';

import { authMiddleware } from '../../middlewares/auth.middleware.js';
<<<<<<< HEAD
import { ENUM_USER_ROLE } from '../../../enums/user.js';
=======
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

const router = express.Router();

router.post('/audit', authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), SecurityAgentController.startAudit);
<<<<<<< HEAD
=======
router.post('/scan', authMiddleware(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.DEVELOPER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.OWNER), SecurityAgentController.startAudit);
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

export const securityAgentRoutes = router;
