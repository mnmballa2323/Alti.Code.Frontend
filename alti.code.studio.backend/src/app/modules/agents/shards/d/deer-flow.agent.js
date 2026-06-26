// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { deerFlowService } from '../openclaw/deer-flow.service.js';
import { logger } from '../../../../shared/logger.js';

class DeerFlowAgent extends BaseSpecialistAgent {
  constructor() {
    super('DeerFlowAgent', 'The Deep Researcher', 'Tier 13');
    this.name = 'DeerFlow_Deep_Research';
    this.description =
      'Deep research harness capable of tasks taking minutes to hours. Powered by ByteDance deer-flow: researches, codes, and creates using sandboxes, memory, tools, and subagents. Use for: comprehensive research reports, multi-source synthesis, long-form content generation with citations, and complex multi-step coding projects.';
    this.preamble = `You are the Deep Research Harness Agent, powered by ByteDance's deer-flow SuperAgent framework.
You specialize in tasks that require sustained, deep effort — research that would take a human hours.

**Core Capabilities:**
1. **Deep Research** — Multi-step web research with source synthesis and citation
2. **Code Projects** — Multi-file code generation with iterative refinement
3. **Technical Reports** — Research → outline → draft → review pipeline
4. **Podcast Scripts** — Multi-perspective content generation
5. **Data Analysis** — Structured analysis with sandboxed code execution
6. **Multi-Agent Coordination** — Orchestrate subagents for parallel work streams

**Architecture:** LangGraph-based pipeline with:
- Coordinator → Planner → Research/Code/Report agents
- Memory across tool calls
- Sandboxed Python/Node execution
- Tool access: web search, code execution, file I/O

When delegating to deer-flow, you:
1. Analyze the task complexity
2. Formulate a precise research/execution brief
3. Hand off to the deer-flow harness
4. Return structured results with citations`;
  }

  async _invoke(prompt, contextBlock, opts = {}) {
    logger.info(`🦌 DeerFlow Deep Researcher: Analyzing task complexity...`);

    const caps = deerFlowService.getCapabilities();

    if (!caps.available) {
      // Graceful degradation: use Gemini directly for research
      logger.warn(
        '[deer-flow-agent] deer-flow not available, falling back to Gemini deep research',
      );
      return GeminiAiService.generateContent(
        `${this.preamble}\n\nContext: ${contextBlock || ''}\n\nTask (using built-in research capability): ${prompt}`,
      );
    }

    // Determine if this warrants full deer-flow orchestration or a quick Gemini answer
    const complexityCheck = await GeminiAiService.generateContent(
      `Rate this task's complexity for deep research on a scale of 1-10. Respond with only a number.
Task: "${prompt}"
Score:`,
    );

    const complexity = parseInt(complexityCheck.trim()) || 5;
    logger.info(`[deer-flow-agent] Task complexity score: ${complexity}/10`);

    if (complexity >= 7) {
      // Delegate to deer-flow for truly complex tasks
      logger.info(
        '[deer-flow-agent] High-complexity task — delegating to deer-flow harness',
      );
      const result = await deerFlowService.runTask(prompt, {
        timeout: 300000, // 5 min max
        maxSteps: 20,
        concurrency:
          opts.maxConcurrentAgents || process.env.MAX_CONCURRENT_AGENTS || 10,
        telemetryLevel:
          opts.telemetryLevel || process.env.TELEMETRY_LEVEL || 'info',
      });

      return result.status === 'success'
        ? result.output
        : `[deer-flow result: ${result.status}]\n${result.output || result.message || ''}`;
    } else {
      // For moderate complexity, use Gemini with the deep researcher preamble
      return GeminiAiService.generateContent(
        `${this.preamble}\n\nContext: ${contextBlock || ''}\n\nResearch Task: ${prompt}`,
      );
    }
  }
}

export const deerFlowAgent = Object.freeze(new DeerFlowAgent());
