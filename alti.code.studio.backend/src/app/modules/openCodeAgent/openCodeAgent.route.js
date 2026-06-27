/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { OpenCodeAgentController } from './openCodeAgent.controller.js';

const router = express.Router();

router.post(
  '/run',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  OpenCodeAgentController.startSession,
);

router.get(
  '/:sessionId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  OpenCodeAgentController.getSessionStatus,
);

export const OpenCodeAgentRoutes = router;
