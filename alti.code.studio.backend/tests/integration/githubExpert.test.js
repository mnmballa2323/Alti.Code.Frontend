import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { githubDocsService } from '../../src/app/modules/githubDocs/githubDocs.service.js';
import { GeminiAiService } from '../../src/app/modules/gemini/gemini.service.js';
import { pluginInstance } from '../../src/app/modules/agents/plugins/github_expert.agent.js';

describe('GitHub Expert Specialist Agent & Swarm Integration', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should declare a valid BaseSpecialist schema and capability manifest', () => {
        expect(pluginInstance).toBeDefined();
        expect(pluginInstance.name).toBe('githubExpert');
        expect(pluginInstance.description).toContain('GitHub Expert Specialist');
        expect(pluginInstance.manifest).toBeDefined();
        expect(pluginInstance.manifest.id).toBe('githubExpert');
        expect(pluginInstance.manifest.version).toBe('39.1.0');
        expect(pluginInstance.manifest.capabilities).toEqual(
            expect.arrayContaining(['github-documentation', 'github-api', 'github-actions', 'github-cli'])
        );
    });

    it('should be dynamically scannable and registered as a Swarm plugin', async () => {
        // Reset the loaded flag to allow rescanning
        agentRegistry.pluginsLoaded = false;
        
        await agentRegistry.loadPlugins();

        const registeredAgent = agentRegistry.get('githubExpert');
        expect(registeredAgent).toBeDefined();
        expect(registeredAgent.name).toBe('githubExpert');
        expect(registeredAgent.version).toBe('39.1.0');
        expect(registeredAgent.isPlugin).toBe(true);
        expect(registeredAgent.capabilities).toEqual(
            expect.arrayContaining(['github-documentation', 'github-api', 'github-actions', 'github-cli'])
        );
    });

    it('should ground consultations in ingested developer documentation via RAG service', async () => {
        const query = 'How do I authenticate a GitHub CLI session?';
        const mockDocContent = 'Use the command: "gh auth login" to authenticate with your GitHub account.';
        const mockAiResponse = 'To authenticate your session, execute: `gh auth login` in your terminal.';

        // Spy and mock the searchDocs method
        const searchDocsSpy = vi
            .spyOn(githubDocsService, 'searchDocs')
            .mockResolvedValue(mockDocContent);

        // Spy and mock the Gemini AI generation method
        const generateContentSpy = vi
            .spyOn(GeminiAiService, 'generateContent')
            .mockResolvedValue(mockAiResponse);

        // Call the public hardened consult method inherited from BaseSpecialistAgent
        const result = await pluginInstance.consult(query, []);

        // Assert RAG lookup occurred with correct parameters
        expect(searchDocsSpy).toHaveBeenCalledWith(query, 5);

        // Assert Gemini call incorporated the dynamically retrieved document context
        expect(generateContentSpy).toHaveBeenCalled();
        const generatedPromptArg = generateContentSpy.mock.calls[0][0];
        expect(generatedPromptArg).toContain('=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===');
        expect(generatedPromptArg).toContain(mockDocContent);
        expect(generatedPromptArg).toContain(query);

        // Assert returned object adheres to standardized telemetry wrapper rules
        expect(result).toHaveProperty('agent', 'githubExpert');
        expect(result).toHaveProperty('confidence');
        expect(parseFloat(result.confidence)).toBeGreaterThanOrEqual(0.92);
        expect(result).toHaveProperty('type', 'text');
        expect(result).toHaveProperty('content', mockAiResponse);
        expect(result).toHaveProperty('execution_time_ms');
        expect(typeof result.execution_time_ms).toBe('number');
    });

    it('should gracefully handle RAG failures and continue with fallback context', async () => {
        const query = 'Create a simple GitHub Actions workflow';
        const mockAiResponse = 'Here is your workflow: name: simple';

        // Mock searchDocs to throw an error (simulating failure/timeout in vector DB)
        vi.spyOn(githubDocsService, 'searchDocs').mockRejectedValue(new Error('Vector search offline'));

        const generateContentSpy = vi
            .spyOn(GeminiAiService, 'generateContent')
            .mockResolvedValue(mockAiResponse);

        // Execute consult - should not crash, but fallback gracefully
        const result = await pluginInstance.consult(query, []);

        expect(result.content).toBe(mockAiResponse);
        expect(generateContentSpy).toHaveBeenCalled();
        const generatedPromptArg = generateContentSpy.mock.calls[0][0];
        expect(generatedPromptArg).toContain('No documentation found in local RAG vector store.');
    });
});
