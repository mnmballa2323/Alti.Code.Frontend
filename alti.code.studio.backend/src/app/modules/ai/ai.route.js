import express from 'express';
import { AiController } from './ai.controller.js';
import { AgentMemoryHooks } from '../memory/agentmemory.hooks.js';

const router = express.Router();

// 🧠 AgentMemory: Auto-capture all AI interactions as persistent observations
router.use(AgentMemoryHooks.middleware());

router.post('/task/execute', AiController.executeTask);
router.post('/workflow/create', AiController.createWorkflow);
router.post('/workflow/:id/execute', AiController.executeWorkflow);
router.get('/workflow/:id/runs', AiController.getWorkflowRuns);
router.get('/agents', AiController.getAgents);

export const aiRoutes = router;
