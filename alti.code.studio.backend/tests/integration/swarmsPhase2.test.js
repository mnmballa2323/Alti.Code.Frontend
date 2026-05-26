import { test, expect } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { RagSwarmAgent } from '../../src/app/modules/agents/ragSwarm.agent.js';
import { IntegrationSwarmAgent } from '../../src/app/modules/agents/integrationSwarm.agent.js';

test('Swarm Phase 2 Registration Nexus: Registry Alignment', () => {
  // 1. Assert master swarm agents exist in AgentRegistry
  expect(agentRegistry.get('ragSwarm')).toBeDefined();
  expect(agentRegistry.get('integrationSwarm')).toBeDefined();

  // 2. Assert micro-agents exist
  expect(agentRegistry.get('ragDocumentChunker')).toBeDefined();
  expect(agentRegistry.get('ragEmbeddingGenerator')).toBeDefined();
  expect(agentRegistry.get('ragVectorSearcher')).toBeDefined();
  
  expect(agentRegistry.get('integrationStripeRouter')).toBeDefined();
  expect(agentRegistry.get('integrationSlackNotifier')).toBeDefined();
  expect(agentRegistry.get('integrationGithubHook')).toBeDefined();
});

test('RagSwarm: Command Ingestion & Triage Routing', async () => {
  const master = new RagSwarmAgent();

  // Route document chunker splitting
  const chunkRes = await master._invoke('chunk this raw markdown text', {});
  expect(chunkRes).toContain('ragDocumentChunker Split Summary');
  expect(chunkRes).toContain('Chunk Strategy:** Semantic layout parser.');

  // Route embedding generation vectorization
  const embedRes = await master._invoke('embed these paragraph blocks', {});
  expect(embedRes).toContain('ragEmbeddingGenerator Vector Matrix');
  expect(embedRes).toContain('Vector Dimensions:** 768 dimensions.');

  // Route similarity vector searches
  const searchRes = await master._invoke('search similarity context inside vector store', {});
  expect(searchRes).toContain('ragVectorSearcher Match Results');
  expect(searchRes).toContain('Target Vector Store:** Qdrant.');
});

test('IntegrationSwarm: Payments & Webhook Broadcast Pipelines', async () => {
  const master = new IntegrationSwarmAgent();

  // Route Stripe checkout creations
  const stripeRes = await master._invoke('create stripe checkout session', {});
  expect(stripeRes).toContain('integrationStripeRouter Ingestion Summary');
  expect(stripeRes).toContain('Session Check:** Secure. Stripe signature');

  // Route Slack notifications broadcasts
  const slackRes = await master._invoke('broadcast slack alert notification', {});
  expect(slackRes).toContain('integrationSlackNotifier Webhook Report');
  expect(slackRes).toContain('Webhook Target:** #ops-alerts channel.');

  // Route GitHub webhook subscriptions
  const githubRes = await master._invoke('configure github repository webhook', {});
  expect(githubRes).toContain('integrationGithubHook Setup Audit');
  expect(githubRes).toContain('Target Repository:** HKUDS/CLI-Anything.');
});
