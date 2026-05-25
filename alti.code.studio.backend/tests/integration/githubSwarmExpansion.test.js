import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { githubDocsService } from '../../src/app/modules/githubDocs/githubDocs.service.js';
import { GeminiAiService } from '../../src/app/modules/gemini/gemini.service.js';

import { pluginInstance as githubExpert } from '../../src/app/modules/agents/plugins/github_expert.agent.js';
import { pluginInstance as githubActions } from '../../src/app/modules/agents/plugins/github_actions.agent.js';
import { pluginInstance as githubApp } from '../../src/app/modules/agents/plugins/github_app.agent.js';
import { pluginInstance as githubProjects } from '../../src/app/modules/agents/plugins/github_projects.agent.js';

import { pluginInstance as githubEnterprise } from '../../src/app/modules/agents/plugins/github_enterprise.agent.js';
import { pluginInstance as githubPackages } from '../../src/app/modules/agents/plugins/github_packages.agent.js';
import { pluginInstance as githubGist } from '../../src/app/modules/agents/plugins/github_gist.agent.js';
import { pluginInstance as githubCopilot } from '../../src/app/modules/agents/plugins/github_copilot.agent.js';

describe('GitHub Swarm 8-Node Ecosystem Expansion Integration', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should declare valid BaseSpecialist schemas for all 8 Swarm agents', () => {
        const swarmList = [
            { instance: githubExpert, id: 'githubExpert', caps: ['github-documentation', 'github-api', 'github-actions', 'github-cli'] },
            { instance: githubActions, id: 'githubActionsSpecialist', caps: ['github-actions-workflow', 'github-actions-runner', 'github-custom-actions', 'ci-cd-optimization'] },
            { instance: githubApp, id: 'githubAppAuditor', caps: ['github-apps', 'github-oauth', 'github-webhooks', 'github-security-audit'] },
            { instance: githubProjects, id: 'githubProjectsManager', caps: ['github-projects-v2', 'github-discussions', 'github-issues-management', 'github-collaboration-docs'] },
            { instance: githubEnterprise, id: 'githubEnterpriseAuditor', caps: ['github-enterprise-governance', 'github-saml-sso', 'github-audit-logs', 'github-policies'] },
            { instance: githubPackages, id: 'githubPackagesRegistry', caps: ['github-packages', 'github-container-registry', 'package-deployment', 'container-security'] },
            { instance: githubGist, id: 'githubGistDeveloper', caps: ['github-gists', 'github-gists-api', 'scratchpad-snippets', 'gist-collaboration'] },
            { instance: githubCopilot, id: 'githubCopilotEngineer', caps: ['github-copilot-extensions', 'github-copilot-skills', 'copilot-token-management', 'chat-schemas'] }
        ];

        for (const item of swarmList) {
            expect(item.instance).toBeDefined();
            expect(item.instance.name).toBe(item.id);
            expect(item.instance.manifest).toBeDefined();
            expect(item.instance.manifest.id).toBe(item.id);
            expect(item.instance.manifest.capabilities).toEqual(expect.arrayContaining(item.caps));
        }
    });

    it('should dynamically register all 8 Swarm specialists on dynamic scan bootstrap', async () => {
        agentRegistry.pluginsLoaded = false;
        await agentRegistry.loadPlugins();

        const ids = [
            'githubExpert',
            'githubActionsSpecialist',
            'githubAppAuditor',
            'githubProjectsManager',
            'githubEnterpriseAuditor',
            'githubPackagesRegistry',
            'githubGistDeveloper',
            'githubCopilotEngineer'
        ];

        for (const id of ids) {
            const registered = agentRegistry.get(id);
            expect(registered).toBeDefined();
            expect(registered.name).toBe(id);
            expect(registered.isPlugin).toBe(true);
            expect(registered.instance).toBeDefined();
        }
    });

    it('should execute grounded RAG lookups across all 8 swarm specialists', async () => {
        const swarmList = [
            { instance: githubExpert, query: 'gh issue list --label bug', mockDoc: 'GitHub CLI docs' },
            { instance: githubActions, query: 'setup concurrency limits in yaml', mockDoc: 'Actions concurrency docs' },
            { instance: githubApp, query: 'verify GITHUB_WEBHOOK_SECRET', mockDoc: 'App cryptographic verify' },
            { instance: githubProjects, query: 'configure codeowners reviewers', mockDoc: 'Governance CODEOWNERS' },
            { instance: githubEnterprise, query: 'enforce SAML SSO policies', mockDoc: 'Enterprise SAML/SCIM SSO configs' },
            { instance: githubPackages, query: 'publish npm to ghcr.io', mockDoc: 'Packages ghcr container publishing' },
            { instance: githubGist, query: 'create secret gist scratchpad', mockDoc: 'Gist multi-file api specs' },
            { instance: githubCopilot, query: 'build Copilot chat extension signature', mockDoc: 'Copilot conversational jwt handshake' }
        ];

        for (const item of swarmList) {
            const searchDocsSpy = vi
                .spyOn(githubDocsService, 'searchDocs')
                .mockResolvedValue(item.mockDoc);

            const generateContentSpy = vi
                .spyOn(GeminiAiService, 'generateContent')
                .mockResolvedValue('Mocked response from model');

            const result = await item.instance.consult(item.query, []);

            expect(searchDocsSpy).toHaveBeenCalled();
            expect(generateContentSpy).toHaveBeenCalled();
            
            const promptPassedToAi = generateContentSpy.mock.calls[0][0];
            expect(promptPassedToAi).toContain(item.mockDoc);
            expect(promptPassedToAi).toContain(item.query);
            expect(result.agent).toBe(item.instance.name);
            expect(result.content).toBe('Mocked response from model');

            // Reset mocks for next agent loop
            searchDocsSpy.mockRestore();
            generateContentSpy.mockRestore();
        }
    });

    it('should route queries semantically using the expanded dispatchQueryToSwarm router', async () => {
        const queryRoutes = [
            { query: 'how do I build an action runner?', expectedAgent: 'githubActionsSpecialist' },
            { query: 'generate security token scopes oauth client', expectedAgent: 'githubAppAuditor' },
            { query: 'manage projects board issues and discussions', expectedAgent: 'githubProjectsManager' },
            { query: 'enforce scim sso access-control settings policies on organization', expectedAgent: 'githubEnterpriseAuditor' },
            { query: 'deploy package container to registry using ghcr', expectedAgent: 'githubPackagesRegistry' },
            { query: 'create public multi-file gist snippet embed', expectedAgent: 'githubGistDeveloper' },
            { query: 'register a copilot custom chat extension and verify JWT', expectedAgent: 'githubCopilotEngineer' },
            { query: 'general query on pull request reviews and branches', expectedAgent: 'githubExpert' }
        ];

        const primaryAgents = [
            { name: 'githubExpert', isPlugin: true, capabilities: ['github-documentation', 'github-api', 'github-actions', 'github-cli'] },
            { name: 'githubActionsSpecialist', isPlugin: true, capabilities: ['github-actions-workflow', 'github-actions-runner', 'github-custom-actions', 'ci-cd-optimization'] },
            { name: 'githubAppAuditor', isPlugin: true, capabilities: ['github-apps', 'github-oauth', 'github-webhooks', 'github-security-audit'] },
            { name: 'githubProjectsManager', isPlugin: true, capabilities: ['github-projects-v2', 'github-discussions', 'github-issues-management', 'github-collaboration-docs'] },
            { name: 'githubEnterpriseAuditor', isPlugin: true, capabilities: ['github-enterprise-governance', 'github-saml-sso', 'github-audit-logs', 'github-policies'] },
            { name: 'githubPackagesRegistry', isPlugin: true, capabilities: ['github-packages', 'github-container-registry', 'package-deployment', 'container-security'] },
            { name: 'githubGistDeveloper', isPlugin: true, capabilities: ['github-gists', 'github-gists-api', 'scratchpad-snippets', 'gist-collaboration'] },
            { name: 'githubCopilotEngineer', isPlugin: true, capabilities: ['github-copilot-extensions', 'github-copilot-skills', 'copilot-token-management', 'chat-schemas'] }
        ];

        const listSpy = vi.spyOn(agentRegistry, 'list').mockReturnValue(primaryAgents);

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

        listSpy.mockRestore();
        searchDocsSpy.mockRestore();
        generateContentSpy.mockRestore();
    });
});
