import { test, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { AuthSwarmAgent } from '../../src/app/modules/agents/authSwarm.agent.js';
import { TelemetrySwarmAgent } from '../../src/app/modules/agents/telemetrySwarm.agent.js';
import { DatabaseSwarmAgent } from '../../src/app/modules/agents/databaseSwarm.agent.js';
import { DevopsSwarmAgent } from '../../src/app/modules/agents/devopsSwarm.agent.js';
import { ScaffoldAgent } from '../../src/app/modules/agents/scaffoldAgent.js';

const CUSTOM_DIR = path.resolve(__dirname, '../../src/app/modules/agents/custom');

beforeAll(async () => {
  // Ensure custom directory exists for scaffoldAgent disk writes
  try {
    await fs.mkdir(CUSTOM_DIR, { recursive: true });
  } catch (e) {
    // Exists
  }
});

afterAll(async () => {
  // Clean up any dynamically scaffolded files during testing to avoid dirty git workspace
  try {
    const files = await fs.readdir(CUSTOM_DIR);
    for (const file of files) {
      if (file.startsWith('testagent_') || file.includes('dynamicscaffolded')) {
        await fs.rm(path.join(CUSTOM_DIR, file), { force: true });
      }
    }
  } catch (e) {
    // Ignore cleanup errors
  }
});

test('Swarm Registration Nexus: Registry Alignment', () => {
  // 1. Assert master swarm agents exist in AgentRegistry
  expect(agentRegistry.get('authSwarm')).toBeDefined();
  expect(agentRegistry.get('telemetrySwarm')).toBeDefined();
  expect(agentRegistry.get('databaseSwarm')).toBeDefined();
  expect(agentRegistry.get('devopsSwarm')).toBeDefined();
  expect(agentRegistry.get('scaffoldAgent')).toBeDefined();

  // 2. Assert micro-agents exist
  expect(agentRegistry.get('authVulnerabilityScanner')).toBeDefined();
  expect(agentRegistry.get('telemetryMetricsParser')).toBeDefined();
  expect(agentRegistry.get('databaseQueryAuditor')).toBeDefined();
  expect(agentRegistry.get('devopsPipelineGenerator')).toBeDefined();
});

test('AuthSwarm: Command Routing & Triage', async () => {
  const master = new AuthSwarmAgent();

  // Route session scanning query to scanner micro-agent
  const scanRes = await master._invoke('scan token fixation and leakages in cookies', {});
  expect(scanRes).toContain('authVulnerabilityScanner Report');
  expect(scanRes).toContain('Session Fixation Check:** Secure.');

  // Route policy check to validator micro-agent
  const policyRes = await master._invoke('verify policy for JWT scopes', {});
  expect(policyRes).toContain('authPolicyValidator Claims Audit');
  expect(policyRes).toContain('Required Claims:** iss, sub');

  // Route MFA risk-assessment challenge to orchestrator micro-agent
  const mfaRes = await master._invoke('orchestrate adaptive MFA risk calculations', {});
  expect(mfaRes).toContain('authMfaOrchestrator Decision Engine');
  expect(mfaRes).toContain('Risk Score:** Low');
});

test('TelemetrySwarm: Metrics Aggregation & Diagnostics', async () => {
  const master = new TelemetrySwarmAgent();

  // Route Prometheus logs query
  const metricsRes = await master._invoke('parse Prometheus logs and OpenTelemetry metrics streams', {});
  expect(metricsRes).toContain('telemetryMetricsParser Live Diagnostics');
  expect(metricsRes).toContain('Active Spans Count:** 14');

  // Route latency anomaly scan
  const latencyRes = await master._invoke('analyze latency anomalies and CPU benchmarks', {});
  expect(latencyRes).toContain('telemetryAnomalyDetector Incident Scanner');
  expect(latencyRes).toContain('Latency P99 Status:** 42ms');

  // Route alerting configuration rule synthesis
  const alertRes = await master._invoke('design alerting rules thresholds in Sentry', {});
  expect(alertRes).toContain('telemetryAlertingArchitect Scaffolder');
  expect(alertRes).toContain('alert: HighResponseLatency');
});

test('DatabaseSwarm: Index Optimization & Schema Engineering', async () => {
  const master = new DatabaseSwarmAgent();

  // Route slow query explain audit
  const queryRes = await master._invoke('audit explain query index missing', {});
  expect(queryRes).toContain('databaseQueryAuditor Audit Results');
  expect(queryRes).toContain('CREATE UNIQUE INDEX CONCURRENTLY');

  // Route Prisma schema migrations modeling
  const schemaRes = await master._invoke('model prisma database schema relations', {});
  expect(schemaRes).toContain('databaseSchemaArchitect Blueprint');
  expect(schemaRes).toContain('model Session');

  // Route Redis keyspace invalidation swept cache keys
  const cacheRes = await master._invoke('evict stale redis cache keys', {});
  expect(cacheRes).toContain('databaseCacheJanitor Metrics Summary');
  expect(cacheRes).toContain('Cache Hit Ratio:** 94.2%');
});

test('DevopsSwarm: CI/CD Workflows & SLA Self-Healing', async () => {
  const master = new DevopsSwarmAgent();

  // Route Docker Slsa synthesis
  const pipelineRes = await master._invoke('generate github actions docker pipeline workflow', {});
  expect(pipelineRes).toContain('devopsPipelineGenerator Generated Manifest');
  expect(pipelineRes).toContain('FROM node:20-alpine AS builder');

  // Route automated rollback triggers
  const rollbackRes = await master._invoke('trigger autonomous SLA rollback loop', {});
  expect(rollbackRes).toContain('devopsRollbackOrchestrator Healing Report');
  expect(rollbackRes).toContain('Reverting deployment hash to previous tagged stable version');
});

test('ScaffoldAgent: Code Generation & Disk Serialization', async () => {
  const scaffolder = new ScaffoldAgent();
  
  // 1. Assert template code contains valid ESM exports and self-registration hooks
  const name = 'testagent_securityauditor';
  const description = 'Dynamic audit agent';
  const capabilities = ['sec-scan', 'pci-dss'];
  
  const generatedCode = scaffolder.generateTemplate(name, description, capabilities);
  expect(generatedCode).toContain(`export class Testagent_securityauditorAgent extends BaseSpecialistAgent`);
  expect(generatedCode).toContain(`this.name = '${name}'`);
  expect(generatedCode).toContain(`queue: '${name}-queue'`);
  expect(generatedCode).toContain(`capabilities: ["sec-scan","pci-dss"]`);

  // 2. Invoke prompt with 'write' instruction to save on disk
  const diskPrompt = `scaffold name testagent_dynamicsave on disk`;
  const resultText = await scaffolder._invoke(diskPrompt, {});
  
  expect(resultText).toContain('scaffoldAgent Successfully generated and saved agent code!');
  
  // Validate that the file is actually written inside /custom/
  const customFilePath = path.join(CUSTOM_DIR, 'testagent_dynamicsave.agent.js');
  const fileExists = await fs.access(customFilePath).then(() => true).catch(() => false);
  expect(fileExists).toBe(true);

  const savedContent = await fs.readFile(customFilePath, 'utf8');
  expect(savedContent).toContain("this.name = 'testagent_dynamicsave'");
});
