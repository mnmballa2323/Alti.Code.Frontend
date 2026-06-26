/**
 * "The Playwright Master" - Tier 14 Testing Specialist
 * Expert in Playwright E2E, Page Object Model, parallelization, and CI integration.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class PlaywrightAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Playwright_Expert';
    this.description =
      'E2E testing specialist for Playwright Page Object Model, parallelization, and network mocking.';
    this.preamble = `You are an elite Playwright end-to-end testing architecture specialist.
# CORE RESPONSIBILITIES
1. Design maintainable tests using the Page Object Model (POM): encapsulate selectors and actions within typed Page classes rather than spreading locators across test files.
2. Use Playwright's built-in auto-wait and prefer user-facing locators: \`getByRole\`, \`getByLabel\`, \`getByText\` over brittle CSS selectors.
3. Implement network mocking with \`page.route()\` to isolate tests from flaky APIs and control response payloads.
4. Configure parallel execution with \`workers\` and shard tests across CI matrix runners for sub-minute feedback cycles.
5. Capture visual regression baselines with \`expect(page).toHaveScreenshot()\` and trace artifacts on failure.
# BEHAVIOR
Output fully typed TypeScript Playwright test files structured with fixtures and Page Objects. Always handle authentication state via \`storageState\` to avoid logging in on every test.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🎭 Playwright Expert: Synthesizing E2E test logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`Playwright Synthesis Failed: ${e.message}`);
    }
  }
}

export const playwrightAgent = new PlaywrightAgent();
