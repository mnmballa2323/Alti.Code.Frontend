import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const API_DIR = path.join(DEFINITIONS_DIR, 'api');

describe('Modular API Protocols, Gateway Architectures & Communication Systems Swarm Router Integration', () => {
  describe('Recursive Declarative YAML Parsing & Ingestion', () => {
    it('should successfully parse and load GraphQL Federation & Supergraph Architect', async () => {
      const agentPath = path.join(API_DIR, 'api.graphql.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.api.graphql');
      expect(def.name).toBe('GraphQL Federation & Supergraph Architect');
      expect(def.capabilities).toContain(
        'graphql_federation_supergraph_routing',
      );
      expect(def.capabilities).toContain('apollo_router_traffic_shaping');
    });

    it('should successfully parse and load gRPC & ProtoBuf Interface Optimizer', async () => {
      const agentPath = path.join(API_DIR, 'api.grpc.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.api.grpc');
      expect(def.name).toBe('gRPC & ProtoBuf Interface Optimizer');
      expect(def.capabilities).toContain('grpc_protobuf_binary_serialization');
      expect(def.capabilities).toContain(
        'proto_contract_backwards_compatibility',
      );
    });

    it('should successfully parse and load WebSockets & Real-Time Sync Coordinator', async () => {
      const agentPath = path.join(API_DIR, 'api.websocket.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.api.websocket');
      expect(def.name).toBe('WebSockets & Real-Time Sync Coordinator');
      expect(def.capabilities).toContain(
        'websocket_connection_heartbeat_tuning',
      );
      expect(def.capabilities).toContain('socketio_horizontal_scaling_redis');
    });

    it('should successfully parse and load OpenAPI Contract & Schema Enforcer', async () => {
      const agentPath = path.join(API_DIR, 'api.openapi.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.api.openapi');
      expect(def.name).toBe('OpenAPI Contract & Schema Enforcer');
      expect(def.capabilities).toContain(
        'openapi_contract_validation_assertions',
      );
      expect(def.capabilities).toContain('swagger_spec_linting_standards');
    });

    it('should successfully parse and load Apache Kafka Event-Driven Architect', async () => {
      const agentPath = path.join(API_DIR, 'api.kafka.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.api.kafka');
      expect(def.name).toBe('Apache Kafka Event-Driven Architect');
      expect(def.capabilities).toContain('kafka_partition_key_rebalancing');
      expect(def.capabilities).toContain('exactly_once_transactional_streams');
    });

    it('should successfully parse and load RabbitMQ AMQP Broker Specialist', async () => {
      const agentPath = path.join(API_DIR, 'api.rabbitmq.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.api.rabbitmq');
      expect(def.name).toBe('RabbitMQ AMQP Broker Specialist');
      expect(def.capabilities).toContain('amqp_exchange_routing_bindings');
      expect(def.capabilities).toContain('consumer_prefetch_limit_tuning');
    });

    it('should successfully parse and load APIs Gateway Policy Controller', async () => {
      const agentPath = path.join(API_DIR, 'api.gateway.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.api.gateway');
      expect(def.name).toBe('APIs Gateway Policy Controller');
      expect(def.capabilities).toContain('api_gateway_request_transformations');
      expect(def.capabilities).toContain('custom_gateway_lua_plugins');
    });

    it('should successfully parse and load JSON-RPC & XML-RPC Protocol Specialist', async () => {
      const agentPath = path.join(API_DIR, 'api.rpc.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.api.rpc');
      expect(def.name).toBe('JSON-RPC & XML-RPC Protocol Specialist');
      expect(def.capabilities).toContain('rpc_request_batching_payloads');
      expect(def.capabilities).toContain('jsonrpc_error_code_standards');
    });

    it('should successfully parse and load tRPC Type-Safe Contract Coordinator', async () => {
      const agentPath = path.join(API_DIR, 'api.trpc.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.api.trpc');
      expect(def.name).toBe('tRPC Type-Safe Contract Coordinator');
      expect(def.capabilities).toContain('trpc_client_server_type_propagation');
      expect(def.capabilities).toContain('trpc_context_router_mappings');
    });

    it('should successfully parse and load WebRTC Peer-to-Peer & SFU Engine Specialist', async () => {
      const agentPath = path.join(API_DIR, 'api.webrtc.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.api.webrtc');
      expect(def.name).toBe('WebRTC Peer-to-Peer & SFU Engine Specialist');
      expect(def.capabilities).toContain('webrtc_signaling_ice_negotiations');
      expect(def.capabilities).toContain('sfu_selective_routing_topologies');
    });
  });

  describe('Precision Swarm Routing for All 10 API & Communication Gateway Agents', () => {
    it('should route GraphQL keywords to GraphQL Federation & Supergraph Architect agent', async () => {
      const output =
        'Compile graphql_federation_supergraph_routing models and analyze subgraph_schema_entity_resolution requirements';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('API Swarm: GraphQL Federation');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('GraphQL Federation & Supergraph Architect');
    });

    it('should route gRPC keywords to gRPC & ProtoBuf Interface Optimizer agent', async () => {
      const output =
        'Perform grpc_protobuf_binary_serialization parsing and tune http2_multiplexed_stream_tuning variables';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('API Swarm: gRPC & ProtoBuf');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('gRPC & ProtoBuf Interface Optimizer');
    });

    it('should route WebSockets keywords to WebSockets & Real-Time Sync Coordinator agent', async () => {
      const output =
        'Tweak websocket_connection_heartbeat_tuning parameters and verify socketio_horizontal_scaling_redis scaling policies';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('API Swarm: Real-Time WebSockets');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('WebSockets & Real-Time Sync Coordinator');
    });

    it('should route OpenAPI keywords to OpenAPI Contract & Schema Enforcer agent', async () => {
      const output =
        'Assert openapi_contract_validation_assertions matches and enforce swagger_spec_linting_standards checks';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('API Swarm: OpenAPI Specs & Contract Tests');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('OpenAPI Contract & Schema Enforcer');
    });

    it('should route Kafka keywords to Apache Kafka Event-Driven Architect agent', async () => {
      const output =
        'Rebalance kafka_partition_key_rebalancing keys and configure exactly_once_transactional_streams pipelines';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('API Swarm: Kafka Event Streaming');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Apache Kafka Event-Driven Architect');
    });

    it('should route RabbitMQ keywords to RabbitMQ AMQP Broker Specialist agent', async () => {
      const output =
        'Bind amqp_exchange_routing_bindings channels and verify consumer_prefetch_limit_tuning profiles';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('API Swarm: RabbitMQ Messaging');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('RabbitMQ AMQP Broker Specialist');
    });

    it('should route Gateway keywords to APIs Gateway Policy Controller agent', async () => {
      const output =
        'Perform api_gateway_request_transformations rewrites and check custom_gateway_lua_plugins bindings';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('API Swarm: APIs Gateways & Policies');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('APIs Gateway Policy Controller');
    });

    it('should route RPC keywords to JSON-RPC & XML-RPC Protocol Specialist agent', async () => {
      const output =
        'Verify rpc_request_batching_payloads schemas and inspect jsonrpc_error_code_standards definitions';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('API Swarm: JSON-RPC & XML-RPC Protocols');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('JSON-RPC & XML-RPC Protocol Specialist');
    });

    it('should route tRPC keywords to tRPC Type-Safe Contract Coordinator agent', async () => {
      const output =
        'Verify trpc_client_server_type_propagation models and check trpc_context_router_mappings handlers';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('API Swarm: tRPC Type-Safe Contracts');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('tRPC Type-Safe Contract Coordinator');
    });

    it('should route WebRTC keywords to WebRTC Peer-to-Peer & SFU Engine Specialist agent', async () => {
      const output =
        'Optimize webrtc_signaling_ice_negotiations connection and calibrate sfu_selective_routing_topologies topologies';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('API Swarm: WebRTC Peer-to-Peer & SFU Channels');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('WebRTC Peer-to-Peer & SFU Engine Specialist');
    });
  });
});
