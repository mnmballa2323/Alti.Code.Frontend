// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { agentSkillsService } from '../openclaw/agent-skills.service.js';
import { logger } from '../../../../shared/logger.js';

class AgentSkillsContextAgent extends BaseSpecialistAgent {
    constructor() {
        super('AgentSkillsContextAgent', 'The Context Engineer', 'Tier 13');
        this.name = 'Context_Engineering_Expert';
        this.description = 'Context window optimization, multi-agent context passing, SCRATCHPAD/SELECTOR/COMPRESSOR patterns, and token budget management for production agent systems.';
    }

    get preamble() {
        // Dynamically load context engineering skill content
        const skills = agentSkillsService.loadSkills();
        const contextSkills = skills.slice(0, 8); // Top 8 most relevant skills

        const skillsBlock = contextSkills.length > 0
            ? contextSkills.map(s => `### ${s.name}\n${s.content.slice(0, 800)}`).join('\n\n')
            : '';

        return `You are the Context Engineering Expert, a world-class specialist in agent context optimization.
You apply the following proven patterns from the Agent-Skills-for-Context-Engineering collection:

**Core Patterns You Apply:**
1. **SCRATCHPAD** — Maintain a working memory pad for multi-step reasoning before answering
2. **SELECTOR** — Choose only the most relevant context segments to include
3. **COMPRESSOR** — Eliminate redundant information to maximize information density
4. **CONTEXT-DISTILLERY** — Distil long histories into dense, high-value summaries
5. **TOKEN-BUDGET** — Actively manage and stay within token budget constraints
6. **RETRIEVAL-AUGMENTATION** — Inject retrieved context at the right prompt position
7. **MULTI-AGENT HANDOFF** — Structure context for clean agent-to-agent passing

**Loaded Skill Definitions:**
${skillsBlock || '(Skills submodule not yet initialized — applying built-in pattern knowledge)'}

When asked to help with context engineering, agent system design, or prompt optimization:
- Diagnose the context problem first
- Recommend specific patterns with concrete examples
- Provide optimized prompt templates
- Estimate token costs and trade-offs
- Design multi-agent context passing flows`;
    }

    async _invoke(prompt, contextBlock) {
        logger.info(`🧠 Context Engineer: Applying context optimization patterns...`);

        // Apply COMPRESSOR pattern to incoming context
        const compressedContext = agentSkillsService.compressContext(contextBlock || '');
        const budgetedContext = agentSkillsService.applyTokenBudget(compressedContext, 6000);

        const fullPrompt = `${this.preamble}\n\n## Context\n${budgetedContext}\n\n## Task\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const agentSkillsContextAgent = Object.freeze(new AgentSkillsContextAgent());
