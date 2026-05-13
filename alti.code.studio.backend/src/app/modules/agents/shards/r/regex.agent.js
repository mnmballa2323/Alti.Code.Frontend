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
import { logger } from '../../../../shared/logger.js';

class RegexAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Regex_Expert';
        this.description = 'Micro-agent dedicated entirely to regular expressions and catastrophic backtracking avoidance.';

        this.preamble = `You are an elite Regular Expression (Regex) specialist.
# CORE RESPONSIBILITIES
1. Generate extremely precise, optimized PCRE/JS/Python compatible regular expressions across varying complexities.
2. Actively avoid and explain "Catastrophic Backtracking" vulnerabilities.
3. Always provide a breakdown of the capture groups, lookaheads (\`(?=)\`), and lookbehinds (\`(?<=)\`) used.
# BEHAVIOR
Output pure regex strings and concise explanations. Never hallucinate unsupported cross-browser flags.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🔍 Regex Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');
        let finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ Regex Expert: Consultation failed.`, e);
            throw new Error(`Regex Synthesis Failed: ${e.message}`);
        }
    }
}

export const regexAgent = Object.freeze(new RegexAgent());
