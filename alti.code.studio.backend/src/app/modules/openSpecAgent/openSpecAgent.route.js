/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { OpenSpecAgentController } from './openSpecAgent.controller.js';

const router = express.Router();

router.post(
  '/init',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  OpenSpecAgentController.initProject,
);

router.post(
  '/propose',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  OpenSpecAgentController.createProposal,
);

router.get(
  '/list',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  OpenSpecAgentController.listProposals,
);

router.get(
  '/validate',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  OpenSpecAgentController.validateSpecs,
);

export const OpenSpecAgentRoutes = router;
