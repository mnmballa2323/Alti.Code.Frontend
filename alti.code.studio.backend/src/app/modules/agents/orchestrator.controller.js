/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Orchestrator Controller v2 — REST API for the 43-Agent Armada
 * Supports: dispatch, workflows, approval, mode switching, parallel dispatch
 */

import { orchestrator } from './orchestrator.js';
import { agentRegistry } from './agent.registry.js';
import { aiProvider } from '../ai/ai.provider.js';
import { workerFactory } from '../queue/worker.factory.js';
import { logger } from '../../../shared/logger.js';
import { Orchestrator } from './orchestrator.agent.js';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import crypto from 'crypto';



export class OrchestratorController {
    /** POST /api/v1/orchestrate — AI-routed task dispatch */
    static async dispatch(req, res) {
        try {
            const { task, context } = req.body;
            if (!task) return res.status(400).json({ error: 'Task is required' });

            const results = await orchestrator.dispatch(task, {
                ...context,
                userId: req.user?.userId,
                sessionId: req.user?.sessionId
            });

            res.json({ status: 'dispatched', results });
        } catch (error) {
            logger.error('Orchestrator dispatch failed', error);
            res.status(500).json({ error: error.message });
        }
    }

    /** POST /api/v1/orchestrate/direct — Direct dispatch to specific agent */
    static async directDispatch(req, res) {
        try {
            const { agent, data } = req.body;
            if (!agent) return res.status(400).json({ error: 'Agent name is required' });

            const result = await orchestrator.dispatchDirect(agent, data || {}, {
                userId: req.user?.userId
            });

            res.json(result);
        } catch (error) {
            logger.error('Orchestrator directDispatch failed', error);
            res.status(500).json({ error: error.message });
        }
    }


    /** POST /api/v1/orchestrate/workflow — Multi-agent sequential workflow */
    static async runWorkflow(req, res) {
        try {
            const { workflow, context } = req.body;
            if (!workflow || !Array.isArray(workflow)) {
                return res.status(400).json({ error: 'Workflow array is required' });
            }

            const result = await orchestrator.runWorkflow(workflow, {
                ...context,
                userId: req.user?.userId
            });

            res.json(result);
        } catch (error) {
            logger.error('Orchestrator runWorkflow failed', error);
            res.status(500).json({ error: error.message });
        }
    }


    /** POST /api/v1/orchestrate/parallel — Parallel multi-agent dispatch */
    static async dispatchParallel(req, res) {
        try {
            const { agents, data, context } = req.body;
            if (!agents || !Array.isArray(agents)) {
                return res.status(400).json({ error: 'Agents array is required' });
            }

            const results = await orchestrator.dispatchParallel(agents, data || {}, {
                ...context,
                userId: req.user?.userId
            });

            res.json({ status: 'dispatched', results });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /** POST /api/v1/orchestrate/approve/:planId — Approve a pending plan */
    static async approve(req, res) {
        try {
            const result = await orchestrator.approve(req.params.planId);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /** POST /api/v1/orchestrate/reject/:planId — Reject a pending plan */
    static async reject(req, res) {
        try {
            const { reason } = req.body;
            const result = orchestrator.reject(req.params.planId, reason);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /** POST /api/v1/orchestrate/mode — Set orchestration mode */
    static async setMode(req, res) {
        try {
            const { mode } = req.body;
            if (!mode || typeof mode !== 'string') {
                return res.status(400).json({ error: 'mode must be a non-empty string' });
            }
            orchestrator.setMode(mode);
            res.json({ mode: orchestrator.mode, message: `Mode set to ${mode}` });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }


    /** GET /api/v1/agents — List all registered agents */
    static async listAgents(req, res) {
        const { capability, tier } = req.query;

        if (capability) {
            return res.json({
                capability,
                agents: agentRegistry.findByCapability(capability)
            });
        }

        res.json(agentRegistry.toJSON());
    }

    /** GET /api/v1/agents/:name — Get specific agent details */
    static async getAgent(req, res) {
        const agent = agentRegistry.get(req.params.name);
        if (!agent) return res.status(404).json({ error: 'Agent not found' });
        res.json(agent);
    }

    /** GET /api/v1/ai/status — Get AI provider and worker status */
    static async aiStatus(req, res) {
        res.json({
            ai: aiProvider.getInfo(),
            orchestrator: {
                mode: orchestrator.mode,
                pendingApprovals: orchestrator.pendingApprovals.size,
                recentHistory: orchestrator.executionHistory.length
            },
            workers: workerFactory.getStatus()
        });
    }

    /** POST /api/v1/ai/switch — Switch AI provider */
    static async switchProvider(req, res) {
        try {
            const { provider } = req.body;
            await aiProvider.switchTo(provider);
            res.json({ status: 'switched', provider: aiProvider.getInfo() });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /** POST /api/v1/agents/mission — Launch a high-level goal via OrchestratorAgent */
    static startMission = catchAsync(async (req, res) => {
        const { goal } = req.body;
        if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'goal is required (non-empty string)',
                data: null,
            });
        }
        const userId = req.user?.id ?? 'anonymous';
        // UUID prevents sessionId collision when two missions start in the same millisecond
        const sessionId = req.body.sessionId || `mission-${crypto.randomUUID()}`;

        const result = await Orchestrator.execute(goal.trim(), userId, sessionId);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Mission completed',
            data: result,
        });
    });

    /** GET /api/v1/agents/mission/:traceId — Poll mission status */
    static getMissionStatus = catchAsync(async (req, res) => {
        const mission = await Orchestrator.getMissionStatus(req.params.traceId);
        if (!mission) {
            return sendResponse(res, {
                statusCode: httpStatus.NOT_FOUND,
                success: false,
                message: `No mission found with traceId: ${req.params.traceId}`,
                data: null,
            });
        }
        sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Mission status', data: mission });
    });

    /** GET /api/v1/agents/missions — List all tracked missions */
    static listMissions = catchAsync(async (req, res) => {
        const missions = await Orchestrator.listMissions();
        sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Mission list', data: missions });
    });
}

