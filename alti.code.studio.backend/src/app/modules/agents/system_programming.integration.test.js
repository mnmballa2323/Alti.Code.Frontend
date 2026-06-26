import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const SYS_DIR = path.join(DEFINITIONS_DIR, 'sys');

describe('Modular Operating Systems, Kernels & Compilers Systems Swarm Router Integration', () => {
  describe('Recursive Declarative YAML Parsing & Ingestion', () => {
    it('should successfully parse and load Linux Kernel & Device Driver Engineer', async () => {
      const agentPath = path.join(SYS_DIR, 'sys.kernel.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.sys.kernel');
      expect(def.name).toBe('Linux Kernel & Device Driver Engineer');
      expect(def.capabilities).toContain('linux_kernel_module_optimizations');
      expect(def.capabilities).toContain('device_driver_interrupt_handlers');
    });

    it('should successfully parse and load Compiler Optimization & LLVM Specialist', async () => {
      const agentPath = path.join(SYS_DIR, 'sys.compiler.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.sys.compiler');
      expect(def.name).toBe('Compiler Optimization & LLVM Specialist');
      expect(def.capabilities).toContain('llvm_ir_optimization_passes');
      expect(def.capabilities).toContain('dead_code_elimination_compilers');
    });

    it('should successfully parse and load Linker, Loader & Static Binary Analyzer', async () => {
      const agentPath = path.join(SYS_DIR, 'sys.linker.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.sys.linker');
      expect(def.name).toBe('Linker, Loader & Static Binary Analyzer');
      expect(def.capabilities).toContain('elf_macho_binary_header_audits');
      expect(def.capabilities).toContain(
        'static_dynamic_linker_symbol_resolution',
      );
    });

    it('should successfully parse and load Garbage Collection & Memory Runtime Specialist', async () => {
      const agentPath = path.join(SYS_DIR, 'sys.garbage_collection.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.sys.garbage_collection');
      expect(def.name).toBe('Garbage Collection & Memory Runtime Specialist');
      expect(def.capabilities).toContain(
        'generational_mark_sweep_garbage_collection',
      );
      expect(def.capabilities).toContain('v8_jvm_heap_compaction_tuning');
    });

    it('should successfully parse and load Assembler, Disassembler & Reverse Engineering Expert', async () => {
      const agentPath = path.join(SYS_DIR, 'sys.assembler.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.sys.assembler');
      expect(def.name).toBe(
        'Assembler, Disassembler & Reverse Engineering Expert',
      );
      expect(def.capabilities).toContain('x86_arm_assembly_parsing');
      expect(def.capabilities).toContain('binary_disassembling_ghidra_ida');
    });

    it('should successfully parse and load Virtualization Hypervisor & Xen/KVM Architect', async () => {
      const agentPath = path.join(SYS_DIR, 'sys.hypervisor.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.sys.hypervisor');
      expect(def.name).toBe('Virtualization Hypervisor & Xen/KVM Architect');
      expect(def.capabilities).toContain('kvm_xen_hypervisor_optimizations');
      expect(def.capabilities).toContain(
        'hardware_assisted_cpu_virtualization',
      );
    });

    it('should successfully parse and load POSIX System Programming & C Library Specialist', async () => {
      const agentPath = path.join(SYS_DIR, 'sys.posix.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.sys.posix');
      expect(def.name).toBe('POSIX System Programming & C Library Specialist');
      expect(def.capabilities).toContain('posix_syscall_bindings_threads');
      expect(def.capabilities).toContain(
        'signal_handling_isolation_boundaries',
      );
    });

    it('should successfully parse and load Debugger Engine & GDB/LLDB Interop Specialist', async () => {
      const agentPath = path.join(SYS_DIR, 'sys.debugger.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.sys.debugger');
      expect(def.name).toBe('Debugger Engine & GDB/LLDB Interop Specialist');
      expect(def.capabilities).toContain('ptrace_process_attach_boundaries');
      expect(def.capabilities).toContain(
        'software_hardware_breakpoint_injections',
      );
    });

    it('should successfully parse and load Binary Compactor & Packer Specialist', async () => {
      const agentPath = path.join(SYS_DIR, 'sys.packer.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.sys.packer');
      expect(def.name).toBe('Binary Compactor & Packer Specialist');
      expect(def.capabilities).toContain('runtime_executable_packer_upx');
      expect(def.capabilities).toContain('binary_size_minimization_pipelines');
    });

    it('should successfully parse and load Microkernel & Operating Systems Architect', async () => {
      const agentPath = path.join(SYS_DIR, 'sys.microkernel.agent.yaml');
      const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

      expect(def.id).toBe('agent.sys.microkernel');
      expect(def.name).toBe('Microkernel & Operating Systems Architect');
      expect(def.capabilities).toContain('capability_based_security_sel4');
      expect(def.capabilities).toContain('microkernel_ipc_message_channels');
    });
  });

  describe('Precision Swarm Routing for All 10 Systems, Kernels & Compilers Agents', () => {
    it('should route Linux Kernel keywords to Linux Kernel & Device Driver Engineer agent', async () => {
      const output =
        'Perform linux_kernel_module_optimizations routines and manage device_driver_interrupt_handlers interrupts';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Systems Swarm: Linux Kernel & Device Drivers');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Linux Kernel & Device Driver Engineer');
    });

    it('should route Compiler Specialist keywords to Compiler Optimization & LLVM Specialist agent', async () => {
      const output =
        'Analyze llvm_ir_optimization_passes outputs and check dead_code_elimination_compilers logs';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Systems Swarm: Compiler Optimizations & LLVM');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Compiler Optimization & LLVM Specialist');
    });

    it('should route Linker/Loader keywords to Linker, Loader & Static Binary Analyzer agent', async () => {
      const output =
        'Audit elf_macho_binary_header_audits headers and verify static_dynamic_linker_symbol_resolution mappings';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Systems Swarm: Linkers, Loaders & Symbols');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Linker, Loader & Static Binary Analyzer');
    });

    it('should route GC/Memory keywords to Garbage Collection & Memory Runtime Specialist agent', async () => {
      const output =
        'Implement generational_mark_sweep_garbage_collection passes and optimize v8_jvm_heap_compaction_tuning settings';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Systems Swarm: Garbage Collection & Heap Memory');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Garbage Collection & Memory Runtime Specialist',
      );
    });

    it('should route Assembler keywords to Assembler, Disassembler & Reverse Engineering Expert agent', async () => {
      const output =
        'Examine x86_arm_assembly_parsing codes and check binary_disassembling_ghidra_ida logs';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Systems Swarm: Assembly & Reverse Engineering');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Assembler, Disassembler & Reverse Engineering Expert',
      );
    });

    it('should route Hypervisor keywords to Virtualization Hypervisor & Xen/KVM Architect agent', async () => {
      const output =
        'Apply kvm_xen_hypervisor_optimizations parameters and tune hardware_assisted_cpu_virtualization configurations';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Systems Swarm: Virtualization & Hypervisors');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Virtualization Hypervisor & Xen/KVM Architect',
      );
    });

    it('should route POSIX keywords to POSIX System Programming & C Library Specialist agent', async () => {
      const output =
        'Bind posix_syscall_bindings_threads APIs and audit signal_handling_isolation_boundaries';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Systems Swarm: POSIX System Programming');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'POSIX System Programming & C Library Specialist',
      );
    });

    it('should route Debugger keywords to Debugger Engine & GDB/LLDB Interop Specialist agent', async () => {
      const output =
        'Audit ptrace_process_attach_boundaries boundaries and check software_hardware_breakpoint_injections lines';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Systems Swarm: Process Debugging & Symbols');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Debugger Engine & GDB/LLDB Interop Specialist',
      );
    });

    it('should route Binary Packer keywords to Binary Compactor & Packer Specialist agent', async () => {
      const output =
        'Inject runtime_executable_packer_upx stubs and verify binary_size_minimization_pipelines';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Systems Swarm: Obfuscation & Executable Packers');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Binary Compactor & Packer Specialist');
    });

    it('should route Microkernel keywords to Microkernel & Operating Systems Architect agent', async () => {
      const output =
        'Configure capability_based_security_sel4 policies and manage microkernel_ipc_message_channels';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Systems Swarm: Microkernels & Capability Spaces');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain('Microkernel & Operating Systems Architect');
    });
  });
});
