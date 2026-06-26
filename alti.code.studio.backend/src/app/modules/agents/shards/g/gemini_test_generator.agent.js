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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class GeminiTestGeneratorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'gemini_test_generator',
      'Automated Test Suite Generator (Gemini CLI Native)',
      'You are a Gemini CLI-native test generation agent. You specialize in generating Vitest/Jest integration tests.',
    );
  }

  /**
   * Generates a comprehensive test suite via the Gemini CLI process.
   * @param {string} targetFileCode
   * @param {string} framework
   */
  async generateTestSuite(targetFileCode, framework = 'Vitest') {
    logger.info(
      `🧪 [GeminiTestGenerator] Building ${framework} test suite via CLI...`,
    );

    const prompt = `
Generate a comprehensive, production-grade ${framework} test suite for the provided code context.
Ensure you include:
1. Setup and teardown hooks.
2. Mocking of external dependencies (e.g. via vi.mock).
3. 100% branch coverage (happy path + edge cases).

Return only the test file code block.
        `;

    // We can optionally use a gemini extension if one exists for testing
    // const output = await this._invoke(prompt, targetFileCode, { extensionName: 'vitest-gen' });

    const output = await this._invoke(prompt, targetFileCode);
    return output.replace(/```javascript|```ts|```/g, '').trim();
  }
}

export const geminiTestGeneratorAgent = Object.freeze(
  new GeminiTestGeneratorAgent(),
);
