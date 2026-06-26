/**
 * Copyright (c) 2024 Inso Code
 */

import express from 'express';
import { McpController } from './mcp.controller.js';
import authMiddleware from '../../middlewares/auth/auth.js';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';

const router = express.Router();
const requireAuth = authMiddleware(
  ENUM_USER_ROLE.USER,
  ENUM_USER_ROLE.ADMIN,
  ENUM_USER_ROLE.SUPER_ADMIN,
);

router.get('/tools', requireAuth, McpController.listTools);
router.get('/tools/local', requireAuth, McpController.listTools);
router.post('/connect', requireAuth, McpController.connectServer);
router.post('/disconnect', requireAuth, McpController.disconnectServer);
router.post('/run', requireAuth, McpController.runTool);
router.post('/execute/local', requireAuth, McpController.runTool);

router.get('/custom', requireAuth, McpController.getCustomMcpServers);
router.post('/custom', requireAuth, McpController.addCustomMcpServer);
router.delete(
  '/custom/:name',
  requireAuth,
  McpController.deleteCustomMcpServer,
);

export const mcpRoutes = router;
