import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const ALGORITHMS_DIR = path.join(DEFINITIONS_DIR, 'algorithms');

describe('Modular Algorithmic & Mathematics Declarative Agents & Swarm Router Integration', () => {
  describe('Recursive Declarative YAML Parsing & Ingestion', () => {
    it('should successfully parse and load the Distributed Consensus specialist', async () => {
      const yamlPath = path.join(ALGORITHMS_DIR, 'alg.consensus.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.algorithm.consensus');
      expect(def.name).toBe(
        'Distributed Consensus & Raft/Paxos Protocol Specialist',
      );
      expect(def.capabilities).toContain('consensus_raft_paxos');
    });

    it('should successfully parse and load the Graph Theory specialist', async () => {
      const yamlPath = path.join(ALGORITHMS_DIR, 'alg.graph.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.algorithm.graph');
      expect(def.name).toBe(
        'Graph Theory & Directed Acyclic Graph (DAG) Specialist',
      );
      expect(def.capabilities).toContain('dag_topological_sort');
    });

    it('should successfully parse and load the Lossless Compression specialist', async () => {
      const yamlPath = path.join(ALGORITHMS_DIR, 'alg.compression.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.algorithm.compression');
      expect(def.name).toBe(
        'Huffman & LZW Lossless Data Compression Specialist',
      );
      expect(def.capabilities).toContain('lossless_data_compression');
    });

    it('should successfully parse and load the AST Parser specialist', async () => {
      const yamlPath = path.join(ALGORITHMS_DIR, 'alg.ast_parser.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.algorithm.ast_parser');
      expect(def.name).toBe(
        'Abstract Syntax Tree (AST) & Lexer/Parser Specialist',
      );
      expect(def.capabilities).toContain('lexer_tokenization');
    });

    it('should successfully parse and load the Zero-Knowledge Cryptography specialist', async () => {
      const yamlPath = path.join(ALGORITHMS_DIR, 'alg.cryptography.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.algorithm.cryptography');
      expect(def.name).toBe(
        'Zero-Knowledge Proof & Cryptographic Protocol Specialist',
      );
      expect(def.capabilities).toContain('zero_knowledge_proofs');
    });

    it('should successfully parse and load the NP-Hard Optimization specialist', async () => {
      const yamlPath = path.join(ALGORITHMS_DIR, 'alg.optimization.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.algorithm.optimization');
      expect(def.name).toBe(
        'NP-Hard & Integer Linear Programming (ILP) Specialist',
      );
      expect(def.capabilities).toContain('integer_linear_programming');
    });

    it('should successfully parse and load the HNSW Geometry specialist', async () => {
      const yamlPath = path.join(ALGORITHMS_DIR, 'alg.geometry.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.algorithm.geometry');
      expect(def.name).toBe(
        'Vector Index HNSW & High-Dimensional Geometry Specialist',
      );
      expect(def.capabilities).toContain('hnsw_indexing');
    });

    it('should successfully parse and load the Consistent Hashing DHT specialist', async () => {
      const yamlPath = path.join(ALGORITHMS_DIR, 'alg.hashing.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.algorithm.hashing');
      expect(def.name).toBe(
        'Consistent Hashing & DHT Distributed Cache Specialist',
      );
      expect(def.capabilities).toContain('consistent_hashing');
    });

    it('should successfully parse and load the Time-Series Kalman Filter specialist', async () => {
      const yamlPath = path.join(ALGORITHMS_DIR, 'alg.timeseries.agent.yaml');
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.algorithm.timeseries');
      expect(def.name).toBe(
        'Time-Series Forecasting & Kalman Filter Specialist',
      );
      expect(def.capabilities).toContain('kalman_filtering');
    });

    it('should successfully parse and load the Storage Engine specialist', async () => {
      const yamlPath = path.join(
        ALGORITHMS_DIR,
        'alg.storage_engine.agent.yaml',
      );
      const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

      expect(def.id).toBe('agent.algorithm.storage_engine');
      expect(def.name).toBe('B-Tree & LSM-Tree Storage Engine Specialist');
      expect(def.capabilities).toContain('lsm_tree_storage');
    });
  });

  describe('Precision Swarm Routing for Algorithmic & Mathematical Specialists', () => {
    it('should route consensus_raft_paxos keywords to consensus specialist', async () => {
      const output =
        'Implement consensus_raft_paxos and paxos_protocol in a replicated state machine';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Algorithmic Swarm: Distributed Consensus',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Distributed Consensus & Raft/Paxos Protocol Specialist',
      );
    });

    it('should route graph_theory keywords to graph specialist', async () => {
      const output =
        'Perform topological_sort on the directed_acyclic dependency graph';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced Algorithmic Swarm: Graph Theory & DAG');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Graph Theory & Directed Acyclic Graph (DAG) Specialist',
      );
    });

    it('should route lossless_compression keywords to compression specialist', async () => {
      const output =
        'Apply lossless_compression and huffman_encoding to compress the stream';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Algorithmic Swarm: Lossless Data Compression',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Huffman & LZW Lossless Data Compression Specialist',
      );
    });

    it('should route abstract_syntax_tree keywords to AST parser specialist', async () => {
      const output =
        'Parse the custom grammar using abstract_syntax_tree and a lexer_tokenizer';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced Algorithmic Swarm: AST & Lexer Parser');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Abstract Syntax Tree (AST) & Lexer/Parser Specialist',
      );
    });

    it('should route zero_knowledge_proof keywords to cryptographic specialist', async () => {
      const output =
        'Formulate zero_knowledge_proof steps and evaluate the cryptographic_protocol';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced Algorithmic Swarm: Zero-Knowledge Proof');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Zero-Knowledge Proof & Cryptographic Protocol Specialist',
      );
    });

    it('should route np_hard_optimization keywords to NP-hard optimization specialist', async () => {
      const output =
        'Formulate the integer_linear_programming solver for np_hard_optimization';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Advanced Algorithmic Swarm: NP-Hard & Heuristics');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'NP-Hard & Integer Linear Programming (ILP) Specialist',
      );
    });

    it('should route hnsw_indexing keywords to geometry specialist', async () => {
      const output =
        'Configure hnsw_indexing on high_dimensional_geometry for vector_similarity_search';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Algorithmic Swarm: Vector Index & Geometry',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Vector Index HNSW & High-Dimensional Geometry Specialist',
      );
    });

    it('should route consistent_hashing keywords to DHT specialist', async () => {
      const output =
        'Configure consistent_hashing for distributed_cache_ring topology';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Algorithmic Swarm: Consistent Hashing & DHT',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Consistent Hashing & DHT Distributed Cache Specialist',
      );
    });

    it('should route kalman_filtering keywords to Kalman filter specialist', async () => {
      const output =
        'Configure kalman_filtering and timeseries_forecasting sensor_fusion_model';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Algorithmic Swarm: Time-Series & Kalman Filter',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Time-Series Forecasting & Kalman Filter Specialist',
      );
    });

    it('should route lsm_tree_storage keywords to storage engine specialist', async () => {
      const output =
        'Implement lsm_tree_storage and write_ahead_logging for db_crash_recovery';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Advanced Algorithmic Swarm: LSM-Tree & B-Tree Storage',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('B-Tree & LSM-Tree Storage Engine Specialist');
    });
  });
});
