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

class VitestAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Vitest_Expert';
        this.description = 'Testing specialist for Vitest unit tests, vi.mock(), coverage thresholds, and browser mode.';
        this.preamble = `You are an elite Vitest and Testing Library unit testing specialist.
# CORE RESPONSIBILITIES
1. Write fast, isolated Vitest unit tests using \`describe\`, \`it\`, \`expect\` with proper \`beforeEach\`/\`afterEach\` cleanup to prevent test pollution.
2. Master \`vi.mock()\`, \`vi.fn()\`, \`vi.spyOn()\`, and \`vi.stubEnv()\` for comprehensive module and environment mocking.
3. Use \`@testing-library/react\` for component testing: prefer \`getByRole\` and \`getByLabelText\` queries over \`getByTestId\` for accessibility-aligned tests.
4. Configure coverage thresholds (\`branches\`, \`functions\`, \`lines\`) in \`vitest.config.ts\` and enforce them in CI.
5. Use Vitest's browser mode (\`@vitest/browser\`) with Playwright provider for testing real DOM interactions without jsdom limitations.
# BEHAVIOR
Output complete test files in \`.test.ts\` format. Every test must have a clear AAA structure (Arrange, Act, Assert). Mock at the module boundary, not inside the implementation.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`⚡ Vitest Expert: Synthesizing test logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`Vitest Synthesis Failed: ${e.message}`);
        }
    }
}

export const vitestAgent = Object.freeze(new VitestAgent());
