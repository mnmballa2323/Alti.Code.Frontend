/**
 * Copyright (c) 2024 Inso Code
 *
 * Orchestrator Routes v2 — API routes for the 43-Agent Armada
 */

import express from 'express';
import { OrchestratorController } from './orchestrator.controller.js';

const router = express.Router();

// ── ORCHESTRATION ──
router.post('/orchestrate', OrchestratorController.dispatch);
router.post('/orchestrate/direct', OrchestratorController.directDispatch);
router.post('/orchestrate/workflow', OrchestratorController.runWorkflow);
router.post('/orchestrate/parallel', OrchestratorController.dispatchParallel);

// ── HUMAN-IN-THE-LOOP ──
router.post('/orchestrate/approve/:planId', OrchestratorController.approve);
router.post('/orchestrate/reject/:planId', OrchestratorController.reject);
router.post('/orchestrate/mode', OrchestratorController.setMode);

// ── AGENT REGISTRY ──
router.get('/agents', OrchestratorController.listAgents);
router.get('/agents/:name', OrchestratorController.getAgent);

// ── AI PROVIDER ──
router.get('/ai/status', OrchestratorController.aiStatus);
router.post('/ai/switch', OrchestratorController.switchProvider);

export default router;
