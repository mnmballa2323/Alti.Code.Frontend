/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { DebugAgentController } from './debugAgent.controller.js';

import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { ENUM_USER_ROLE } from '../../../enums/user.js';

const router = express.Router();

router.post('/debug', authMiddleware(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN), DebugAgentController.startDebug);

export const debugAgentRoutes = router;
