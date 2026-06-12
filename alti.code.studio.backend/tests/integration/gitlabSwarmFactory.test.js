import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { gitlabDocsService } from '../../src/app/modules/gitlabDocs/gitlabDocs.service.js';
import { GeminiAiService } from '../../src/app/modules/gemini/gemini.service.js';
import {
  gitlabSwarmFactory,
  GITLAB_SPECIALISTS_TAXONOMY,
} from '../../src/app/modules/agents/gitlab_swarm_factory.js';
import fs from 'fs/promises';
import path from 'path';

describe('GitLab Swarm Factory & 60 Specialists Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should declare a robust taxonomy of exactly 60 granular specialized agents', () => {
    expect(GITLAB_SPECIALISTS_TAXONOMY).toBeDefined();
    expect(GITLAB_SPECIALISTS_TAXONOMY.length).toBe(60);

    // Verify some select sample agents in the taxonomy database
    const expectedIds = [
      'gitlabProjectCreator',
      'gitlabProjectDeleter',
      'gitlabMrCreator',
      'gitlabMrMerger',
      'gitlabPipelineTrigger',
      'gitlabPipelineScheduler',
      'gitlabRunnerProvisioner',
      'gitlabRunnerVerifier',
      'gitlabIssueCreator',
      'gitlabTimeTracker',
      'gitlabMilestoneTracker',
      'gitlabIterationCadencesManager',
      'gitlabPushRulesManager',
      'gitlabPackagesRegistryManager',
      'gitlabContainerRegistryManager',
      'gitlabSnippetsCreator',
      'gitlabGeoNodesManager',
      'gitlabUserCustomAttributesManager',
      'gitlabSystemHooksManager',
      'gitlabInstanceOAuthApplicationsManager',
    ];

    for (const id of expectedIds) {
      const match = GITLAB_SPECIALISTS_TAXONOMY.find(spec => spec.id === id);
      expect(match).toBeDefined();
      expect(match.capabilities.length).toBeGreaterThan(0);
      expect(match.focus).toBeDefined();
    }
  });

  it('should programmatically compile and write all 60 specialized dynamic agent files', async () => {
    // Execute the swarm factory generator
    const totalCompiled = await gitlabSwarmFactory.generateAllSpecialists();
    expect(totalCompiled).toBe(60);

    // Check if a sample of written files actually exists on disk
    const sampleFiles = [
      'gitlab_fn_gitlabProjectCreator.agent.js',
      'gitlab_fn_gitlabMrMerger.agent.js',
      'gitlab_fn_gitlabPipelineScheduler.agent.js',
      'gitlab_fn_gitlabInstanceOAuthApplicationsManager.agent.js',
    ];

    const pluginsDir = path.join(
      process.cwd(),
      'src/app/modules/agents/plugins',
    );
    for (const file of sampleFiles) {
      const filePath = path.join(pluginsDir, file);
      const stats = await fs.stat(filePath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(500); // Should be a valid code file
    }
  });

  it('should dynamically scan and register all 60 compiled agents into the Nexus registry', async () => {
    agentRegistry.pluginsLoaded = false;
    await agentRegistry.loadPlugins();

    // Sample of registered dynamic agents
    const sampleIds = [
      'gitlabProjectCreator',
      'gitlabMrMerger',
      'gitlabPipelineScheduler',
      'gitlabInstanceOAuthApplicationsManager',
    ];

    for (const id of sampleIds) {
      const registered = agentRegistry.get(id);
      expect(registered).toBeDefined();
      expect(registered.name).toBe(id);
      expect(registered.isPlugin).toBe(true);
      expect(registered.instance).toBeDefined();
    }
  });

  it('should route queries semantically using the dispatchQueryToSwarm router', async () => {
    const queryRoutes = [
      {
        query: 'Create a new project template for the gitlab group',
        expectedAgent: 'gitlabProjectCreator',
      },
      {
        query: 'Merge this merge request and squash commits',
        expectedAgent: 'gitlabMrMerger',
      },
      {
        query: 'Register a new self-hosted gitlab runner on this instance',
        expectedAgent: 'gitlabRunnerProvisioner',
      },
      {
        query: 'Create a new pipeline schedule on cron daily',
        expectedAgent: 'gitlabPipelineScheduler',
      },
      {
        query: 'Create a new instance oauth application client configuration',
        expectedAgent: 'gitlabInstanceOAuthApplicationsManager',
      },
    ];

    const searchDocsSpy = vi
      .spyOn(gitlabDocsService, 'searchDocs')
      .mockResolvedValue('Mocked documentation context');

    const generateContentSpy = vi
      .spyOn(GeminiAiService, 'generateContent')
      .mockResolvedValue('Mocked Swarm specialist synthesis');

    for (const item of queryRoutes) {
      const result = await gitlabDocsService.dispatchQueryToSwarm(item.query);
      expect(result.agent).toBe(item.expectedAgent);
      expect(result.content).toBe('Mocked Swarm specialist synthesis');
    }

    searchDocsSpy.mockRestore();
    generateContentSpy.mockRestore();
  });
});
