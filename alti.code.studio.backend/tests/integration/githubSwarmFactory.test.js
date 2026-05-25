import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { githubDocsService } from '../../src/app/modules/githubDocs/githubDocs.service.js';
import { GeminiAiService } from '../../src/app/modules/gemini/gemini.service.js';
import { githubSwarmFactory, GITHUB_SPECIALISTS_TAXONOMY } from '../../src/app/modules/agents/github_swarm_factory.js';
import fs from 'fs/promises';
import path from 'path';

describe('GitHub Swarm Factory & 120+ Specialists Integration', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should declare a robust taxonomy of exactly 120 granular specialized agents', () => {
        expect(GITHUB_SPECIALISTS_TAXONOMY).toBeDefined();
        expect(GITHUB_SPECIALISTS_TAXONOMY.length).toBe(120);

        // Verify some select sample agents in the taxonomy database
        const expectedIds = [
            'githubRepoCreator',
            'githubBranchProtector',
            'githubCodeownersAdmin',
            'githubPrMerger',
            'githubActionsSecretsManager',
            'githubAppWebhookVerifier',
            'githubProjectsStatusAutomator',
            'githubEnterpriseAuditLogParser',
            'githubGistEmbedBuilder',
            'githubIssuesTriageManager',
            'githubSecurityDependabotAlertsPatcher',
            'githubCopilotSseStreamHandler',
            'githubAdminSeatAllocator'
        ];

        for (const id of expectedIds) {
            const match = GITHUB_SPECIALISTS_TAXONOMY.find(spec => spec.id === id);
            expect(match).toBeDefined();
            expect(match.capabilities.length).toBeGreaterThan(0);
            expect(match.focus).toBeDefined();
        }
    });

    it('should programmatically compile and write all 120 specialized dynamic agent files', async () => {
        // Execute the swarm factory generator
        const totalCompiled = await githubSwarmFactory.generateAllSpecialists();
        expect(totalCompiled).toBe(120);

        // Check if a sample of written files actually exists on disk
        const sampleFiles = [
            'github_fn_githubRepoCreator.agent.js',
            'github_fn_githubBranchProtector.agent.js',
            'github_fn_githubSecurityDependabotAlertsPatcher.agent.js',
            'github_fn_githubCopilotSseStreamHandler.agent.js'
        ];

        const pluginsDir = path.join(process.cwd(), 'src/app/modules/agents/plugins');
        for (const file of sampleFiles) {
            const filePath = path.join(pluginsDir, file);
            const stats = await fs.stat(filePath);
            expect(stats.isFile()).toBe(true);
            expect(stats.size).toBeGreaterThan(500); // Should be a valid code file
        }
    });

    it('should dynamically scan and register all 120 compiled agents into the Nexus registry', async () => {
        agentRegistry.pluginsLoaded = false;
        await agentRegistry.loadPlugins();

        // Sample of registered dynamic agents
        const sampleIds = [
            'githubRepoCreator',
            'githubBranchProtector',
            'githubSecurityDependabotAlertsPatcher',
            'githubCopilotSseStreamHandler'
        ];

        for (const id of sampleIds) {
            const registered = agentRegistry.get(id);
            expect(registered).toBeDefined();
            expect(registered.name).toBe(id);
            expect(registered.isPlugin).toBe(true);
            expect(registered.instance).toBeDefined();
        }
    });

    it('should precisely route queries semantically down to the granular specialist level', async () => {
        const queryRoutes = [
            { query: 'Create a new autolinks reference repository configuration', expectedAgent: 'githubAutolinksManager' },
            { query: 'How do I resolve dependabot alerts and apply package patches?', expectedAgent: 'githubSecurityDependabotAlertsPatcher' },
            { query: 'Orchestrate keyless OpenID Connect actions OIDC federation assumptions', expectedAgent: 'githubActionsOidcFederator' },
            { query: 'Configure enterprise SSH certificate authority signatures CA rules', expectedAgent: 'githubEnterpriseSshCaAdmin' },
            { query: 'Scaffold custom copilot extension chat API endpoints', expectedAgent: 'githubCopilotExtensionBuilder' },
            { query: 'Trigger actions repository secret sweeps decrypt key', expectedAgent: 'githubActionsSecretsManager' }
        ];

        const searchDocsSpy = vi
            .spyOn(githubDocsService, 'searchDocs')
            .mockResolvedValue('Mocked documentation context');

        const generateContentSpy = vi
            .spyOn(GeminiAiService, 'generateContent')
            .mockResolvedValue('Mocked Swarm specialist synthesis');

        for (const item of queryRoutes) {
            const result = await githubDocsService.dispatchQueryToSwarm(item.query);
            expect(result.agent).toBe(item.expectedAgent);
            expect(result.content).toBe('Mocked Swarm specialist synthesis');
        }

        searchDocsSpy.mockRestore();
        generateContentSpy.mockRestore();
    });
});
