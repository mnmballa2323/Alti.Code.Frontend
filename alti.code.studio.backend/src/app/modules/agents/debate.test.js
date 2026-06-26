import { describe, it, expect, vi, beforeEach } from 'vitest';
import { debateService } from './debate.service.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { astService } from '../../../shared/ast.service.js';

vi.mock('../gemini/gemini.service.js');
vi.mock('../../../shared/ast.service.js');

describe('Multi-Agent Debate (Phase 16 - AlphaCode Verification)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should force a rewrite if The Optimizer detects O(N^2) nested structures', async () => {
    // ROUND 1: Proposer writes O(N^2) bad code, Optimizer rejects, Skeptic rejects
    GeminiAiService.generateContent
      // Round 1 Proposer
      .mockResolvedValueOnce(
        `
function findDuplicates(arr1, arr2) {
    let matches = [];
    for(let i=0; i<arr1.length; i++) {
        for(let j=0; j<arr2.length; j++) {
            if (arr1[i] === arr2[j]) matches.push(arr1[i]);
        }
    }
    return matches;
}
            `,
      )
      // Round 1 Optimizer
      .mockResolvedValueOnce(
        `This is an O(N^2) double-nested loop trap. Convert arr2 to a Set to achieve O(N) lookups.`,
      )
      // Round 1 Skeptic
      .mockResolvedValueOnce(
        `Add input validation. What if arr1 or arr2 is null?`,
      )

      // ROUND 2: Proposer writes O(N) optimal code, Optimizer APPROVES, Skeptic APPROVES
      .mockResolvedValueOnce(
        `
function findDuplicates(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
    const lookup = new Set(arr2);
    return arr1.filter(item => lookup.has(item));
}
            `,
      )
      .mockResolvedValueOnce('APPROVE')
      .mockResolvedValueOnce('APPROVE');

    // Mock the AST parsing structural complexity
    // (Round 1 = highly nested (complexity 3), Round 2 = flat (complexity 1))
    astService.calculateComplexity
      .mockReturnValueOnce(3)
      .mockReturnValueOnce(1);

    const result = await debateService.converge(
      'Write a function to find items in arr1 that exist in arr2 (intersection).',
    );

    // It should take 6 Gemini calls (Proposer, Opt, Skep) * 2 rounds
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(6);

    // Assert AST was used to analyze the structural complexity
    expect(astService.calculateComplexity).toHaveBeenCalledTimes(2);

    expect(result.consensus).toBe(true);
    expect(result.rounds).toBe(2);

    // Assert the final code contains the O(N) Set implementation and input validation
    expect(result.code).toContain('new Set');
    expect(result.code).toContain('Array.isArray');
  });

  it('should immediately approve if the initial draft is absolutely flawless', async () => {
    // ROUND 1: Flawless O(1) response
    GeminiAiService.generateContent
      // Proposer
      .mockResolvedValueOnce(
        `
function isEven(num) {
    if (typeof num !== 'number') throw new TypeError('Must be a number');
    return num % 2 === 0;
}
            `,
      )
      // Optimizer
      .mockResolvedValueOnce('APPROVE')
      // Skeptic
      .mockResolvedValueOnce('APPROVE');

    astService.calculateComplexity.mockReturnValue(2); // Simple if statement

    const result = await debateService.converge(
      'Write a secure, flawless function to check if a number is even.',
    );

    // 3 calls, 1 round
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(3);
    expect(result.consensus).toBe(true);
    expect(result.rounds).toBe(1);
  });
});
