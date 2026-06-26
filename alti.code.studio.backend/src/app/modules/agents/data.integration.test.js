import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const DATA_DIR = path.join(DEFINITIONS_DIR, 'data');

describe('Modular Data Engineering & Stream Processing Declarative Agents & Swarm Router Integration', () => {
  describe('Recursive Declarative YAML Parsing & Ingestion', () => {
    it('should successfully parse and load Apache Kafka & Event Stream Tuning Specialist', async () => {
      const agentPath = path.join(DATA_DIR, 'data.kafka_tuner.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.data.kafka_tuner');
      expect(def.name).toBe('Apache Kafka & Event Stream Tuning Specialist');
      expect(def.capabilities).toContain('kafka_partition_calibration');
      expect(def.capabilities).toContain('consumer_lag_mitigation');
    });

    it('should successfully parse and load Apache Spark & Large-Scale Batch Tuning Specialist', async () => {
      const agentPath = path.join(DATA_DIR, 'data.spark_optimizer.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.data.spark_optimizer');
      expect(def.name).toBe(
        'Apache Spark & Large-Scale Batch Tuning Specialist',
      );
      expect(def.capabilities).toContain(
        'spark_shuffle_partition_optimization',
      );
      expect(def.capabilities).toContain('spark_memory_management_bounds');
    });

    it('should successfully parse and load Apache Flink & Real-Time Stream Processor', async () => {
      const agentPath = path.join(DATA_DIR, 'data.flink_stream.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.data.flink_stream');
      expect(def.name).toBe('Apache Flink & Real-Time Stream Processor');
      expect(def.capabilities).toContain('stateful_stream_computations');
      expect(def.capabilities).toContain('event_time_windowing');
    });

    it('should successfully parse and load Snowflake & Enterprise Data Warehouse Architect', async () => {
      const agentPath = path.join(DATA_DIR, 'data.snowflake_dwh.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.data.snowflake_dwh');
      expect(def.name).toBe('Snowflake & Enterprise Data Warehouse Architect');
      expect(def.capabilities).toContain('micro_partitioning_alignment');
      expect(def.capabilities).toContain('zero_copy_cloning_layouts');
    });

    it('should successfully parse and load dbt (Data Build Tool) Analytics Engineer', async () => {
      const agentPath = path.join(DATA_DIR, 'data.dbt_modeler.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.data.dbt_modeler');
      expect(def.name).toBe('dbt (Data Build Tool) Analytics Engineer');
      expect(def.capabilities).toContain(
        'incremental_materialization_strategies',
      );
      expect(def.capabilities).toContain('sql_cte_factoring');
    });

    it('should successfully parse and load Apache Airflow & Workflow Conductor', async () => {
      const agentPath = path.join(DATA_DIR, 'data.airflow_governor.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.data.airflow_governor');
      expect(def.name).toBe('Apache Airflow & Workflow Conductor');
      expect(def.capabilities).toContain('dynamic_dag_generation');
      expect(def.capabilities).toContain('taskflow_api_mappings');
    });

    it('should successfully parse and load ClickHouse & Columnar OLAP Specialist', async () => {
      const agentPath = path.join(DATA_DIR, 'data.clickhouse_olap.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.data.clickhouse_olap');
      expect(def.name).toBe('ClickHouse & Columnar OLAP Specialist');
      expect(def.capabilities).toContain('mergetree_engine_tuning');
      expect(def.capabilities).toContain('materialized_views_opt');
    });

    it('should successfully parse and load Apache Iceberg & Open Table Format Specialist', async () => {
      const agentPath = path.join(DATA_DIR, 'data.iceberg_lake.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.data.iceberg_lake');
      expect(def.name).toBe('Apache Iceberg & Open Table Format Specialist');
      expect(def.capabilities).toContain('acid_transactions_lakehouse');
      expect(def.capabilities).toContain('hidden_partitioning_evolution');
    });

    it('should successfully parse and load Data Lineage & Governance Officer', async () => {
      const agentPath = path.join(DATA_DIR, 'data.data_lineage.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.data.data_lineage');
      expect(def.name).toBe('Data Lineage & Governance Officer');
      expect(def.capabilities).toContain('metadata_scanning_maps');
      expect(def.capabilities).toContain('column_level_lineage_tracking');
    });

    it('should successfully parse and load Apache Pulsar & Multi-Tenant Messaging Specialist', async () => {
      const agentPath = path.join(DATA_DIR, 'data.pulsar_broker.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.data.pulsar_broker');
      expect(def.name).toBe(
        'Apache Pulsar & Multi-Tenant Messaging Specialist',
      );
      expect(def.capabilities).toContain('pulsar_multi_tenancy_namespaces');
      expect(def.capabilities).toContain('pulsar_geo_replication');
    });
  });

  describe('Precision Swarm Routing for All 10 Data Engineering & Stream Processing Agents', () => {
    it('should route Kafka keywords to the Kafka tuner agent', async () => {
      const output =
        'Resolve consumer_lag_mitigation policies and coordinate schema_registry_evolution setups';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Data Engineering Swarm: Apache Kafka Streaming');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Apache Kafka & Event Stream Tuning Specialist',
      );
    });

    it('should route Spark keywords to the Spark optimizer agent', async () => {
      const output =
        'Audit spark_shuffle_partition_optimization configurations and minimize disk_spill_mitigation errors';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Data Engineering Swarm: Apache Spark Optimization',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Apache Spark & Large-Scale Batch Tuning Specialist',
      );
    });

    it('should route Flink keywords to the Flink stream agent', async () => {
      const output =
        'Create stateful_stream_computations logic and run exactly_once_checkpointing tasks';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Data Engineering Swarm: Apache Flink Streaming');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Apache Flink & Real-Time Stream Processor');
    });

    it('should route Snowflake keywords to the Snowflake warehouse agent', async () => {
      const output =
        'Perform search_optimization_services updates and check zero_copy_cloning_layouts layouts';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Data Engineering Swarm: Snowflake Data Warehousing',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Snowflake & Enterprise Data Warehouse Architect',
      );
    });

    it('should route dbt keywords to the dbt modeler agent', async () => {
      const output =
        'Implement incremental_materialization_strategies views and compile source_freshness_validations checks';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Data Engineering Swarm: dbt Analytics Engineering',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('dbt (Data Build Tool) Analytics Engineer');
    });

    it('should route Airflow keywords to the Airflow governor agent', async () => {
      const output =
        'Build dynamic_dag_generation scripts and configure custom_sla_callbacks SLA triggers';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Data Engineering Swarm: Apache Airflow Orchestration',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Apache Airflow & Workflow Conductor');
    });

    it('should route ClickHouse keywords to the ClickHouse OLAP agent', async () => {
      const output =
        'Tune mergetree_engine_tuning properties and compile materialized_views_opt dashboards';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Data Engineering Swarm: ClickHouse Columnar OLAP');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('ClickHouse & Columnar OLAP Specialist');
    });

    it('should route Iceberg keywords to the Iceberg open table agent', async () => {
      const output =
        'Launch acid_transactions_lakehouse commits and monitor metadata_file_compaction jobs';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Data Engineering Swarm: Apache Iceberg Lakehouse');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Apache Iceberg & Open Table Format Specialist',
      );
    });

    it('should route Data Lineage keywords to the governance officer agent', async () => {
      const output =
        'Scan metadata_scanning_maps sources and track column_level_lineage_tracking changes';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Data Engineering Swarm: Governance & Lineage');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Data Lineage & Governance Officer');
    });

    it('should route Pulsar keywords to the Pulsar multi-tenant broker agent', async () => {
      const output =
        'Define pulsar_multi_tenancy_namespaces parameters and setup pulsar_geo_replication synchronizations';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Data Engineering Swarm: Apache Pulsar Messaging');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Apache Pulsar & Multi-Tenant Messaging Specialist',
      );
    });
  });
});
