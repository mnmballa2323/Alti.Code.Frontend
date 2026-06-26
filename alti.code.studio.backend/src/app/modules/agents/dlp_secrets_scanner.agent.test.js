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
import { dlpSecretsScannerAgent } from './dlp_secrets_scanner.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('DlpSecretsScannerAgent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dlpSecretsScannerAgent.resetMetrics();
  });

  it('should initialize with correct name, description, and preamble', () => {
    expect(dlpSecretsScannerAgent.name).toBe('Dlp_Secrets_Scanner_Agent');
    expect(dlpSecretsScannerAgent.description).toContain(
      'DLP & Hardened Secrets Scanner Specialist',
    );
    expect(dlpSecretsScannerAgent.preamble).toContain(
      'DLP & HARDENED SECRETS SCANNER SPECIALIST',
    );
  });

  it('should successfully consult the LLM with context and prompt', async () => {
    const mockResponse =
      '| Severity | Secret Type | File Path | Recommended Var |\n| High | AWS Secret | config.json | process.env.AWS_SECRET_KEY |';
    GeminiAiService.generateContent.mockResolvedValue(mockResponse);

    const prompt = 'Scan config.json for hardcoded secrets';
    const context = [];

    const result = await dlpSecretsScannerAgent.consult(prompt, context);

    expect(result.agent).toBe('Dlp_Secrets_Scanner_Agent');
    expect(result.content).toBe(mockResponse);
    expect(result.type).toBe('text');
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
    expect(generatedPrompt).toContain(
      'DLP & HARDENED SECRETS SCANNER SPECIALIST',
    );
    expect(generatedPrompt).toContain('Scan config.json for hardcoded secrets');
  });

  it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
    GeminiAiService.generateContent
      .mockRejectedValueOnce(new Error('Transient API error'))
      .mockResolvedValueOnce('Successfully recovered on retry');

    const result = await dlpSecretsScannerAgent.consult(
      'Scan git diff for credentials',
      [],
    );

    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('Successfully recovered on retry');
  });
});
