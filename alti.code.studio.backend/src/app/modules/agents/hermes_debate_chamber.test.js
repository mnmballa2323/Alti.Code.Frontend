import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hermesDebateChamberService } from './hermes_debate_chamber.service.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { hermesAgent } from './hermes.agent.js';

vi.mock('../gemini/gemini.service.js', () => {
  return {
    GeminiAiService: {
      generateContent: vi.fn(),
    },
  };
});

vi.mock('./hermes.agent.js', () => {
  return {
    hermesAgent: {
      executeTask: vi.fn(),
    },
  };
});

describe('Hermes Adversarial Debate Chamber Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully run the adversarial debate pipeline and synthesize refined consensus', async () => {
    // 1. Mock Beta (SRE Pragmatist) Critique response
    GeminiAiService.generateContent.mockImplementation(async prompt => {
      if (prompt.includes('You are GAMMA')) {
        return 'Gamma Consensus Spec:\n1. Postgres for ACID metadata.\n2. Redis Sentinel for HA caching.\n3. Custom lock rotation pattern.';
      } else if (prompt.includes('You are BETA')) {
        return 'Beta SRE Critique: Ensure Redis cache clusters failover automatically and enable strict transactional locks.';
      }
      return 'Fallback response';
    });

    // 2. Mock Hermes Agent execution task response (or fallback)
    hermesAgent.executeTask.mockResolvedValue(
      'Hermes Code Audit: Identified race condition in redis.multi pipeline. Standardize transactional locks.',
    );

    // 3. Initiate the debate
    const objective = 'Build high-performance session token rotation';
    const initialDesign = {
      db: 'Postgres',
      cache: 'Redis',
      flow: 'Rotate key sliding window',
    };

    const result = await hermesDebateChamberService.initiateDebate(
      objective,
      initialDesign,
    );

    // 4. Assertions
    expect(result).toContain('Gamma Consensus Spec');
    expect(result).toContain('Postgres for ACID metadata');
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(hermesAgent.executeTask).toHaveBeenCalledTimes(1);
  });

  it('should fall back gracefully if the local Hermes CLI execution throws an error', async () => {
    // Mock Beta response
    GeminiAiService.generateContent.mockImplementation(async prompt => {
      if (prompt.includes('You are GAMMA')) {
        return 'Gamma final spec';
      } else if (prompt.includes('You are BETA')) {
        return 'Beta Critique';
      } else if (prompt.includes('You are HERMES')) {
        return 'Hermes fallback audit response';
      }
      return 'Fallback';
    });

    // Mock hermesAgent.executeTask to throw an error
    hermesAgent.executeTask.mockRejectedValue(
      new Error('CLI python executable not found in path'),
    );

    const objective = 'Sample objective';
    const initialDesign = 'Initial design doc';

    const result = await hermesDebateChamberService.initiateDebate(
      objective,
      initialDesign,
    );

    expect(result).toBe('Gamma final spec');
    // Calling Beta (1), Hermes fallback (1), Gamma (1)
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(3);
    expect(hermesAgent.executeTask).toHaveBeenCalled();
  });
});
