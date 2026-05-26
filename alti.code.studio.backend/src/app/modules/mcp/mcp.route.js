/**
 * Copyright (c) 2024 Alti.Code.Studio
 */

import express from 'express';
import { McpController } from './mcp.controller.js';
import authMiddleware from '../../middlewares/auth/auth.js';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';

const router = express.Router();
const requireAuth = authMiddleware(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN);

router.get('/composio/apps', requireAuth, McpController.getComposioApps);
router.get('/composio/connections', requireAuth, McpController.getConnections);
router.get('/composio/triggers/:appName', requireAuth, McpController.getAppTriggers);
router.get('/composio/tools/:appName', requireAuth, McpController.getToolkitTools);
router.post('/composio/connect', requireAuth, McpController.connectComposioApp);
router.post('/composio/disconnect', requireAuth, McpController.disconnectComposioApp);
router.get('/tools', requireAuth, McpController.listTools);
router.get('/tools/local', requireAuth, McpController.listTools);
router.post('/connect', requireAuth, McpController.connectServer);
router.post('/run', requireAuth, McpController.runTool);
router.post('/execute/local', requireAuth, McpController.runTool);

router.get('/custom', requireAuth, McpController.getCustomMcpServers);
router.post('/custom', requireAuth, McpController.addCustomMcpServer);
router.delete('/custom/:name', requireAuth, McpController.deleteCustomMcpServer);

export const mcpRoutes = router;
