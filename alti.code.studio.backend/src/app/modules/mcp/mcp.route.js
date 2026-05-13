/**
 * Copyright (c) 2024 Alti.Code.Studio
 */

import express from 'express';
import { McpController } from './mcp.controller.js';

const router = express.Router();

router.get('/tools', McpController.listTools);
router.post('/connect', McpController.connectServer);
router.post('/run', McpController.runTool);

export const mcpRoutes = router;
