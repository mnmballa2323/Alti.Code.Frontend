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
import { mnfstManifestExpertAgent } from './mnfst_manifest_expert.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('MnfstManifestExpertAgent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mnfstManifestExpertAgent.resetMetrics();
  });

  it('should initialize with correct name, description, and preamble', () => {
    expect(mnfstManifestExpertAgent.name).toBe('Mnfst_Manifest_Expert');
    expect(mnfstManifestExpertAgent.description).toContain(
      'mnfst/manifest, the definition-first TypeScript framework',
    );
    expect(mnfstManifestExpertAgent.preamble).toContain(
      'Definition-First Backend Generation',
    );
  });

  it('should successfully consult the LLM with context and prompt', async () => {
    const mockResponse =
      'Manifest: Compiling postgres schema and custom form dashboards.';
    GeminiAiService.generateContent.mockResolvedValue(mockResponse);

    const prompt = 'Create schema for book store';
    const context = [];

    const result = await mnfstManifestExpertAgent.consult(prompt, context);

    expect(result.agent).toBe('Mnfst_Manifest_Expert');
    expect(result.content).toBe(mockResponse);
    expect(result.type).toBe('text');
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
    expect(generatedPrompt).toContain('mnfst/manifest');
    expect(generatedPrompt).toContain('Create schema for book store');
  });

  it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
    GeminiAiService.generateContent
      .mockRejectedValueOnce(new Error('Transient API error'))
      .mockResolvedValueOnce('Successfully recovered on retry');

    const result = await mnfstManifestExpertAgent.consult('Sync db tables', []);

    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('Successfully recovered on retry');
  });
});
