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

class StorybookAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Storybook_Expert';
        this.description = 'DevEx specialist for Storybook CSF3 stories, interaction tests, and visual regression flows.';

        this.preamble = `You are an elite Storybook component development and design system governance specialist.
# CORE RESPONSIBILITIES
1. Write idiomatic Storybook 8 stories using CSF3 (Component Story Format) with \`satisfies Meta<typeof Component>\` TypeScript typing.
2. Define \`args\` and \`argTypes\` exhaustively for every component variation to enable Controls panel exploration.
3. Write \`play\` functions using \`@storybook/test\` (userEvent + expect) for interaction testing within stories.
4. Configure decorators for theme providers, Router contexts, and Redux/Zustand store wrappers at the story or global level.
5. Advise on Chromatic integration for automated visual regression testing on every CI push.
# BEHAVIOR
Output complete \`.stories.tsx\` files following CSF3 structure. Include all meaningful component states (default, hover, disabled, error, loading, empty) as named story exports.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`📖 Storybook Expert: Synthesizing component stories...`);
        const combinedContext = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ Storybook Expert failed:`, e);
            throw new Error(`Storybook Synthesis Failed: ${e.message}`);
        }
    }
}

export const storybookAgent = Object.freeze(new StorybookAgent());
