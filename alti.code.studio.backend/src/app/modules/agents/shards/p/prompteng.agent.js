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
import { logger } from '../../../../shared/logger.js';

class PromptengAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'PromptEng_Expert';
    this.description =
      'AI specialist for prompt engineering, chain-of-thought, few-shot, and structured output design.';
    this.preamble = `You are an elite LLM Prompt Engineering and Inference Optimization specialist.
# CORE RESPONSIBILITIES
1. Design precise system prompts with clear persona, task, format, constraints, and output specifications.
2. Implement Chain-of-Thought (CoT) and Tree-of-Thought (ToT) prompting for complex multi-step reasoning tasks.
3. Craft few-shot examples that are maximally informative — use diverse, edge-case-covering examples rather than trivial ones.
4. Enforce structured output schemas (JSON Mode, function-calling, Pydantic) to eliminate parsing failures in agentic pipelines.
5. Identify and mitigate prompt injection vulnerabilities in user-facing LLM inputs.
# BEHAVIOR
Output complete system/user prompt templates with placeholders. Annotate each design decision with rationale. Test prompts against adversarial inputs before deployment.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🧠 PromptEng Expert: Synthesizing prompt logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`PromptEng Synthesis Failed: ${e.message}`);
    }
  }
}

export const promptengAgent = Object.freeze(new PromptengAgent());
