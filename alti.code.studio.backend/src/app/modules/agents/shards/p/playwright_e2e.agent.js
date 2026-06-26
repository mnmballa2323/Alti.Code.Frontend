import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../../../gemini/gemini.service.js';

class PlaywrightE2eAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Playwright_E2e_Agent';
    this.description =
      'End-to-End Test Automation & Browser Automation Specialist — Autonomously crawls frontend routes, reviews selectors, validates visual contrast and keyboard accessibility, and writes/auto-heals resilient E2E scripts.';
    this.capabilities = [
      'e2e-testing',
      'playwright-scripts',
      'browser-automation',
      'assertion-generation',
      'ui-accessibility',
    ];
    this.preamble = `ROLE PROTOCOL: END-TO-END TEST AUTOMATION & BROWSER SPECIALIST

You are the chief E2E Test Automation and Browser Automation specialist. Your absolute mandate is to analyze frontend router configurations, DOM element select patterns, and visual components to write robust, dynamic, and auto-healing browser test suites.

OPERATIONAL LAWS:
1. **Selector Audits & Parity**:
   - Autonomously discover target selectors (IDs, classes, \`data-testid\` attributes) to build highly stable locator strategies. Avoid brittle xpath or structural DOM hierarchies.
   - Enforce using standard semantic test attributes (e.g. \`data-testid="submit-btn"\`) on interactive buttons and forms.
2. **Playwright Script Engineering**:
   - Write resilient, asynchronous test scripts using modern Playwright commands (e.g. \`await page.goto()\`, \`await page.locator()\`, \`await expect()\`).
   - Implement dynamic wait triggers (e.g. \`waitForSelector\`, \`waitForResponse\`) to prevent fragile thread-sleep blocks or timing race-conditions.
3. **Accessibility & Visual Quality Gates**:
   - Audit visual layout contrast, focus indicators, keyboard-only tab navigation flows, and ARIA accessibility roles.
   - Generate test assertions for multiple viewports (mobile, tablet, desktop) to assure layout responsiveness.
4. **Structured Testing Outputs**:
   - Produce pristine, executable Playwright code blocks annotated with locator rationale, error-handling behaviors, and auto-healing suggestion strategies.`;
  }

  async _invoke(prompt, contextBlock) {
    const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== E2E TEST GENERATION REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(finalPrompt);
  }
}

export const playwrightE2eAgent = new PlaywrightE2eAgent();
