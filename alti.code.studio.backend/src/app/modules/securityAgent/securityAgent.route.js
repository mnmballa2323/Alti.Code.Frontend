/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { SecurityAgentController } from './securityAgent.controller.js';

import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireMfa } from '../../middlewares/requireMfa.middleware.js';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';

const router = express.Router();

router.post(
  '/audit',
  authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  requireMfa,
  SecurityAgentController.startAudit,
);
router.post(
  '/scan',
  authMiddleware(
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.DEVELOPER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.OWNER,
  ),
  requireMfa,
  SecurityAgentController.startAudit,
);

export const securityAgentRoutes = router;
