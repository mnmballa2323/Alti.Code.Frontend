/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Orchestrator v2 — "The Conductor"
 * Routes tasks to the correct agent(s) based on capabilities.
 * Supports multi-agent workflows, human-in-the-loop approval,
 * full autonomy mode, parallel dispatch, and IRS-grade audit trails.
 * 
 * MODES:
 *   - AUTONOMOUS: Full auto-dispatch, agents run without human approval
 *   - SUPERVISED: AI plans the workflow, human reviews before execution
 *   - HYBRID:     Critical agents require approval, others run autonomously
 */

import { agentRegistry } from './agent.registry.js';
import { queueService } from '../queue/queue.service.js';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';
<<<<<<< HEAD
=======
import { AgentMemoryHooks } from '../memory/agentmemory.hooks.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

/** Agents that require human approval in HYBRID mode */
const CRITICAL_AGENTS = new Set([
    'devops', 'iac', 'cicd', 'migration', 'release', 'git'
]);

class Orchestrator {
    constructor() {
        this.mode = process.env.ORCHESTRATOR_MODE || 'AUTONOMOUS'; // AUTONOMOUS | SUPERVISED | HYBRID
        this.pendingApprovals = new Map(); // planId → plan
        this.executionHistory = []; // IRS-grade audit trail
    }

    /**
     * Set orchestration mode
     * @param {'AUTONOMOUS' | 'SUPERVISED' | 'HYBRID'} mode
     */
    setMode(mode) {
        const valid = ['AUTONOMOUS', 'SUPERVISED', 'HYBRID'];
        if (!valid.includes(mode)) throw new Error(`Invalid mode. Must be: ${valid.join(', ')}`);
        this.mode = mode;
        logger.info(`🎯 Orchestrator: Mode set to [${mode}]`);
    }

    /**
     * Given a natural-language task, determine which agents to invoke
     * and dispatch the work based on the current mode.
     * 
     * @param {string} task - Natural language description of the task
     * @param {object} context - Additional context (userId, sessionId, etc.)
     * @returns {Promise<object>} - Plan with dispatched results or pending approval
     */
    async dispatch(task, context = {}) {
        logger.info(`🎯 Orchestrator [${this.mode}]: "${task.substring(0, 80)}..."`);

        // 1. AI-powered planning
        const plan = await this._planWorkflow(task);
        const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // 2. Audit the plan
        this.executionHistory.push({
            planId,
            task,
            plan,
            mode: this.mode,
            timestamp: new Date().toISOString(),
            context,
            status: 'planned'
        });

<<<<<<< HEAD
=======
        // 🧠 AgentMemory: Record the orchestration decision
        AgentMemoryHooks.captureDecision(
            `Orchestrator [${this.mode}] planned workflow with ${plan.length} agents`,
            `Task: "${task.substring(0, 200)}". Agents: ${plan.map(s => s.agent).join(', ')}`,
            { planId, mode: this.mode, agentCount: plan.length }
        ).catch(() => {});

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        // 3. Execute based on mode
        switch (this.mode) {
            case 'AUTONOMOUS':
                return this._executeAll(planId, plan, context);

            case 'SUPERVISED':
                this.pendingApprovals.set(planId, { plan, context, task });
                return {
                    planId,
                    status: 'awaiting_approval',
                    plan: plan.map(s => ({ agent: s.agent, description: s.description })),
                    message: 'Human approval required. Call POST /api/v1/orchestrate/approve/:planId to execute.'
                };

            case 'HYBRID':
                return this._executeHybrid(planId, plan, context);

            default:
                return this._executeAll(planId, plan, context);
        }
    }

    /**
     * Approve a pending plan (SUPERVISED/HYBRID mode)
     */
    async approve(planId) {
        const pending = this.pendingApprovals.get(planId);
        if (!pending) throw new Error(`No pending plan: ${planId}`);

        this.pendingApprovals.delete(planId);
        logger.info(`✅ Orchestrator: Plan ${planId} APPROVED by human`);

        return this._executeAll(planId, pending.plan, pending.context);
    }

    /**
     * Reject a pending plan
     */
    reject(planId, reason = 'Rejected by human') {
        const pending = this.pendingApprovals.get(planId);
        if (!pending) throw new Error(`No pending plan: ${planId}`);

        this.pendingApprovals.delete(planId);
        this._auditUpdate(planId, 'rejected', { reason });
        logger.info(`🚫 Orchestrator: Plan ${planId} REJECTED: ${reason}`);

        return { planId, status: 'rejected', reason };
    }

