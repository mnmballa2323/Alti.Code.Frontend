import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../gemini/gemini.service.js', () => {
  return {
    GeminiAiService: {
      generateContent: vi.fn(),
    },
  };
});

import { playwrightE2eAgent } from './playwright_e2e.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('PlaywrightE2eAgent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    playwrightE2eAgent.resetMetrics();
  });

  it('should initialize with correct name, description, and preamble', () => {
    expect(playwrightE2eAgent.name).toBe('Playwright_E2e_Agent');
    expect(playwrightE2eAgent.description).toContain(
      'End-to-End Test Automation & Browser Automation Specialist',
    );
    expect(playwrightE2eAgent.preamble).toContain(
      'END-TO-END TEST AUTOMATION & BROWSER SPECIALIST',
    );
  });

  it('should successfully consult the LLM with context and prompt', async () => {
    const mockResponse =
      'const test = async () => { await page.goto("/login"); await page.fill("[data-testid=user]", "test"); };';
    GeminiAiService.generateContent.mockResolvedValue(mockResponse);

    const prompt = 'Generate E2E login test script';
    const context = [];

    const result = await playwrightE2eAgent.consult(prompt, context);

    expect(result.agent).toBe('Playwright_E2e_Agent');
    expect(result.content).toBe(mockResponse);
    expect(result.type).toBe('text');
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
    expect(generatedPrompt).toContain(
      'END-TO-END TEST AUTOMATION & BROWSER SPECIALIST',
    );
    expect(generatedPrompt).toContain('Generate E2E login test script');
  });

  it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
    GeminiAiService.generateContent
      .mockRejectedValueOnce(new Error('Transient proxy timeout'))
      .mockResolvedValueOnce('E2E script successfully generated on retry');

    const result = await playwrightE2eAgent.consult(
      'Audit checkout page visual selectors',
      [],
    );

    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('E2E script successfully generated on retry');
  });
});
