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
import { performanceAuditorAgent } from './performance_auditor.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('PerformanceAuditorAgent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performanceAuditorAgent.resetMetrics();
  });

  it('should initialize with correct name, description, and preamble', () => {
    expect(performanceAuditorAgent.name).toBe('Performance_Auditor_Agent');
    expect(performanceAuditorAgent.description).toContain(
      'Performance Bottleneck Auditor & Log Profiler Specialist',
    );
    expect(performanceAuditorAgent.preamble).toContain(
      'Performance Bottleneck Auditor & Log Profiler Specialist',
    );
  });

  it('should successfully consult the LLM with context and prompt', async () => {
    const mockResponse =
      'Big-O Analysis: The nested loop is quadratic O(N^2) and can be reduced to O(N) using a Map lookup.';
    GeminiAiService.generateContent.mockResolvedValue(mockResponse);

    const prompt = 'Optimize nested array search';
    const context = [];

    const result = await performanceAuditorAgent.consult(prompt, context);

    expect(result.agent).toBe('Performance_Auditor_Agent');
    expect(result.content).toBe(mockResponse);
    expect(result.type).toBe('text');
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
    expect(generatedPrompt).toContain(
      'Performance Bottleneck Auditor & Log Profiler Specialist',
    );
    expect(generatedPrompt).toContain('Optimize nested array search');
  });

  it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
    GeminiAiService.generateContent
      .mockRejectedValueOnce(new Error('Transient API error'))
      .mockResolvedValueOnce('Successfully recovered on retry');

    const result = await performanceAuditorAgent.consult(
      'Analyze memory heap leaks',
      [],
    );

    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('Successfully recovered on retry');
  });
});
