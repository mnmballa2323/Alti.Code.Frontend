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
import { ntegrals10xExpertAgent } from './ntegrals_10x_expert.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('Ntegrals10xExpertAgent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ntegrals10xExpertAgent.resetMetrics();
  });

  it('should initialize with correct name, description, and preamble', () => {
    expect(ntegrals10xExpertAgent.name).toBe('Ntegrals_10x_Expert');
    expect(ntegrals10xExpertAgent.description).toContain(
      'ntegrals/10x multi-step AI coding powers',
    );
    expect(ntegrals10xExpertAgent.preamble).toContain('multi-step superpowers');
  });

  it('should successfully consult the LLM with context and prompt', async () => {
    const mockResponse =
      '10x: Generating iterative self-correcting terminal loop.';
    GeminiAiService.generateContent.mockResolvedValue(mockResponse);

    const prompt = 'Run test loop';
    const context = [];

    const result = await ntegrals10xExpertAgent.consult(prompt, context);

    expect(result.agent).toBe('Ntegrals_10x_Expert');
    expect(result.content).toBe(mockResponse);
    expect(result.type).toBe('text');
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
    expect(generatedPrompt).toContain('ntegrals/10x');
    expect(generatedPrompt).toContain('Run test loop');
  });

  it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
    GeminiAiService.generateContent
      .mockRejectedValueOnce(new Error('Transient API error'))
      .mockResolvedValueOnce('Successfully recovered on retry');

    const result = await ntegrals10xExpertAgent.consult(
      'Generate TS client',
      [],
    );

    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('Successfully recovered on retry');
  });
});
