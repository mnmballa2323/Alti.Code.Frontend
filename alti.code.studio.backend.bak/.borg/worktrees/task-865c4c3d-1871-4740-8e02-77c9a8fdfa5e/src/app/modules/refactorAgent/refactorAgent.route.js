/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { RefactorAgentController } from './refactorAgent.controller.js';

import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { ENUM_USER_ROLE } from '../../../enums/user.js';

const router = express.Router();

router.post('/refactor', authMiddleware(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN), RefactorAgentController.startRefactor);

export const refactorAgentRoutes = router;
