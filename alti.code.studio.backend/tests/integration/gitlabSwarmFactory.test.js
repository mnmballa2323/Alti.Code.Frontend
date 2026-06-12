import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { gitlabDocsService } from '../../src/app/modules/gitlabDocs/gitlabDocs.service.js';
import { GeminiAiService } from '../../src/app/modules/gemini/gemini.service.js';
import {
  gitlabSwarmFactory,
  GITLAB_SPECIALISTS_TAXONOMY,
} from '../../src/app/modules/agents/gitlab_swarm_factory.js';
import { vectorStoreService } from '../../src/app/modules/memory/vector.store.js';
import { GoogleGenAiService } from '../../src/app/modules/googleGenAi/googleGenAi.service.js';
import fs from 'fs/promises';
import path from 'path';

describe('GitLab Swarm Factory & 61 Specialists Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should declare a robust taxonomy of exactly 61 granular specialized agents', () => {
    expect(GITLAB_SPECIALISTS_TAXONOMY).toBeDefined();
    expect(GITLAB_SPECIALISTS_TAXONOMY.length).toBe(61);

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

  it('should programmatically compile and write all 61 specialized dynamic agent files', async () => {
    // Execute the swarm factory generator
    const totalCompiled = await gitlabSwarmFactory.generateAllSpecialists();
    expect(totalCompiled).toBe(61);

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

  it('should dynamically scan and register all 61 compiled agents into the Nexus registry', async () => {
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

    const vectorSearchSpy = vi
      .spyOn(vectorStoreService, 'search')
      .mockResolvedValue({ documents: [], metadatas: [], ids: [], distances: [] });

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

    vectorSearchSpy.mockRestore();
    searchDocsSpy.mockRestore();
    generateContentSpy.mockRestore();
  });

  it('should route using pgvector search short-circuit when distance is < 0.15', async () => {
    const vectorSearchSpy = vi.spyOn(vectorStoreService, 'search').mockResolvedValue({
      documents: [['Agent Name: gitlabProjectCreator\nDescription: Specialist GitLab Project Creator']],
      metadatas: [[{ agentId: 'gitlabProjectCreator' }]],
      ids: [['doc_1']],
      distances: [[0.10]]
    });

    const searchDocsSpy = vi.spyOn(gitlabDocsService, 'searchDocs').mockResolvedValue('Mocked docs');
    const generateContentSpy = vi.spyOn(GeminiAiService, 'generateContent').mockResolvedValue('Mocked response');

    const result = await gitlabDocsService.dispatchQueryToSwarm('create a new project');
    expect(result.agent).toBe('gitlabProjectCreator');
    
    vectorSearchSpy.mockRestore();
    searchDocsSpy.mockRestore();
    generateContentSpy.mockRestore();
  });

  it('should route using LLM reranker when pgvector distance is >= 0.15', async () => {
    const vectorSearchSpy = vi.spyOn(vectorStoreService, 'search').mockResolvedValue({
      documents: [
        [
          'Agent Name: gitlabProjectCreator\nDescription: Specialist GitLab Project Creator',
          'Agent Name: gitlabMrMerger\nDescription: Specialist GitLab MR Merger'
        ]
      ],
      metadatas: [[{ agentId: 'gitlabProjectCreator' }, { agentId: 'gitlabMrMerger' }]],
      ids: [['doc_1', 'doc_2']],
      distances: [[0.30, 0.40]]
    });

    const rerankSpy = vi.spyOn(GoogleGenAiService, 'generateContent').mockResolvedValue({
      content: '{ "agentId": "gitlabMrMerger" }'
    });

    const searchDocsSpy = vi.spyOn(gitlabDocsService, 'searchDocs').mockResolvedValue('Mocked docs');
    const generateContentSpy = vi.spyOn(GeminiAiService, 'generateContent').mockResolvedValue('Mocked response');

    const result = await gitlabDocsService.dispatchQueryToSwarm('merge this merge request');
    expect(result.agent).toBe('gitlabMrMerger');

    vectorSearchSpy.mockRestore();
    rerankSpy.mockRestore();
    searchDocsSpy.mockRestore();
    generateContentSpy.mockRestore();
  });
});
