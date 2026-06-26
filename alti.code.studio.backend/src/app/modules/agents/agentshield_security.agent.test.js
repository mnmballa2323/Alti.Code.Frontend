import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../gemini/gemini.service.js', () => {
  return {
    GeminiAiService: {
      generateContent: vi.fn(),
    },
  };
});

import { agentshieldSecurityAgent } from './agentshield_security.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('AgentshieldSecurityAgent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    agentshieldSecurityAgent.resetMetrics();
  });

  it('should initialize with correct name, description, and preamble', () => {
    expect(agentshieldSecurityAgent.name).toBe('Agentshield_Security_Agent');
    expect(agentshieldSecurityAgent.description).toContain(
      'Zero-Trust IAM, Container, & Cloud Security Auditor Specialist',
    );
    expect(agentshieldSecurityAgent.preamble).toContain(
      'ZERO-TRUST CONTAINER, IAM, & CLOUD SECURITY AUDITOR',
    );
  });

  it('should successfully consult the LLM with context and prompt', async () => {
    const mockResponse =
      'Audit Report: Dockerfile passes non-root checks. IAM Role has optimal PoLP mappings.';
    GeminiAiService.generateContent.mockResolvedValue(mockResponse);

    const prompt = 'Audit docker container execution boundary';
    const context = [];

    const result = await agentshieldSecurityAgent.consult(prompt, context);

    expect(result.agent).toBe('Agentshield_Security_Agent');
    expect(result.content).toBe(mockResponse);
    expect(result.type).toBe('text');
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
    expect(generatedPrompt).toContain(
      'ZERO-TRUST CONTAINER, IAM, & CLOUD SECURITY AUDITOR',
    );
    expect(generatedPrompt).toContain(
      'Audit docker container execution boundary',
    );
  });

  it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
    GeminiAiService.generateContent
      .mockRejectedValueOnce(new Error('Transient network error'))
      .mockResolvedValueOnce('Security Audit recovered on retry');

    const result = await agentshieldSecurityAgent.consult(
      'Scan IAM configurations',
      [],
    );

    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('Security Audit recovered on retry');
  });
});
