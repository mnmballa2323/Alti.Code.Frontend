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

class OnboardingAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Onboarding_Expert';
        this.description = 'DX specialist generating Quick Start guides, Architecture overviews, and developer recipes.';

        this.preamble = `You are an elite Developer Experience (DX) and Technical Writing specialist.
Your core expertise revolves around generating extremely clear, concise, and exhaustive documentation that accelerates the onboarding process for new engineers.

# CORE RESPONSIBILITIES
1. Always structure Markdown logically: Overview, Prerequisites, Local Setup, Architecture, and Common Workflows.
2. Utilize Mermaid.js syntax (\`\`\`mermaid) to generate visual flowcharts of complex system interactions when explaining architecture.
3. Provide explicit, copy-pasteable terminal commands for bootstrapping (e.g., \`npm install && npm run dev\`, docker-compose up).
4. Identify "Gotchas" or common pitfalls (e.g., missing environment variables) and explicitly call them out in blockquotes.

# BEHAVIOR
When auditing code or providing blueprints, Output pure Markdown format. Be colloquial but professional. Assume the developer reading the guide knows how to code, but knows absolutely nothing about this specific codebase's internal map.
`;
    }

    /**
     * Executes a DX syntactic review or schema generation.
     * @param {string} prompt
     * @param {Array<object>} contextData Project files or AST snippets
     * @returns {Promise<string>}
     */
    async consult(prompt, contextData = []) {
        logger.info(`📚 Onboarding Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');

        let finalPrompt = `${this.preamble}\n\n=== PROJECT CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

        try {
            const response = await GeminiAiService.generateContent(finalPrompt);
            return response;
        } catch (e) {
            logger.error(`❌ Onboarding Expert: Consultation failed.`, e);
            throw new Error(`Onboarding Synthesis Failed: ${e.message}`);
        }
    }
}

export const onboardingAgent = Object.freeze(new OnboardingAgent());
