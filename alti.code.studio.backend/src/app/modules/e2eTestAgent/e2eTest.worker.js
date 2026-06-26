/**
 * Copyright (c) 2024 Inso Code — TIER 3: COMPLIANCE & QUALITY
 *
 * E2E Testing Agent — "The Simulator"
 * End-to-end test generation and flow validation.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const e2eTestWorkerProcessor = async job => {
  const { feature, routes, components } = job.data;
  logger.info(`🧪 E2E [${job.id}]: Generating tests for "${feature}"...`);

  const tests = await aiProvider.generate(`
You are a QA automation expert specializing in end-to-end testing (Playwright/Cypress).

Feature: ${feature || 'Not specified'}
Routes: ${JSON.stringify(routes || [])}
Components: ${JSON.stringify(components || [])}

Generate:
1. **Test Suite** — Complete E2E test file (Playwright preferred)
2. **Test Cases** — Happy path + edge cases + error scenarios
3. **Assertions** — Specific checks for each step
4. **Data Setup** — Required test fixtures/seeds

Respond in JSON: { "testFile": string, "testCases": [], "fixtures": string }
    `);

  return { tests: JSON.parse(tests.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
