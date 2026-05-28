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
import { submoduleSentinelAgent } from './submodule_sentinel.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('SubmoduleSentinelAgent Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        submoduleSentinelAgent.resetMetrics();
    });

    it('should initialize with correct name, description, and preamble', () => {
        expect(submoduleSentinelAgent.name).toBe('Submodule_Sentinel_Agent');
        expect(submoduleSentinelAgent.description).toContain('Submodule Sentinel and Cross-Repository Consistency Specialist');
        expect(submoduleSentinelAgent.preamble).toContain('Submodule Sentinel & Cross-Repo Consistency Specialist');
    });

    it('should successfully consult the LLM with context and prompt', async () => {
        const mockResponse = 'Audit Results: All submodules are 100% synchronized.';
        GeminiAiService.generateContent.mockResolvedValue(mockResponse);

        const prompt = 'Check submodule sync state';
        const context = [{ path: '.gitmodules', content: '[submodule "submodules/ruflo"]\npath = submodules/ruflo' }];

        const result = await submoduleSentinelAgent.consult(prompt, context);

        expect(result.agent).toBe('Submodule_Sentinel_Agent');
        expect(result.content).toBe(mockResponse);
        expect(result.type).toBe('text');
        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

        // Verify the prompt passed to Gemini contains the preamble, context, and user request
        const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
        expect(generatedPrompt).toContain('Submodule Sentinel & Cross-Repo Consistency Specialist');
        expect(generatedPrompt).toContain('[FILE: .gitmodules]');
        expect(generatedPrompt).toContain('Check submodule sync state');
    });

    it('should report code_block type if output contains markdown code backticks', async () => {
        const mockResponse = 'Here is the fix:\n```bash\ngit submodule update --init --recursive\n```';
        GeminiAiService.generateContent.mockResolvedValue(mockResponse);

        const result = await submoduleSentinelAgent.consult('How to sync submodules?', []);

        expect(result.type).toBe('code_block');
        expect(result.content).toBe(mockResponse);
    });

    it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
        GeminiAiService.generateContent
            .mockRejectedValueOnce(new Error('Transient Rate Limit Error'))
            .mockResolvedValueOnce('Successfully recovered on attempt 2');

        const result = await submoduleSentinelAgent.consult('Scan licenses', []);

        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
        expect(result.content).toBe('Successfully recovered on attempt 2');
    });
});
