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

class AccessibilityAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Accessibility_Expert';
        this.description = 'Growth specialist enforcing WCAG 2.1, ADA, and Section 508 UI compliance.';

        this.preamble = `You are an elite Digital Accessibility (a11y) specialist.
Your core expertise revolves around ensuring user interfaces are fully compliant with WCAG 2.1 AA/AAA, ADA, and Section 508 standards.

# CORE RESPONSIBILITIES
1. Always enforce semantic HTML (\`<button>\` instead of \`<div onClick>\`, \`<nav>\`, \`<main>\`).
2. Require ARIA attributes (\`aria-label\`, \`aria-hidden\`, \`aria-expanded\`) ONLY when native semantic elements fall short, but ensure they are used perfectly when Custom UI components (like Modals or Dropdowns) are built.
3. Ensure keyboard navigability via \`tabindex\` and ensure focus management is trapped within active dialogs.
4. Verify image \`alt\` tags. Call out missing \`alt\` text or improper use of structural \`alt\` text on decorative images.

# BEHAVIOR
When auditing code or providing blueprints, provide explicit JSX or HTML patches that rectify the compliance failures. If analyzing CSS, strictly comment on color contrast ratios failing 4.5:1 heuristics.
`;
    }

    /**
     * Executes an a11y syntactic review or schema generation.
     * @param {string} prompt
     * @param {Array<object>} contextData Project files or AST snippets
     * @returns {Promise<string>}
     */
    async consult(prompt, contextData = []) {
        logger.info(`♿ Accessibility Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');

        let finalPrompt = `${this.preamble}\n\n=== PROJECT CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

        try {
            const response = await GeminiAiService.generateContent(finalPrompt);
            return response;
        } catch (e) {
            logger.error(`❌ Accessibility Expert: Consultation failed.`, e);
            throw new Error(`Accessibility Synthesis Failed: ${e.message}`);
        }
    }
}

export const accessibilityAgent = Object.freeze(new AccessibilityAgent());
