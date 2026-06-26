import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adversarialReviewerService } from './adversarial_reviewer.service.js';
import { aiProvider } from '../ai/ai.provider.js';

vi.mock('../ai/ai.provider.js', () => ({
  aiProvider: {
    reason: vi.fn(),
  },
}));

describe('AdversarialReviewerService Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reach unanimous consensus to APPROVE when both agents approve', async () => {
    // Mock responses for Red-Team, then Blue-Team
    aiProvider.reason
      .mockResolvedValueOnce(
        JSON.stringify({ vote: 'APPROVE', reasoning: 'Looks very secure.' }),
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          vote: 'APPROVE',
          reasoning: 'Code is very clean and meets styles.',
        }),
      );

    const result = await adversarialReviewerService.conductReview({
      file: 'src/main.js',
      patchCode: 'const x = 5;',
      originalCode: 'const x = 4;',
      errorLog: '',
    });

    expect(result.success).toBe(true);
    expect(result.finalOutcome).toBe('APPROVE');
    expect(result.consensusReached).toBe(true);
    expect(result.debateLogs.length).toBe(2);
    expect(result.debateLogs[0].vote).toBe('APPROVE');
    expect(result.debateLogs[1].vote).toBe('APPROVE');
  });

  it('should reach unanimous consensus to REJECT when both agents reject', async () => {
    aiProvider.reason
      .mockResolvedValueOnce(
        JSON.stringify({ vote: 'REJECT', reasoning: 'Vulnerable to SQLi.' }),
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          vote: 'REJECT',
          reasoning: 'Highly unreadable formatting.',
        }),
      );

    const result = await adversarialReviewerService.conductReview({
      file: 'src/db.js',
      patchCode: 'query("SELECT * FROM user WHERE id = " + input)',
      originalCode: '',
      errorLog: '',
    });

    expect(result.success).toBe(false);
    expect(result.finalOutcome).toBe('REJECT');
    expect(result.consensusReached).toBe(true);
    expect(result.debateLogs[0].vote).toBe('REJECT');
    expect(result.debateLogs[1].vote).toBe('REJECT');
  });

  it('should trigger debate/arbitration and resolve split decisions', async () => {
    // Red-Team rejects, Blue-Team approves, Arbitrator decides to APPROVE
    aiProvider.reason
      .mockResolvedValueOnce(
        JSON.stringify({
          vote: 'REJECT',
          reasoning: 'Slight risk of memory leaks.',
        }),
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          vote: 'APPROVE',
          reasoning: 'Abstractions look fantastic.',
        }),
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          consensusReached: true,
          finalOutcome: 'APPROVE',
          arbitrationReasoning:
            'Risk of memory leak is minimal, the design improvements outweigh it.',
        }),
      );

    const result = await adversarialReviewerService.conductReview({
      file: 'src/helper.js',
      patchCode: 'const cache = new Map();',
      originalCode: '',
      errorLog: '',
    });

    expect(result.success).toBe(true);
    expect(result.finalOutcome).toBe('APPROVE');
    expect(result.consensusReached).toBe(true);
    expect(result.debateLogs.length).toBe(3); // Red-Team, Blue-Team, and Arbitrator
    expect(result.debateLogs[2].agent).toBe('Arbitrator');
    expect(result.debateLogs[2].vote).toBe('APPROVE');
  });
});
