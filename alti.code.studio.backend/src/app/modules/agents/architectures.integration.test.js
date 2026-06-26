import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const ARCHITECTURES_DIR = path.join(DEFINITIONS_DIR, 'architectures');

describe('Modular Software Architecture & Distributed Systems Declarative Agents & Swarm Router Integration', () => {
  describe('Recursive Declarative YAML Parsing & Ingestion', () => {
    it('should successfully parse and load the CQRS & Event Sourcing agent', async () => {
      const yamlPath = path.join(ARCHITECTURES_DIR, 'arch.cqrs.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.architecture.cqrs');
      expect(def.name).toBe('CQRS & Event Sourcing Architect');
      expect(def.capabilities).toContain('cqrs_read_write_segregation');
    });

    it('should successfully parse and load the Microservices Coordinator agent', async () => {
      const yamlPath = path.join(
        ARCHITECTURES_DIR,
        'arch.microservices.agent.yaml',
      );
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.architecture.microservices');
      expect(def.name).toBe(
        'Choreographed & Orchestrated Microservices Coordinator',
      );
      expect(def.capabilities).toContain('saga_transaction_coordination');
    });

    it('should successfully parse and load the Event-Driven Specialist agent', async () => {
      const yamlPath = path.join(
        ARCHITECTURES_DIR,
        'arch.event_driven.agent.yaml',
      );
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.architecture.event_driven');
      expect(def.name).toBe(
        'Event-Driven Architecture & Message Broker Specialist',
      );
      expect(def.capabilities).toContain('message_broker_topology');
    });

    it('should successfully parse and load the Serverless Architect agent', async () => {
      const yamlPath = path.join(
        ARCHITECTURES_DIR,
        'arch.serverless.agent.yaml',
      );
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.architecture.serverless');
      expect(def.name).toBe(
        'Serverless Micro-Mesh & Cloud Workflows Architect',
      );
      expect(def.capabilities).toContain('faas_concurrency_sizing');
    });

    it('should successfully parse and load the Distributed Caching Architect agent', async () => {
      const yamlPath = path.join(ARCHITECTURES_DIR, 'arch.caching.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.architecture.caching');
      expect(def.name).toBe('Multi-Tier Distributed Caching Architect');
      expect(def.capabilities).toContain('cache_access_topologies');
    });

    it('should successfully parse and load the Databases Specialist agent', async () => {
      const yamlPath = path.join(
        ARCHITECTURES_DIR,
        'arch.databases.agent.yaml',
      );
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.architecture.databases');
      expect(def.name).toBe(
        'Distributed Database Sharding & Replication Specialist',
      );
      expect(def.capabilities).toContain('database_sharding_keys');
    });

    it('should successfully parse and load the Hybrid Cloud Architect agent', async () => {
      const yamlPath = path.join(
        ARCHITECTURES_DIR,
        'arch.hybrid_cloud.agent.yaml',
      );
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.architecture.hybrid_cloud');
      expect(def.name).toBe('Hybrid & Multi-Cloud Infrastructure Architect');
      expect(def.capabilities).toContain('hybrid_interconnect_vpn');
    });

    it('should successfully parse and load the SRE Chaos Engineer agent', async () => {
      const yamlPath = path.join(
        ARCHITECTURES_DIR,
        'arch.resilience.agent.yaml',
      );
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.architecture.resilience');
      expect(def.name).toBe(
        'Site Reliability & High-Availability Chaos Engineer',
      );
      expect(def.capabilities).toContain('circuit_breaker_states');
    });

    it('should successfully parse and load the Observability APM Architect agent', async () => {
      const yamlPath = path.join(
        ARCHITECTURES_DIR,
        'arch.observability.agent.yaml',
      );
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.architecture.observability');
      expect(def.name).toBe('Observability & OpenTelemetry APM Architect');
      expect(def.capabilities).toContain('telemetry_tracing_propagation');
    });

    it('should successfully parse and load the Real-Time Collaboration agent', async () => {
      const yamlPath = path.join(ARCHITECTURES_DIR, 'arch.realtime.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.architecture.realtime');
      expect(def.name).toBe(
        'Real-Time WebSockets & CRDT Collaboration Specialist',
      );
      expect(def.capabilities).toContain('websocket_sfu_connections');
    });
  });

  describe('Precision Swarm Routing for Distributed System Architectures', () => {
    it('should route cqrs_read_write_segregation keywords to CQRS architect', async () => {
      const output =
        'Perform cqrs_read_write_segregation paths and synchronize event_store_replay maps';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Architecture Swarm: CQRS & Event Sourcing',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('CQRS & Event Sourcing Architect');
    });

    it('should route saga_transaction_coordination keywords to microservices coordinator', async () => {
      const output =
        'Orchestrate saga_transaction_coordination across endpoints and configure api_gateway_mesh_routing paths';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Architecture Swarm: Microservices Coordination',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Choreographed & Orchestrated Microservices Coordinator',
      );
    });

    it('should route message_broker_topology keywords to event-driven broker specialist', async () => {
      const output =
        'Configure message_broker_topology queues and handle dlq_retry_backoff_opt logic';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Architecture Swarm: Event-Driven Broker Mesh',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Event-Driven Architecture & Message Broker Specialist',
      );
    });

    it('should route faas_concurrency_sizing keywords to serverless architect', async () => {
      const output =
        'Optimize faas_concurrency_sizing and design stateful_workflow_dsl handlers';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Architecture Swarm: Serverless Workflows',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Serverless Micro-Mesh & Cloud Workflows Architect',
      );
    });

    it('should route cache_access_topologies keywords to distributed caching architect', async () => {
      const output =
        'Configure cache_access_topologies and scale redis_cluster_scaling blocks';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced Architecture Swarm: Distributed Caching');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Multi-Tier Distributed Caching Architect');
    });

    it('should route database_sharding_keys keywords to sharding replication specialist', async () => {
      const output =
        'Define database_sharding_keys and troubleshoot replication_lag_mitigation delay';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Architecture Swarm: Database Sharding & Replication',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Distributed Database Sharding & Replication Specialist',
      );
    });

    it('should route hybrid_interconnect_vpn keywords to hybrid cloud architect', async () => {
      const output =
        'Secure hybrid_interconnect_vpn routing and setup workload_identity_federation pools';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Architecture Swarm: Hybrid & Multi-Cloud',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Hybrid & Multi-Cloud Infrastructure Architect',
      );
    });

    it('should route circuit_breaker_states keywords to HA chaos engineer', async () => {
      const output =
        'Monitor circuit_breaker_states counters and run chaos_injection_trials scans';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Architecture Swarm: SRE Resilience & Chaos',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Site Reliability & High-Availability Chaos Engineer',
      );
    });

    it('should route telemetry_tracing_propagation keywords to observability architect', async () => {
      const output =
        'Correlate telemetry_tracing_propagation headers and audit continuous_runtime_profiling metrics';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Architecture Swarm: Observability & OTel APM',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Observability & OpenTelemetry APM Architect');
    });

    it('should route websocket_sfu_connections keywords to realtime collaboration specialist', async () => {
      const output =
        'Handle websocket_sfu_connections states and synchronize crdt_state_sync changes';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Architecture Swarm: Real-Time WebSockets & CRDT',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Real-Time WebSockets & CRDT Collaboration Specialist',
      );
    });
  });
});
