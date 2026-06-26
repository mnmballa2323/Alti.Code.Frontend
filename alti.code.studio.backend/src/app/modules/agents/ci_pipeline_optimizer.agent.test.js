import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../gemini/gemini.service.js', () => {
  return {
    GeminiAiService: {
      generateContent: vi.fn(),
    },
  };
});

import { ciPipelineOptimizerAgent } from './ci_pipeline_optimizer.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('CiPipelineOptimizerAgent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ciPipelineOptimizerAgent.resetMetrics();
  });

  it('should initialize with correct name, description, and preamble', () => {
    expect(ciPipelineOptimizerAgent.name).toBe('Ci_Pipeline_Optimizer_Agent');
    expect(ciPipelineOptimizerAgent.description).toContain(
      'CI/CD Workflow & Build Pipeline Optimizer Specialist',
    );
    expect(ciPipelineOptimizerAgent.preamble).toContain(
      'CI/CD WORKFLOW & BUILD PIPELINE OPTIMIZER',
    );
  });

  it('should successfully consult the LLM with context and prompt', async () => {
    const mockResponse =
      'Audit Report: GitHub Actions workflow lacks caching for npm packages. Generated optimized yaml using actions/cache.';
    GeminiAiService.generateContent.mockResolvedValue(mockResponse);

    const prompt = 'Optimize build pipeline caching';
    const context = [];

    const result = await ciPipelineOptimizerAgent.consult(prompt, context);

    expect(result.agent).toBe('Ci_Pipeline_Optimizer_Agent');
    expect(result.content).toBe(mockResponse);
    expect(result.type).toBe('text');
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
    expect(generatedPrompt).toContain(
      'CI/CD WORKFLOW & BUILD PIPELINE OPTIMIZER',
    );
    expect(generatedPrompt).toContain('Optimize build pipeline caching');
  });

  it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
    GeminiAiService.generateContent
      .mockRejectedValueOnce(new Error('Transient API gateway fail'))
      .mockResolvedValueOnce('Pipeline successfully optimized on retry');

    const result = await ciPipelineOptimizerAgent.consult(
      'Scan Dockerfile layers for cache caching',
      [],
    );

    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('Pipeline successfully optimized on retry');
  });
});
