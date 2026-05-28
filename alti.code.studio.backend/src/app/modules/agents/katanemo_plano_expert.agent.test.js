import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define the custom mock factory before imports
vi.mock('../gemini/gemini.service.js', () => {
    return {
        GeminiAiService: {
            generateContent: vi.fn()
        }
    };
});

// Import after the mock is established
import { katanemoPlanoExpertAgent } from './katanemo_plano_expert.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('KatanemoPlanoExpertAgent Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        katanemoPlanoExpertAgent.resetMetrics();
    });

    it('should initialize with correct name, description, and preamble', () => {
        expect(katanemoPlanoExpertAgent.name).toBe('Katanemo_Plano_Expert');
        expect(katanemoPlanoExpertAgent.description).toContain('katanemo/plano, the AI-native data plane');
        expect(katanemoPlanoExpertAgent.preamble).toContain('AI-Native Proxy & Data Plane Specialist');
    });

    it('should successfully consult the LLM with context and prompt', async () => {
        const mockResponse = 'Plano: Routing nested agent reasoning steps to sidecar.';
        GeminiAiService.generateContent.mockResolvedValue(mockResponse);

        const prompt = 'Setup sidecar config';
        const context = [];

        const result = await katanemoPlanoExpertAgent.consult(prompt, context);

        expect(result.agent).toBe('Katanemo_Plano_Expert');
        expect(result.content).toBe(mockResponse);
        expect(result.type).toBe('text');
        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

        const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
        expect(generatedPrompt).toContain('katanemo/plano');
        expect(generatedPrompt).toContain('Setup sidecar config');
    });

    it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
        GeminiAiService.generateContent
            .mockRejectedValueOnce(new Error('Transient API error'))
            .mockResolvedValueOnce('Successfully recovered on retry');

        const result = await katanemoPlanoExpertAgent.consult('Trace A2A handover', []);

        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
        expect(result.content).toBe('Successfully recovered on retry');
    });
});
