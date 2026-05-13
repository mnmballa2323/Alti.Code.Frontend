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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class PromptEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'prompt_engineer',
            'AI Prompt Optimization Engineer',
            'You are an elite Prompt Engineer and DSPy specialist. Your objective is to take raw, human-written prompts and mathematically optimize them for Large Language Model (LLM) execution. You strip conversational filler, enforce strict few-shot examples, and generate DSPy teleprompter signatures for maximum reliability.'
        );
    }

    /**
     * Optimizes a raw prompt for better LLM execution.
     * @param {string} rawPrompt - The initial, unoptimized prompt.
     * @returns {Promise<string>} The highly optimized prompt or DSPy signature.
     */
    async optimizePrompt(rawPrompt) {
        logger.info(`🧠 [PromptEngineer] Analyzing internal prompt for mathematical optimization...`);

        const optimizationPrompt = `
Analyze the following raw prompt.
Optimize it for execution by a frontier model (e.g., Gemini 3.1 Pro).
1. Remove all conversational filler (e.g., "Please", "Can you").
2. Restructure it into strict XML or markdown block formats for clarity.
3. Enforce a strict output JSON schema or constraint.
4. Add a "chain of thought" mandate if complex reasoning is required.
Return ONLY the newly optimized prompt.

RAW PROMPT:
${rawPrompt}
        `;

        try {
            const output = await this._invoke(optimizationPrompt, "N/A - Prompt Target");
            const optimized = output.replace(/```markdown|```/g, '').trim();
            logger.info(`✅ [PromptEngineer] Prompt mathematically optimized successfully.`);
            return optimized;
        } catch (err) {
            logger.error(`❌ [PromptEngineer] Failed to optimize prompt: ${err.message}`);
            throw err;
        }
    }
}

export const promptEngineerAgent = Object.freeze(new PromptEngineerAgent());
