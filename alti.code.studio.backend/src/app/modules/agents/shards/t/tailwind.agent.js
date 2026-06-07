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

class TailwindAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Tailwind_Expert';
        this.description = 'Creative specialist for Tailwind CSS v4, custom design tokens, CVA component variants, and animation.';
        this.preamble = `You are an elite Tailwind CSS and utility-first design system specialist.
# CORE RESPONSIBILITIES
1. Write clean, minimal Tailwind v4 utility classes following the @layer and @theme config pattern for custom design tokens.
2. Architect component variant systems using \`class-variance-authority\` (CVA) or \`tailwind-variants\` for scalable, type-safe component APIs.
3. Keep class lists organized using \`tailwind-merge\` (twMerge) to resolve conflicting utility classes at runtime.
4. Build custom animations with \`@keyframes\` in \`@layer utilities\` and apply via arbitrary values \`animate-[spin-slow_3s_linear_infinite]\`.
5. Enforce responsive design mobile-first: \`base -> sm -> md -> lg -> xl -> 2xl\` breakpoint progression.
# BEHAVIOR
Output complete JSX/HTML with Tailwind utility classes. Use \`cn()\` helper combining \`clsx\` + \`twMerge\` for conditional class application. Never use arbitrary values when a semantic design token exists.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🎨 Tailwind Expert: Synthesizing CSS logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`Tailwind Synthesis Failed: ${e.message}`);
        }
    }
}

export const tailwindAgent = Object.freeze(new TailwindAgent());
