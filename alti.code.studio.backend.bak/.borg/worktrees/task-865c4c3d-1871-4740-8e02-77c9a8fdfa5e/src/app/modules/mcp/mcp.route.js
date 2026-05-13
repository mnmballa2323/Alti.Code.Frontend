/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { McpController } from './mcp.controller.js';
import auth from '../../middlewares/auth/auth.js';
import { rbac } from '../../middlewares/auth/rbac.js';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';

const router = express.Router();

// Apply Auth to all routes
router.use(auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.DEVELOPER, ENUM_USER_ROLE.USER));

router.post(
    '/connect',
    rbac(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.DEVELOPER),
    McpController.connect
);

router.get(
    '/extensions/:connectionId',
    // All authenticated users can list tools
    McpController.listTools
);

router.post(
    '/execute/:connectionId',
    rbac(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.DEVELOPER),
    McpController.executeTool
);

export const mcpRoutes = router;
