import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const EDGE_DIR = path.join(DEFINITIONS_DIR, 'edge');

describe('Modular Mobile, Edge Computing & Native Systems Swarm Router Integration', () => {
  describe('Recursive Declarative YAML Parsing & Ingestion', () => {
    it('should successfully parse and load iOS Swift & CocoaTouch Specialist', async () => {
      const agentPath = path.join(EDGE_DIR, 'edge.ios.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.edge.ios');
      expect(def.name).toBe('iOS Swift & CocoaTouch Specialist');
      expect(def.capabilities).toContain('swift_concurrency_structured_async');
      expect(def.capabilities).toContain('coredata_persistent_store_migration');
    });

    it('should successfully parse and load Android Kotlin & Jetpack Compose Architect', async () => {
      const agentPath = path.join(EDGE_DIR, 'edge.android.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.edge.android');
      expect(def.name).toBe('Android Kotlin & Jetpack Compose Architect');
      expect(def.capabilities).toContain('kotlin_coroutine_flow_orchestration');
      expect(def.capabilities).toContain('room_sqlite_schema_relationships');
    });

    it('should successfully parse and load Kotlin Multiplatform (KMP) Shared Core Specialist', async () => {
      const agentPath = path.join(EDGE_DIR, 'edge.kmp.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.edge.kmp');
      expect(def.name).toBe(
        'Kotlin Multiplatform (KMP) Shared Core Specialist',
      );
      expect(def.capabilities).toContain('kmp_expect_actual_platform_mappings');
      expect(def.capabilities).toContain('multiplatform_http_client_ktor');
    });

    it('should successfully parse and load React Native Bridge & Native Modules Specialist', async () => {
      const agentPath = path.join(EDGE_DIR, 'edge.reactnative.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.edge.reactnative');
      expect(def.name).toBe('React Native Bridge & Native Modules Specialist');
      expect(def.capabilities).toContain('jsi_native_bridge_communication');
      expect(def.capabilities).toContain('fabric_renderer_ui_components');
    });

    it('should successfully parse and load Electron Desktop & Native Interop Architect', async () => {
      const agentPath = path.join(EDGE_DIR, 'edge.electron.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.edge.electron');
      expect(def.name).toBe('Electron Desktop & Native Interop Architect');
      expect(def.capabilities).toContain(
        'electron_ipc_renderer_security_sandbox',
      );
      expect(def.capabilities).toContain('multi_window_renderer_state_sync');
    });

    it('should successfully parse and load WebAssembly WebAPI & WASI Compiler Specialist', async () => {
      const agentPath = path.join(EDGE_DIR, 'edge.wasm.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.edge.wasm');
      expect(def.name).toBe('WebAssembly WebAPI & WASI Compiler Specialist');
      expect(def.capabilities).toContain('wasi_filesystem_abstraction_layers');
      expect(def.capabilities).toContain('rust_cpp_wasm_pack_compilation');
    });

    it('should successfully parse and load Embedded RTOS & Microcontroller Systems Specialist', async () => {
      const agentPath = path.join(EDGE_DIR, 'edge.embedded.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.edge.embedded');
      expect(def.name).toBe(
        'Embedded RTOS & Microcontroller Systems Specialist',
      );
      expect(def.capabilities).toContain('rtos_kernel_scheduler_boundaries');
      expect(def.capabilities).toContain(
        'embedded_memory_heap_leak_mitigation',
      );
    });

    it('should successfully parse and load WebUSB & WebBluetooth System Interop Specialist', async () => {
      const agentPath = path.join(EDGE_DIR, 'edge.webusb.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.edge.webusb');
      expect(def.name).toBe('WebUSB & WebBluetooth System Interop Specialist');
      expect(def.capabilities).toContain('webusb_endpoint_packet_transfers');
      expect(def.capabilities).toContain('hardware_device_permission_profiles');
    });

    it('should successfully parse and load Edge Compute Serverless & CDN Architect', async () => {
      const agentPath = path.join(EDGE_DIR, 'edge.serverless.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.edge.serverless');
      expect(def.name).toBe('Edge Compute Serverless & CDN Architect');
      expect(def.capabilities).toContain(
        'cloudflare_workers_v8_isolates_compute',
      );
      expect(def.capabilities).toContain('globally_distributed_keyvalue_maps');
    });

    it('should successfully parse and load Progressive Web Application (PWA) Offline Sync Specialist', async () => {
      const agentPath = path.join(EDGE_DIR, 'edge.pwa.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.edge.pwa');
      expect(def.name).toBe(
        'Progressive Web Application (PWA) Offline Sync Specialist',
      );
      expect(def.capabilities).toContain('service_worker_lifecycle_caching');
      expect(def.capabilities).toContain(
        'push_notification_payload_encryption',
      );
    });
  });

  describe('Precision Swarm Routing for All 10 Mobile, Edge Computing & Native Systems Agents', () => {
    it('should route iOS Swift keywords to iOS Swift & CocoaTouch Specialist agent', async () => {
      const output =
        'Perform swift_concurrency_structured_async workflows and check coredata_persistent_store_migration settings';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Edge Swarm: iOS Development');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('iOS Swift & CocoaTouch Specialist');
    });

    it('should route Android Kotlin keywords to Android Kotlin & Jetpack Compose Architect agent', async () => {
      const output =
        'Setup kotlin_coroutine_flow_orchestration routines and check room_sqlite_schema_relationships mappings';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Edge Swarm: Android Development');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Android Kotlin & Jetpack Compose Architect');
    });

    it('should route KMP keywords to Kotlin Multiplatform (KMP) Shared Core Specialist agent', async () => {
      const output =
        'Configure kmp_expect_actual_platform_mappings targets and perform multiplatform_http_client_ktor calls';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Edge Swarm: Kotlin Multiplatform');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Kotlin Multiplatform (KMP) Shared Core Specialist',
      );
    });

    it('should route React Native keywords to React Native Bridge & Native Modules Specialist agent', async () => {
      const output =
        'Implement jsi_native_bridge_communication protocols and compile fabric_renderer_ui_components';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Edge Swarm: React Native Bridges');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'React Native Bridge & Native Modules Specialist',
      );
    });

    it('should route Electron keywords to Electron Desktop & Native Interop Architect agent', async () => {
      const output =
        'Audit electron_ipc_renderer_security_sandbox scopes and ensure multi_window_renderer_state_sync synchronization';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Edge Swarm: Electron Desktop');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Electron Desktop & Native Interop Architect');
    });

    it('should route WASM keywords to WebAssembly WebAPI & WASI Compiler Specialist agent', async () => {
      const output =
        'Calibrate wasi_filesystem_abstraction_layers parameters and execute rust_cpp_wasm_pack_compilation build commands';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Edge Swarm: WebAssembly Systems');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'WebAssembly WebAPI & WASI Compiler Specialist',
      );
    });

    it('should route Embedded RTOS keywords to Embedded RTOS & Microcontroller Systems Specialist agent', async () => {
      const output =
        'Examine rtos_kernel_scheduler_boundaries prioritizations and check embedded_memory_heap_leak_mitigation stack structures';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Edge Swarm: Embedded RTOS Hardware');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Embedded RTOS & Microcontroller Systems Specialist',
      );
    });

    it('should route WebUSB & WebBluetooth keywords to WebUSB & WebBluetooth System Interop Specialist agent', async () => {
      const output =
        'Assert webusb_endpoint_packet_transfers transfers and audit hardware_device_permission_profiles rules';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Edge Swarm: WebUSB & WebBluetooth');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'WebUSB & WebBluetooth System Interop Specialist',
      );
    });

    it('should route Edge compute keywords to Edge Compute Serverless & CDN Architect agent', async () => {
      const output =
        'Tune cloudflare_workers_v8_isolates_compute bounds and configure globally_distributed_keyvalue_maps directories';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Edge Swarm: Edge Serverless & CDN');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Edge Compute Serverless & CDN Architect');
    });

    it('should route PWA keywords to Progressive Web Application (PWA) Offline Sync Specialist agent', async () => {
      const output =
        'Verify service_worker_lifecycle_caching processes and assert push_notification_payload_encryption keys';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Edge Swarm: PWAs & Offline Sync');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Progressive Web Application (PWA) Offline Sync Specialist',
      );
    });
  });
});
