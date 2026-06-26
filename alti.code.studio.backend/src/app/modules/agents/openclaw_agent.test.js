import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openClawAgent } from './openclaw.agent.js';
import { openclawProxyService } from '../openclaw/openclaw.proxy.service.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { neuromorphicHermesAgent } from './neuromorphic_hermes.agent.js';
import { SkillOptService } from '../skillopt/skillopt.service.js';

vi.mock('../openclaw/openclaw.proxy.service.js', () => {
  return {
    openclawProxyService: {
      delegateToLocalHost: vi.fn(),
    },
  };
});

vi.mock('../gemini/gemini.service.js', () => {
  return {
    GeminiAiService: {
      generateContent: vi.fn(),
    },
  };
});

vi.mock('./neuromorphic_hermes.agent.js', () => {
  return {
    neuromorphicHermesAgent: {
      _invoke: vi.fn().mockResolvedValue('Socratic counter-proposal for host.'),
    },
  };
});

vi.mock('../skillopt/skillopt.service.js', () => {
  return {
    SkillOptService: {
      registerSuccess: vi.fn().mockResolvedValue(true),
    },
  };
});

describe('OpenClawAgent Operations with Socratic Self-Healing & DB Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute successfully on standard local host tunnel delegation', async () => {
    GeminiAiService.generateContent.mockResolvedValueOnce('Fetch Jira ticket');
    openclawProxyService.delegateToLocalHost.mockResolvedValueOnce(
      'stdout test results',
    );

    const result = await openClawAgent._invoke('goal text', 'context block');

    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);
    expect(openclawProxyService.delegateToLocalHost).toHaveBeenCalledWith(
      'Fetch Jira ticket',
      expect.any(String),
    );
    expect(result).toContain('SUCCESS');
    expect(result).toContain('stdout test results');
  });

  it('should trigger local socratic debate & self-healing when execution fails, evolve intent, register success in DB, and succeed on retry', async () => {
    GeminiAiService.generateContent
      // First: Translate goal
      .mockResolvedValueOnce('Fetch Jira ticket')
      // Second: Healed intent synthesis
      .mockResolvedValueOnce('Corrected fetch Jira ticket');

    openclawProxyService.delegateToLocalHost
      // First attempt: Throws error
      .mockRejectedValueOnce(new Error('Network error or connection lost'))
      // Second attempt: Succeeds
      .mockResolvedValueOnce('stdout corrected success');

    const result = await openClawAgent._invoke('goal text', 'context block');

    // Verify socratic debate triggers
    expect(neuromorphicHermesAgent._invoke).toHaveBeenCalledTimes(1);
    expect(neuromorphicHermesAgent._invoke).toHaveBeenCalledWith(
      expect.stringContaining('Network error or connection lost'),
      expect.any(String),
    );

    // Verify LLM calls (1 for base translation + 1 for healing)
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(GeminiAiService.generateContent).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('Socratic Debate Recommendation'),
    );

    // Verify delegation calls (attempt 1 failed, attempt 2 succeeded)
    expect(openclawProxyService.delegateToLocalHost).toHaveBeenCalledTimes(2);
    expect(openclawProxyService.delegateToLocalHost).toHaveBeenNthCalledWith(
      1,
      'Fetch Jira ticket',
      expect.any(String),
    );
    expect(openclawProxyService.delegateToLocalHost).toHaveBeenNthCalledWith(
      2,
      'Corrected fetch Jira ticket',
      expect.any(String),
    );

    // Wait brief tick for async DB save
    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify database sync trigger
    expect(SkillOptService.registerSuccess).toHaveBeenCalledWith(
      'OpenClawAgent',
      'goal text',
      'Corrected fetch Jira ticket',
    );

    expect(result).toContain('SUCCESS');
    expect(result).toContain('stdout corrected success');
  });
});