    /**
     * Multi-agent workflow — run agents in sequence, passing output to next
     * @param {Array<{agent: string, data: object}>} workflow - Ordered agent steps
     * @param {object} context - Shared context
     */
    async runWorkflow(workflow, context = {}) {
        const results = [];
        let previousOutput = {};

        for (const step of workflow) {
            const agent = agentRegistry.get(step.agent);
            if (!agent) {
                logger.warn(`⚠️ Workflow: Unknown agent "${step.agent}". Skipping.`);
                continue;
            }

            const job = await queueService.addJob(agent.queue, {
                ...step.data,
                ...context,
                previousOutput,
                orchestrated: true,
                workflow: true
            });

            logger.info(`🔗 Workflow: Step [${agent.name}] → Job ${job.id}`);
            results.push({ agent: agent.name, jobId: job.id, step: results.length + 1 });
            previousOutput = { agent: agent.name, jobId: job.id };
        }

        return { workflow: true, steps: results };
    }

    /**
     * Parallel dispatch — run multiple agents simultaneously
     */
    async dispatchParallel(agentNames, data, context = {}) {
        const promises = agentNames.map(async (name) => {
            const agent = agentRegistry.get(name);
            if (!agent) return { agent: name, error: 'Agent not found' };

            const job = await queueService.addJob(agent.queue, { ...data, ...context, orchestrated: true });
            return { agent: name, jobId: job.id, status: 'dispatched' };
        });

        return Promise.all(promises);
    }

    /**
     * Direct dispatch to a specific agent (bypass AI routing)
     */
    async dispatchDirect(agentName, data, context = {}) {
        const agent = agentRegistry.get(agentName);
        if (!agent) throw new Error(`Agent not found: ${agentName}`);

        const job = await queueService.addJob(agent.queue, { ...data, ...context });
        logger.info(`📬 Orchestrator: Direct → [${agentName}] → Job ${job.id}`);
        return { agent: agentName, jobId: job.id, status: 'dispatched' };
    }

    /** Get full status */
    getStatus() {
        return {
            mode: this.mode,
            agents: agentRegistry.toJSON(),
            pendingApprovals: Array.from(this.pendingApprovals.keys()),
            recentHistory: this.executionHistory.slice(-20)
        };
    }

    // ── PRIVATE METHODS ──

    async _planWorkflow(task) {
        const agents = agentRegistry.list();
        const manifest = agents.map(a =>
            `- ${a.name}: ${a.description} [${a.capabilities.join(', ')}]`
        ).join('\n');

<<<<<<< HEAD
=======
        // #5: Enterprise Memory RAG — inject past decision context into planning
        let ragContext = '';
        try {
            const { ragService } = await import('../memory/rag.service.js');
            ragContext = await Promise.race([
                ragService.query(`Past orchestration decisions and architectural guidelines for: ${task}`, 3),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
            ]);
            if (ragContext) {
                logger.info(`🧠 [Orchestrator] Injected ${ragContext.length} chars of enterprise memory into planning.`);
            }
        } catch (e) {
            logger.warn(`⚠️ [Orchestrator] RAG context injection failed (non-blocking): ${e.message}`);
        }

        // #5b: File Search — inject indexed document context into planning
        let fileSearchContext = '';
        try {
            const { fileSearchService } = await import('../fileSearch/fileSearch.service.js');
            const stores = await fileSearchService.listStores();
            if (stores && stores.length > 0) {
                const storeNames = stores.slice(0, 3).map(s => s.name);
                const fsResult = await Promise.race([
                    fileSearchService.query(task, storeNames),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
                ]);
                if (fsResult && fsResult.text) {
                    fileSearchContext = fsResult.text.substring(0, 2000);
                    logger.info(`📚 [Orchestrator] File Search injected ${fileSearchContext.length} chars into planning.`);
                }
            }
        } catch (e) {
            logger.warn(`⚠️ [Orchestrator] File Search planning context failed (non-blocking): ${e.message}`);
        }

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        const response = await aiProvider.reason(`
You are the Orchestrator of a ${agents.length}-agent AI swarm. Given a task, determine which agents to invoke and in what order.

Available Agents:
${manifest}

<<<<<<< HEAD
=======
${ragContext ? `Enterprise Memory Context (Past Decisions & Guidelines):\n${ragContext}\n` : ''}
${fileSearchContext ? `Indexed Document Context (Gemini File Search):\n${fileSearchContext}\n` : ''}
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
Task: "${task}"

Rules:
- Use the minimum agents needed. Don't invoke agents unnecessarily.
- For complex tasks, chain agents (output of one feeds the next).
- Micro-agents (linter, formatter, etc.) can run in parallel.
- Add a "description" field explaining what each agent should do.
<<<<<<< HEAD
=======
- If enterprise memory context is provided, use it to inform agent selection and avoid repeating past mistakes.
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

Respond ONLY with a JSON array: [{"agent": "name", "data": {}, "description": "what to do", "parallel": false}]
No explanation. JSON only.
        `);

        try {
            const match = response.match(/\[[\s\S]*?\]/);
            return match ? JSON.parse(match[0]) : JSON.parse(response);
        } catch (err) {
            logger.error(`❌ Orchestrator: Failed to parse plan: ${err.message}`);
            return [{ agent: 'debug', data: { error: err.message, task }, description: 'Parse failure fallback' }];
        }
    }

