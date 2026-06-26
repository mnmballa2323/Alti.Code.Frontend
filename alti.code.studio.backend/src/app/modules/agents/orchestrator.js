/**
 * Copyright (c) 2024 Inso Code
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
import { AgentMemoryHooks } from '../memory/agentmemory.hooks.js';
import { pubsubService } from '../gcpCloud/gcpPubSub.service.js';
import { triadDebateChamberService } from './triad_debate_chamber.service.js';
import { astService } from '../../../shared/ast.service.js';
import { existsSync } from 'fs';

/** Agents that require human approval in HYBRID mode */
const CRITICAL_AGENTS = new Set([
  'devops',
  'iac',
  'cicd',
  'migration',
  'release',
  'git',
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
    if (!valid.includes(mode))
      throw new Error(`Invalid mode. Must be: ${valid.join(', ')}`);
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
    logger.info(
      `🎯 Orchestrator [${this.mode}]: "${task.substring(0, 80)}..."`,
    );

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
      status: 'planned',
    });

    // 🧠 AgentMemory: Record the orchestration decision
    AgentMemoryHooks.captureDecision(
      `Orchestrator [${this.mode}] planned workflow with ${plan.length} agents`,
      `Task: "${task.substring(0, 200)}". Agents: ${plan.map(s => s.agent).join(', ')}`,
      { planId, mode: this.mode, agentCount: plan.length },
    ).catch(() => {});

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
          message:
            'Human approval required. Call POST /api/v1/orchestrate/approve/:planId to execute.',
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
        workflow: true,
      });

      logger.info(`🔗 Workflow: Step [${agent.name}] → Job ${job.id}`);
      results.push({
        agent: agent.name,
        jobId: job.id,
        step: results.length + 1,
      });
      previousOutput = { agent: agent.name, jobId: job.id };
    }

    return { workflow: true, steps: results };
  }

  /**
   * Parallel dispatch — run multiple agents simultaneously
   */
  async dispatchParallel(agentNames, data, context = {}) {
    const promises = agentNames.map(async name => {
      const agent = agentRegistry.get(name);
      if (!agent) return { agent: name, error: 'Agent not found' };

      const job = await queueService.addJob(agent.queue, {
        ...data,
        ...context,
        orchestrated: true,
      });
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
      recentHistory: this.executionHistory.slice(-20),
    };
  }

  // ── PRIVATE METHODS ──

  async _planWorkflow(task) {
    const agents = agentRegistry.list();
    const manifest = agents
      .map(a => `- ${a.name}: ${a.description} [${a.capabilities.join(', ')}]`)
      .join('\n');

    // #5: Enterprise Memory RAG — inject past decision context into planning
    let ragContext = '';
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { ragService } = await import('../memory/rag.service.js');
        ragContext = await Promise.race([
          ragService.query(
            `Past orchestration decisions and architectural guidelines for: ${task}`,
            3,
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 8000),
          ),
        ]);
        if (ragContext) {
          logger.info(
            `🧠 [Orchestrator] Injected ${ragContext.length} chars of enterprise memory into planning.`,
          );
        }
      } catch (e) {
        logger.warn(
          `⚠️ [Orchestrator] RAG context injection failed (non-blocking): ${e.message}`,
        );
      }
    }

    // #5b: File Search — inject indexed document context into planning
    let fileSearchContext = '';
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { fileSearchService } =
          await import('../fileSearch/fileSearch.service.js');
        const stores = await fileSearchService.listStores();
        if (stores && stores.length > 0) {
          const storeNames = stores.slice(0, 3).map(s => s.name);
          const fsResult = await Promise.race([
            fileSearchService.query(task, storeNames),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 8000),
            ),
          ]);
          if (fsResult && fsResult.text) {
            fileSearchContext = fsResult.text.substring(0, 2000);
            logger.info(
              `📚 [Orchestrator] File Search injected ${fileSearchContext.length} chars into planning.`,
            );
          }
        }
      } catch (e) {
        logger.warn(
          `⚠️ [Orchestrator] File Search planning context failed (non-blocking): ${e.message}`,
        );
      }
    }

    const response = await aiProvider.reason(`
You are the Orchestrator of a ${agents.length}-agent AI swarm. Given a task, determine which agents to invoke and in what order.

Available Agents:
${manifest}

${ragContext ? `Enterprise Memory Context (Past Decisions & Guidelines):\n${ragContext}\n` : ''}
${fileSearchContext ? `Indexed Document Context (Gemini File Search):\n${fileSearchContext}\n` : ''}
Task: "${task}"

Rules:
- Use the minimum agents needed. Don't invoke agents unnecessarily.
- For complex tasks, chain agents (output of one feeds the next).
- Micro-agents (linter, formatter, etc.) can run in parallel.
- Add a "description" field explaining what each agent should do.
- If enterprise memory context is provided, use it to inform agent selection and avoid repeating past mistakes.

Respond ONLY with a JSON array: [{"agent": "name", "data": {}, "description": "what to do", "parallel": false}]
No explanation. JSON only.
        `);

    try {
      const match = response.match(/\[[\s\S]*?\]/);
      return match ? JSON.parse(match[0]) : JSON.parse(response);
    } catch (err) {
      logger.error(`❌ Orchestrator: Failed to parse plan: ${err.message}`);
      return [
        {
          agent: 'debug',
          data: { error: err.message, task },
          description: 'Parse failure fallback',
        },
      ];
    }
  }

  async _executeAll(planId, plan, context) {
    const results = [];
    const parallel = plan.filter(s => s.parallel);
    const sequential = plan.filter(s => !s.parallel);
    const sharedContext = { ...context, planId };

    // Publish orchestration execution started to the GCP Swarm Event Mesh
    await pubsubService
      .publishEvent('alti-swarm-events', {
        event: 'ORCHESTRATION_EXECUTION_STARTED',
        planId,
        agentCount: plan.length,
        timestamp: new Date().toISOString(),
      })
      .catch(() => {});

    // Run parallel agents simultaneously
    if (parallel.length > 0) {
      const parallelResults = await Promise.all(
        parallel.map(step => this._healAndExecuteStep(step, sharedContext)),
      );
      results.push(...parallelResults);
    }

    // Run sequential agents in order
    for (const step of sequential) {
      results.push(await this._healAndExecuteStep(step, sharedContext));
    }

    // Execute post-execution mathematical verification and auto-refinement gate
    const evaluationResult = await this._evaluateAndRefine(
      planId,
      results,
      sharedContext,
    );

    this._auditUpdate(planId, 'executed', {
      results,
      evaluation: evaluationResult,
    });

    // Publish orchestration completed event to the GCP Swarm Event Mesh
    await pubsubService
      .publishEvent('alti-swarm-events', {
        event: 'ORCHESTRATION_EXECUTION_COMPLETED',
        planId,
        status: evaluationResult.success ? 'SUCCESS' : 'WARNING',
        timestamp: new Date().toISOString(),
      })
      .catch(() => {});

    return {
      planId,
      status: 'executed',
      mode: this.mode,
      results,
      evaluation: evaluationResult,
      refinedCode: sharedContext.generatedCode || null,
    };
  }

  async _executeHybrid(planId, plan, context) {
    const results = [];
    const needsApproval = [];
    const sharedContext = { ...context, planId };

    for (const step of plan) {
      if (CRITICAL_AGENTS.has(step.agent)) {
        needsApproval.push(step);
      } else {
        results.push(await this._healAndExecuteStep(step, sharedContext));
      }
    }

    if (needsApproval.length > 0) {
      const subPlanId = `${planId}_critical`;
      this.pendingApprovals.set(subPlanId, { plan: needsApproval, context });
    }

    this._auditUpdate(planId, 'hybrid_partial', {
      autoDispatched: results.length,
      pendingApproval: needsApproval.length,
    });
    return {
      planId,
      status: 'hybrid_partial',
      autoDispatched: results,
      pendingApproval: needsApproval.map(s => ({
        agent: s.agent,
        description: s.description,
      })),
      approvalPlanId: needsApproval.length > 0 ? `${planId}_critical` : null,
    };
  }

  /**
   * Recursive meta-cognitive self-healing step execution block.
   * Intercepts step failures, convenes a Triad Debate, synthesizes correction, and retries.
   */
  async _healAndExecuteStep(step, context, attempt = 1, maxRetries = 3) {
    try {
      const result = await this._dispatchStep(step, context);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      logger.warn(
        `⚠️ [Conductor Self-Healing] Step [${step.agent}] failed on attempt ${attempt}/${maxRetries}: ${err.message}`,
      );

      if (attempt >= maxRetries) {
        logger.error(
          `❌ [Conductor Self-Healing] Step [${step.agent}] exhausted all ${maxRetries} healing retries. Escalating.`,
        );
        return { agent: step.agent, error: err.message, failed: true };
      }

      // Publish step failed state to the GCP Swarm Event Mesh
      await pubsubService
        .publishEvent('alti-swarm-events', {
          event: 'ORCHESTRATION_STEP_FAILED',
          planId: context.planId || 'unknown-plan',
          agent: step.agent,
          attempt,
          error: err.message,
          timestamp: new Date().toISOString(),
        })
        .catch(() => {});

      // Convene the Triad Debate Chamber to autonomously formulate a healed solution
      logger.info(
        `🏛️ [Conductor Self-Healing] Convening Triad Debate Chamber to resolve failure: "${err.message}"...`,
      );
      try {
        const debateObjective = `
                We are executing an automated multi-agent workflow step.
                Agent: "${step.agent}"
                Action Description: "${step.description || 'orchestrated step'}"
                Target Input Payload: ${JSON.stringify(step.data || {})}
                
                The execution failed with the following error:
                "${err.message}"
                
                Analyze this failure and synthesize a healed, optimal instruction set or input payload for the retry.
                `;
        const healedConsensus =
          await triadDebateChamberService.initiateDebate(debateObjective);
        logger.info(
          `✅ [Conductor Self-Healing] Triad debate consensus synthesized successfully. Appending healing instructions.`,
        );

        // Inject the healed consensus into the step parameters
        step.data = {
          ...step.data,
          healedInstructions: healedConsensus,
          remediedAt: new Date().toISOString(),
          attempt: attempt + 1,
        };
        step.description = `${step.description || 'orchestrated step'} (Healed on attempt ${attempt + 1}: ${healedConsensus.substring(0, 100)}...)`;

        // Publish healed event to the GCP Swarm Event Mesh
        await pubsubService
          .publishEvent('alti-swarm-events', {
            event: 'ORCHESTRATION_PLAN_HEALED',
            planId: context.planId || 'unknown-plan',
            agent: step.agent,
            remediation: healedConsensus.substring(0, 200),
            timestamp: new Date().toISOString(),
          })
          .catch(() => {});

        // Recursively retry
        return await this._healAndExecuteStep(
          step,
          context,
          attempt + 1,
          maxRetries,
        );
      } catch (debateErr) {
        logger.error(
          `❌ [Conductor Self-Healing] Triad Debate Chamber collapsed: ${debateErr.message}. Falling back to default retry.`,
        );
        // Fallback to basic retry if debate engine fails
        return await this._healAndExecuteStep(
          step,
          context,
          attempt + 1,
          maxRetries,
        );
      }
    }
  }

  /**
   * Post-Execution mathematical verification and recursive auto-refinement gate.
   * Evaluates JavaScript drafts using AST complexity analysis and fixes sub-optimal designs.
   */
  async _evaluateAndRefine(
    planId,
    results,
    context,
    attempt = 1,
    maxRefinements = 3,
  ) {
    logger.info(
      `🔬 [Conductor Evaluation] Scanning artifacts for structural and complexity anomalies...`,
    );

    const draftCode = context.generatedCode || '';
    if (!draftCode) {
      logger.info(
        `🔬 [Conductor Evaluation] No generated code provided for direct AST sweep. Skipping post-execution gate.`,
      );
      return { success: true };
    }

    let complexity = 1;
    let syntaxValid = true;
    let syntaxError = null;

    try {
      complexity = astService.calculateComplexity(draftCode) || 1;
    } catch (err) {
      syntaxValid = false;
      syntaxError = err.message;
    }

    const isAnomalous = !syntaxValid || complexity > 15;

    if (isAnomalous) {
      const anomalyType = !syntaxValid
        ? `Syntax Error: ${syntaxError}`
        : `High Cyclomatic Complexity: ${complexity}`;
      logger.warn(
        `⚠️ [Conductor Evaluation] Anomaly detected: ${anomalyType}. Triggering auto-refinement loop.`,
      );

      if (attempt >= maxRefinements) {
        logger.error(
          `❌ [Conductor Evaluation] Exhausted all ${maxRefinements} refinement retries. Proceeding with warnings.`,
        );
        return {
          success: false,
          reason: `Exhausted refinements for: ${anomalyType}`,
        };
      }

      // Publish evaluation failed event to the GCP Swarm Event Mesh
      await pubsubService
        .publishEvent('alti-swarm-events', {
          event: 'ORCHESTRATION_EVALUATION_FAILED',
          planId,
          anomalyType,
          attempt,
          timestamp: new Date().toISOString(),
        })
        .catch(() => {});

      // Call Gemini to refine the sub-optimal code draft
      try {
        const refinePrompt = `
                You are a Senior Staff Compiler Engineer.
                The following code draft failed our post-execution verification gate.
                
                CRITICAL ERROR/ANOMALY: ${anomalyType}
                
                CODE DRAFT:
                ====
                ${draftCode}
                ====
                
                Please rewrite this code to:
                1. Resolve any syntax errors and ensure it is raw, executable JavaScript.
                2. Reduce cyclomatic complexity below 10 by decomposing nested loops, using early returns, and using map/filter/reduce cleanly.
                
                Return ONLY the clean, raw refined JavaScript code. Do NOT wrap in markdown \`\`\`.
                `;

        const refinedCode = await aiProvider.reason(refinePrompt);
        const cleanRefinedCode = refinedCode
          .replace(/^```[a-z]*\n/i, '')
          .replace(/\n```$/i, '')
          .trim();

        // Update context with refined code
        context.generatedCode = cleanRefinedCode;

        // Publish refined convergence event to the GCP Swarm Event Mesh
        await pubsubService
          .publishEvent('alti-swarm-events', {
            event: 'ORCHESTRATION_CONVERGED',
            planId,
            refinedComplexity:
              astService.calculateComplexity(cleanRefinedCode) || 1,
            timestamp: new Date().toISOString(),
          })
          .catch(() => {});

        // Recursively re-evaluate
        return await this._evaluateAndRefine(
          planId,
          results,
          context,
          attempt + 1,
          maxRefinements,
        );
      } catch (refineErr) {
        logger.error(
          `❌ [Conductor Evaluation] Refinement engine failed: ${refineErr.message}`,
        );
        return { success: false, error: refineErr.message };
      }
    }

    logger.info(
      `✅ [Conductor Evaluation] All verification checks passed perfectly (Complexity: ${complexity}, Syntax: Valid).`,
    );
    return { success: true, complexity };
  }

  async _dispatchStep(step, context) {
    const agent = agentRegistry.get(step.agent);
    if (!agent) return { agent: step.agent, error: 'Agent not found' };

    try {
      const job = await queueService.addJob(agent.queue, {
        ...step.data,
        ...context,
        orchestrated: true,
      });
      logger.info(`📬 Orchestrator: → [${agent.name}] → Job ${job.id}`);

      // 🧠 AgentMemory: Capture dispatch
      AgentMemoryHooks.captureToolUse(
        agent.name,
        step.description || 'orchestrated dispatch',
        `Job ${job.id} dispatched`,
        { jobId: job.id, orchestrated: true },
      ).catch(() => {});

      return { agent: agent.name, jobId: job.id, status: 'dispatched' };
    } catch (err) {
      // 🧠 AgentMemory: Capture failure
      AgentMemoryHooks.captureToolFailure(
        agent.name,
        step.description || 'orchestrated dispatch',
        err,
      ).catch(() => {});

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
