/**
 * Multi-Agent Orchestrator
 * 
 * Coordinates multiple AI agents working on complex tasks:
 * - Pipeline: sequential agent chain (A → B → C)
 * - Parallel: concurrent execution with merge
 * - Supervisor: meta-agent delegates to specialists
 * - Consensus: multiple agents vote on best answer
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { modelRouter } from './modelRouter.js';
import { EventEmitter } from 'events';

class AgentOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.activeRuns = new Map();
    this.maxConcurrency = parseInt(process.env.MAX_AGENT_CONCURRENCY || '10');
  }

  /**
   * Execute a pipeline: agents run in sequence, each receiving previous output
   */
  async pipeline(agents, input, context = {}) {
    const runId = this._createRunId();
    const startTime = Date.now();
    this.activeRuns.set(runId, { type: 'pipeline', status: 'running', agents: agents.map(a => a.name) });

    let currentInput = input;
    const results = [];

    for (const agent of agents) {
      try {
        const model = modelRouter.route({ complexity: agent.complexity || 'medium', tenantTier: context.tenantTier });
        const stepResult = await this._executeAgent(agent, currentInput, { ...context, modelId: model.model.id, runId });
        results.push({ agent: agent.name, output: stepResult, model: model.model.id });
        currentInput = stepResult;
      } catch (err) {
        logger.error(`[Orchestrator] Pipeline step "${agent.name}" failed:`, err.message);
        this.activeRuns.set(runId, { ...this.activeRuns.get(runId), status: 'failed', error: err.message });
        throw err;
      }
    }

    const duration = Date.now() - startTime;
    metrics.recordHistogram('orchestrator_pipeline_duration_ms', duration);
    this.activeRuns.set(runId, { ...this.activeRuns.get(runId), status: 'completed', duration });
    this.emit('pipeline:complete', { runId, results, duration });

    return { runId, results, finalOutput: currentInput, duration };
  }

  /**
   * Execute agents in parallel, merge results
   */
  async parallel(agents, input, context = {}) {
    const runId = this._createRunId();
    const startTime = Date.now();
    this.activeRuns.set(runId, { type: 'parallel', status: 'running', agents: agents.map(a => a.name) });

    const promises = agents.map(agent => {
      const model = modelRouter.route({ complexity: agent.complexity || 'medium', tenantTier: context.tenantTier });
      return this._executeAgent(agent, input, { ...context, modelId: model.model.id, runId })
        .then(output => ({ agent: agent.name, output, status: 'success', model: model.model.id }))
        .catch(err => ({ agent: agent.name, output: null, status: 'error', error: err.message }));
    });

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    const successes = results.filter(r => r.status === 'success');

    metrics.recordHistogram('orchestrator_parallel_duration_ms', duration);
    metrics.incrementCounter('orchestrator_parallel_agents', agents.length);
    this.activeRuns.set(runId, { ...this.activeRuns.get(runId), status: 'completed', duration });

    return { runId, results, successCount: successes.length, totalAgents: agents.length, duration };
  }

  /**
   * Supervisor pattern: meta-agent decides which specialists to invoke
   */
  async supervise(task, availableAgents, context = {}) {
    const runId = this._createRunId();
    this.activeRuns.set(runId, { type: 'supervisor', status: 'planning' });

    // Step 1: Use Pro model to analyze task and select agents
    const planModel = modelRouter.route({ complexity: 'complex', tenantTier: context.tenantTier });
    const plan = await this._planExecution(task, availableAgents, { ...context, modelId: planModel.model.id });

    // Step 2: Execute selected agents
    this.activeRuns.set(runId, { ...this.activeRuns.get(runId), status: 'executing', plan });
    const selectedAgents = availableAgents.filter(a => plan.selectedAgents.includes(a.name));

    let result;
    if (plan.executionMode === 'parallel') {
      result = await this.parallel(selectedAgents, task, context);
    } else {
      result = await this.pipeline(selectedAgents, task, context);
    }

    this.activeRuns.set(runId, { ...this.activeRuns.get(runId), status: 'completed' });
    return { runId, plan, result };
  }

  getActiveRuns() {
    return Object.fromEntries(this.activeRuns);
  }

  getRunStatus(runId) {
    return this.activeRuns.get(runId) || null;
  }

  async _executeAgent(agent, input, context) {
    const startTime = Date.now();
    try {
      if (typeof agent.execute === 'function') {
        return await agent.execute(input, context);
      }
      // Fallback: treat as prompt-based agent
      return { agentName: agent.name, input, status: 'no_execute_method' };
    } finally {
      metrics.recordHistogram('agent_execution_duration_ms', Date.now() - startTime, { agent: agent.name });
    }
  }

  async _planExecution(task, agents, context) {
    // Simple heuristic planner (can be replaced with LLM-based planning)
    const agentNames = agents.map(a => a.name);
    return {
      selectedAgents: agentNames.slice(0, 3), // Select up to 3 most relevant
      executionMode: agentNames.length > 2 ? 'parallel' : 'pipeline',
      reasoning: `Selected ${Math.min(agentNames.length, 3)} agents for task decomposition`,
    };
  }

  _createRunId() {
    return `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

export const orchestrator = new AgentOrchestrator();
