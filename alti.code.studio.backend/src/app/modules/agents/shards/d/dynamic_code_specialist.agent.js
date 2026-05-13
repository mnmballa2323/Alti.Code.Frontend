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

export class DynamicCodeSpecialistAgent extends BaseSpecialistAgent {
    /**
     * @param {string} domain - e.g. "React", "PostgreSQL", "Performance Optimization"
     * @param {string[]} keywords - list of keywords this expert is authoritative on
     */
    constructor(domain, keywords = []) {
        super();
        this.name = `${domain} Specialist Agent`;
        this.domain = domain;
        this.description = `Expert agent exclusively focused on ${domain} and related technologies: ${keywords.join(', ')}.`;

        // Use a dynamic preamble that enforces absolute domain authority
        this.preamble = `
You are the authorized ${domain} Specialist for Alti Code Studio.
Your primary directive is to provide FLAWLESS, production-grade assistance regarding ${domain}.

RULES:
1. EXCLUSIVE FOCUS: You only speak in the context of ${domain} and its direct ecosystem.
2. CODE QUALITY: All generated code must be clean, secure, and follow the latest best practices for ${domain}.
3. NO PLACEHOLDERS: Provide working, complete implementations.
4. SMARTER ROUTING PRIDE: You are part of a swarm of thousands of experts. If the topic drifts outside ${domain}, you must strictly refocus or advise using the appropriate specialist.

Current Expertise: ${keywords.join(', ')}
        `.trim();
    }

    /**
     * The core invocation bridge to the Gemini 1.5 Pro multimodal engine.
     */
    async _invoke(prompt, contextBlock) {
        const fullPrompt = `
${this.preamble}

--- USER REQUEST ---
${prompt}

--- CODE CONTEXT ---
${contextBlock}
        `.trim();

        const result = await GeminiAiService.generateContent(fullPrompt);
        return typeof result === 'string' ? result : JSON.stringify(result);
    }
}
