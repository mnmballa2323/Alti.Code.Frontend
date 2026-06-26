import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define the custom mock factory before imports
vi.mock('../gemini/gemini.service.js', () => {
  return {
    GeminiAiService: {
      generateContent: vi.fn(),
    },
  };
});

// Import after the mock is established
import { apiContractAgent } from './api_contract.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('ApiContractAgent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiContractAgent.resetMetrics();
  });

  it('should initialize with correct name, description, and preamble', () => {
    expect(apiContractAgent.name).toBe('Api_Contract_Agent');
    expect(apiContractAgent.description).toContain(
      'API Contract & Integration SDK Specialist',
    );
    expect(apiContractAgent.preamble).toContain(
      'API CONTRACT & INTEGRATION SDK SPECIALIST',
    );
  });

  it('should successfully consult the LLM with context and prompt', async () => {
    const mockResponse =
      'Audit Report: Route /api/v1/auth/register has correct Joi validation schema. Dynamic SDK types generated successfully.';
    GeminiAiService.generateContent.mockResolvedValue(mockResponse);

    const prompt = 'Audit auth router payload validation';
    const context = [];

    const result = await apiContractAgent.consult(prompt, context);

    expect(result.agent).toBe('Api_Contract_Agent');
    expect(result.content).toBe(mockResponse);
    expect(result.type).toBe('text');
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
    expect(generatedPrompt).toContain(
      'API CONTRACT & INTEGRATION SDK SPECIALIST',
    );
    expect(generatedPrompt).toContain('Audit auth router payload validation');
  });

  it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
    GeminiAiService.generateContent
      .mockRejectedValueOnce(new Error('Transient API error'))
      .mockResolvedValueOnce('Successfully recovered on retry');

    const result = await apiContractAgent.consult(
      'Generate client SDK fetcher code',
      [],
    );

    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('Successfully recovered on retry');
  });
});
