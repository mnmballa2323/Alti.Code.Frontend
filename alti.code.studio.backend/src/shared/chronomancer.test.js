import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chronomancerAgent } from './chronomancer.agent.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';

vi.mock('../app/modules/gemini/gemini.service.js');

describe('Continuous State-Machine Rewinds (Phase 27 - The Chronomancer)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should freeze memory during a critical failure, synthesize a patch, and fast-forward to success seamlessly', async () => {
    // A naive developer wrote a division function that doesn't check for zero.
    function calculateFinancialRatio(revenue, debt) {
      if (debt === 0) {
        throw new Error(
          'DivisionByZero: Cannot calculate ratio when debt is 0.',
        );
      }
      return revenue / debt;
    }

    // We mock Gemini providing the structurally patched function
    const mockedPatchedFunction = `
        function calculateFinancialRatio(revenue, debt) {
            if (debt === 0) return revenue; // Fallback patch
            return revenue / debt;
        }
        `;
    GeminiAiService.generateContent.mockResolvedValueOnce(
      mockedPatchedFunction,
    );

    // The malicious args that will trigger the crash
    const frozenMemoryState = [1000, 0];

    // We wrap the vulnerable function in the temporal buffer
    const result = await chronomancerAgent.executeWithTemporalBuffer(
      calculateFinancialRatio,
      frozenMemoryState,
    );

    // ASSERTIONS

    // 1. The LLM was correctly called to synthesize a hot-patch
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    // 2. The result should successfully be the fallback payload (1000), meaning the transaction didn't ultimately drop
    expect(result).toBe(1000);
  });

  it('should execute a flawless function perfectly without triggering the temporal buffer', async () => {
    function flawlessMath(a, b) {
      return a + b;
    }

    const result = await chronomancerAgent.executeWithTemporalBuffer(
      flawlessMath,
      [5, 5],
    );

    expect(GeminiAiService.generateContent).not.toHaveBeenCalled();
    expect(result).toBe(10);
  });
});
