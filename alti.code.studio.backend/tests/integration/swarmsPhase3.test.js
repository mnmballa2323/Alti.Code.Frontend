import { test, expect } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { GcpSwarmAgent } from '../../src/app/modules/agents/gcpSwarm.agent.js';

test('Swarm Phase 3 Registration Nexus: Registry Alignment', () => {
  // 1. Assert master swarm agents exist in AgentRegistry
  expect(agentRegistry.get('gcpSwarm')).toBeDefined();

  // 2. Assert micro-agents exist
  expect(agentRegistry.get('gcpStorageOptimizer')).toBeDefined();
  expect(agentRegistry.get('gcpPubSubBroker')).toBeDefined();
  expect(agentRegistry.get('gcpKmsGuardian')).toBeDefined();
});

test('GcpSwarm: Command Ingestion & Triage Routing', async () => {
  const master = new GcpSwarmAgent();

  // Route GCS bucket auditing
  const storageRes = await master._invoke('audit gcs bucket storage parameters', {});
  expect(storageRes).toContain('gcpStorageOptimizer GCS Audit');
  expect(storageRes).toContain('Signed URL Expiration:** Secured. Strict cap');

  // Route Pub/Sub topic queues topology
  const pubsubRes = await master._invoke('list pubsub topics and dead-letter subscriptions', {});
  expect(pubsubRes).toContain('gcpPubSubBroker Ingestion Topology');
  expect(pubsubRes).toContain('Ack Deadline:** Standardized at 10 seconds.');

  // Route KMS cryptokey FIPS standards audits
  const kmsRes = await master._invoke('inspect kms key rotation profiles FIPS compliant keyring', {});
  expect(kmsRes).toContain('gcpKmsGuardian Security Manifest');
  expect(kmsRes).toContain('Rotation Interval:** Enforced every 90 days.');
});