    async _executeAll(planId, plan, context) {
        const results = [];
        const parallel = plan.filter(s => s.parallel);
        const sequential = plan.filter(s => !s.parallel);

        // Run parallel agents simultaneously
        if (parallel.length > 0) {
            const parallelResults = await Promise.all(parallel.map(step =>
                this._dispatchStep(step, context)
            ));
            results.push(...parallelResults);
        }

        // Run sequential agents in order
        for (const step of sequential) {
            results.push(await this._dispatchStep(step, context));
        }

        this._auditUpdate(planId, 'executed', { results });
        return { planId, status: 'executed', mode: this.mode, results };
    }

    async _executeHybrid(planId, plan, context) {
        const results = [];
        const needsApproval = [];

        for (const step of plan) {
            if (CRITICAL_AGENTS.has(step.agent)) {
                needsApproval.push(step);
            } else {
                results.push(await this._dispatchStep(step, context));
            }
        }

        if (needsApproval.length > 0) {
            const subPlanId = `${planId}_critical`;
            this.pendingApprovals.set(subPlanId, { plan: needsApproval, context });
        }

        this._auditUpdate(planId, 'hybrid_partial', { autoDispatched: results.length, pendingApproval: needsApproval.length });
        return {
            planId,
            status: 'hybrid_partial',
            autoDispatched: results,
            pendingApproval: needsApproval.map(s => ({ agent: s.agent, description: s.description })),
            approvalPlanId: needsApproval.length > 0 ? `${planId}_critical` : null
        };
    }

    async _dispatchStep(step, context) {
        const agent = agentRegistry.get(step.agent);
        if (!agent) return { agent: step.agent, error: 'Agent not found' };

        try {
            const job = await queueService.addJob(agent.queue, {
                ...step.data,
                ...context,
                orchestrated: true
            });
            logger.info(`📬 Orchestrator: → [${agent.name}] → Job ${job.id}`);
<<<<<<< HEAD
            return { agent: agent.name, jobId: job.id, status: 'dispatched' };
        } catch (err) {
=======

            // 🧠 AgentMemory: Capture dispatch
            AgentMemoryHooks.captureToolUse(
                agent.name,
                step.description || 'orchestrated dispatch',
                `Job ${job.id} dispatched`,
                { jobId: job.id, orchestrated: true }
            ).catch(() => {});

            return { agent: agent.name, jobId: job.id, status: 'dispatched' };
        } catch (err) {
            // 🧠 AgentMemory: Capture failure
            AgentMemoryHooks.captureToolFailure(
                agent.name,
                step.description || 'orchestrated dispatch',
                err
            ).catch(() => {});

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
            return { agent: agent.name, error: err.message };
        }
    }

    _auditUpdate(planId, status, details = {}) {
        const entry = this.executionHistory.find(e => e.planId === planId);
        if (entry) {
            entry.status = status;
            entry.completedAt = new Date().toISOString();
            entry.details = details;
        }
    }
}

export const orchestrator = new Orchestrator();
