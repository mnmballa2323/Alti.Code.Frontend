import express from 'express';
import { McpController } from './mcp.controller.js';

const router = express.Router();

router.post('/connect', McpController.connect);
router.get('/extensions/:connectionId', McpController.listTools);
router.post('/execute/:connectionId', McpController.executeTool);

export const mcpRoutes = router;
