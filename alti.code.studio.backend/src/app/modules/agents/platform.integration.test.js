import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const PLATFORM_DIR = path.join(DEFINITIONS_DIR, 'platform');

describe('Modular Platform Engineering, IaC & Cloud-Native Systems Swarm Router Integration', () => {
    describe('Recursive Declarative YAML Parsing & Ingestion', () => {
        it('should successfully parse and load Terraform State & IaC Optimizer', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.terraform.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.terraform');
            expect(def.name).toBe('Terraform State & IaC Optimizer');
            expect(def.capabilities).toContain('terraform_state_lock_auditing');
            expect(def.capabilities).toContain('hcl_syntax_linting');
        });

        it('should successfully parse and load Ansible Configuration & Playbook Specialist', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.ansible.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.ansible');
            expect(def.name).toBe('Ansible Configuration & Playbook Specialist');
            expect(def.capabilities).toContain('play_execution_concurrency');
            expect(def.capabilities).toContain('task_idempotent_validations');
        });

        it('should successfully parse and load Helm Chart & Package Manager Architect', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.helm.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.helm');
            expect(def.name).toBe('Helm Chart & Package Manager Architect');
            expect(def.capabilities).toContain('values_overlays_structure');
            expect(def.capabilities).toContain('dynamic_template_dependencies');
        });

        it('should successfully parse and load Docker Engine & Host Virtualization Specialist', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.docker.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.docker');
            expect(def.name).toBe('Docker Engine & Host Virtualization Specialist');
            expect(def.capabilities).toContain('docker_socket_security_access');
            expect(def.capabilities).toContain('docker_daemon_configurations');
        });

        it('should successfully parse and load Consul Service Discovery & Key-Value Specialist', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.consul.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.consul');
            expect(def.name).toBe('Consul Service Discovery & Key-Value Specialist');
            expect(def.capabilities).toContain('catalog_synchronization_periods');
            expect(def.capabilities).toContain('raft_consensus_cluster_configs');
        });

        it('should successfully parse and load Prometheus Telemetry & Alerting Specialist', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.prometheus.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.prometheus');
            expect(def.name).toBe('Prometheus Telemetry & Alerting Specialist');
            expect(def.capabilities).toContain('metrics_scraping_intervals');
            expect(def.capabilities).toContain('alertmanager_configurations');
        });

        it('should successfully parse and load NGINX Reverse Proxy & HTTP Engine Specialist', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.nginx.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.nginx');
            expect(def.name).toBe('NGINX Reverse Proxy & HTTP Engine Specialist');
            expect(def.capabilities).toContain('server_proxy_blocks_configurations');
            expect(def.capabilities).toContain('ssl_session_caching');
        });

        it('should successfully parse and load ArgoCD GitOps Git Sync Specialist', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.argocd.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.argocd');
            expect(def.name).toBe('ArgoCD GitOps Git Sync Specialist');
            expect(def.capabilities).toContain('application_synchronization_queues');
            expect(def.capabilities).toContain('applicationset_matrix_generators');
        });

        it('should successfully parse and load Envoy Proxy & Service Mesh Specialist', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.envoy.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.envoy');
            expect(def.name).toBe('Envoy Proxy & Service Mesh Specialist');
            expect(def.capabilities).toContain('dynamic_cluster_discovery_xds');
            expect(def.capabilities).toContain('custom_filters_wasm_injection');
        });

        it('should successfully parse and load Packer Machine Image & Template Specialist', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.packer.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.packer');
            expect(def.name).toBe('Packer Machine Image & Template Specialist');
            expect(def.capabilities).toContain('vm_golden_image_builds');
            expect(def.capabilities).toContain('parallel_build_optimizations');
        });

        it('should successfully parse and load Crabbox Remote Sandbox & Secure Execution Specialist', async () => {
            const agentPath = path.join(PLATFORM_DIR, 'platform.crabbox.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.platform.crabbox');
            expect(def.name).toBe('Crabbox Remote Sandbox & Secure Execution Specialist');
            expect(def.capabilities).toContain('remote_lease_lifecycle_management');
            expect(def.capabilities).toContain('workspace_diff_synchronization');
        });
    });

    describe('Precision Swarm Routing for All 11 Platform Engineering & IaC Agents', () => {
        it('should route Terraform keywords to Terraform State & IaC Optimizer agent', async () => {
            const output = 'Perform terraform_state_lock_auditing validations and check hcl_syntax_linting formats';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: Terraform & IaC');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Terraform State & IaC Optimizer');
        });

        it('should route Ansible keywords to Ansible Configuration & Playbook Specialist agent', async () => {
            const output = 'Examine dynamic_inventory_mapping mappings and ensure task_idempotent_validations are verified';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: Ansible Configurations');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Ansible Configuration & Playbook Specialist');
        });

        it('should route Helm keywords to Helm Chart & Package Manager Architect agent', async () => {
            const output = 'Compile values_overlays_structure files and resolve dynamic_template_dependencies dynamic configurations';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: Helm & K8s Packaging');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Helm Chart & Package Manager Architect');
        });

        it('should route Docker keywords to Docker Engine & Host Virtualization Specialist agent', async () => {
            const output = 'Set docker_socket_security_access credentials and check docker_daemon_configurations JSON settings';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: Docker & Virtualization');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Docker Engine & Host Virtualization Specialist');
        });

        it('should route Consul keywords to Consul Service Discovery & Key-Value Specialist agent', async () => {
            const output = 'Setup catalog_synchronization_periods metrics and check raft_consensus_cluster_configs settings';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: Consul Discovery & KV');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Consul Service Discovery & Key-Value Specialist');
        });

        it('should route Prometheus keywords to Prometheus Telemetry & Alerting Specialist agent', async () => {
            const output = 'Tweak metrics_scraping_intervals rates and adjust alertmanager_configurations endpoints';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: Prometheus Telemetry');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Prometheus Telemetry & Alerting Specialist');
        });

        it('should route NGINX keywords to NGINX Reverse Proxy & HTTP Engine Specialist agent', async () => {
            const output = 'Optimize server_proxy_blocks_configurations values and enable ssl_session_caching params';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: NGINX Proxy & Reverse Web');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('NGINX Reverse Proxy & HTTP Engine Specialist');
        });

        it('should route ArgoCD keywords to ArgoCD GitOps Git Sync Specialist agent', async () => {
            const output = 'Inspect application_synchronization_queues sizes and build applicationset_matrix_generators dynamic matrices';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: ArgoCD GitOps');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('ArgoCD GitOps Git Sync Specialist');
        });

        it('should route Envoy keywords to Envoy Proxy & Service Mesh Specialist agent', async () => {
            const output = 'Monitor dynamic_cluster_discovery_xds stats and activate custom_filters_wasm_injection filters';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: Envoy Mesh & Sidecars');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Envoy Proxy & Service Mesh Specialist');
        });

        it('should route Packer keywords to Packer Machine Image & Template Specialist agent', async () => {
            const output = 'Compile vm_golden_image_builds pipelines and enforce parallel_build_optimizations options';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: Packer Machine Images');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Packer Machine Image & Template Specialist');
        });

        it('should route Crabbox keywords to Crabbox Remote Sandbox & Secure Execution Specialist agent', async () => {
            const output = 'Perform remote_lease_lifecycle_management checks and execute workspace_diff_synchronization operations';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Platform Engineering Swarm: Crabbox Sandboxing');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Crabbox Remote Sandbox & Secure Execution Specialist');
        });
    });
});
