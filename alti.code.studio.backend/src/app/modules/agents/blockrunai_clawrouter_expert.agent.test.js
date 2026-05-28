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
import { blockrunaiClawrouterExpertAgent } from './blockrunai_clawrouter_expert.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('BlockRunAIClawRouterExpertAgent Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        blockrunaiClawrouterExpertAgent.resetMetrics();
    });

    it('should initialize with correct name, description, and preamble', () => {
        expect(blockrunaiClawrouterExpertAgent.name).toBe('BlockRunAI_ClawRouter_Expert');
        expect(blockrunaiClawrouterExpertAgent.description).toContain('BlockRunAI/ClawRouter, the agent-native cost-optimizing LLM proxy');
        expect(blockrunaiClawrouterExpertAgent.preamble).toContain('BlockRunAI/ClawRouter AI Proxy & Micropayments Specialist');
    });

    it('should successfully consult the LLM with context and prompt', async () => {
        const mockResponse = 'ClawRouter: Proxying request on port 8402 with pay-per-request signature.';
        GeminiAiService.generateContent.mockResolvedValue(mockResponse);

        const prompt = 'Proxy DeepSeek-R1 query';
        const context = [];

        const result = await blockrunaiClawrouterExpertAgent.consult(prompt, context);

        expect(result.agent).toBe('BlockRunAI_ClawRouter_Expert');
        expect(result.content).toBe(mockResponse);
        expect(result.type).toBe('text');
        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

        const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
        expect(generatedPrompt).toContain('BlockRunAI/ClawRouter');
        expect(generatedPrompt).toContain('Proxy DeepSeek-R1 query');
    });

    it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
        GeminiAiService.generateContent
            .mockRejectedValueOnce(new Error('Transient API error'))
            .mockResolvedValueOnce('Successfully recovered on retry');

        const result = await blockrunaiClawrouterExpertAgent.consult('Audit Base micropayments', []);

        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
        expect(result.content).toBe('Successfully recovered on retry');
    });
});
