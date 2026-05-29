import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const RUNTIMES_DIR = path.join(DEFINITIONS_DIR, 'runtimes');

describe('Modular Compiler & Runtime Declarative Agents & Swarm Router Integration', () => {
    describe('Recursive Declarative YAML Parsing & Ingestion', () => {
        it('should successfully parse and load the Rust Memory Safety agent', async () => {
            const yamlPath = path.join(RUNTIMES_DIR, 'rust.safety.agent.yaml');
            const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

            expect(def.id).toBe('agent.runtime.rust.safety');
            expect(def.name).toBe('Rust Borrow Checker & Lifetime Sanitizer Specialist');
            expect(def.capabilities).toContain('lifetime_sanitization');
        });

        it('should successfully parse and load the Go Concurrency agent', async () => {
            const yamlPath = path.join(RUNTIMES_DIR, 'go.concurrency.agent.yaml');
            const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

            expect(def.id).toBe('agent.runtime.go.concurrency');
            expect(def.name).toBe('Go Goroutine Concurrency & Race Detector Specialist');
            expect(def.capabilities).toContain('go_race_detector');
        });

        it('should successfully parse and load the Wasm Sandbox agent', async () => {
            const yamlPath = path.join(RUNTIMES_DIR, 'wasm.sandbox.agent.yaml');
            const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

            expect(def.id).toBe('agent.runtime.wasm.sandbox');
            expect(def.name).toBe('Wasm WebAssembly Linear Memory Sandbox Auditor');
            expect(def.capabilities).toContain('wasm_linear_memory');
        });

        it('should successfully parse and load the JVM Memory agent', async () => {
            const yamlPath = path.join(RUNTIMES_DIR, 'jvm.memory.agent.yaml');
            const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

            expect(def.id).toBe('agent.runtime.jvm.memory');
            expect(def.name).toBe('JVM Garbage Collection & Memory Management Tuner');
            expect(def.capabilities).toContain('oom_leak_diagnosis');
        });

        it('should successfully parse and load the C/C++ Valgrind agent', async () => {
            const yamlPath = path.join(RUNTIMES_DIR, 'cpp.valgrind.agent.yaml');
            const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

            expect(def.id).toBe('agent.runtime.cpp.valgrind');
            expect(def.name).toBe('C/C++ Pointer Safety & Valgrind Diagnostic Auditor');
            expect(def.capabilities).toContain('valgrind_log_parse');
        });

        it('should successfully parse and load the Python Interpreter agent', async () => {
            const yamlPath = path.join(RUNTIMES_DIR, 'python.interpreter.agent.yaml');
            const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

            expect(def.id).toBe('agent.runtime.python.interpreter');
            expect(def.name).toBe('Python CPython GIL & AsyncIO Performance Optimizer');
            expect(def.capabilities).toContain('asyncio_eventloop');
        });

        it('should successfully parse and load the PostgreSQL AST agent', async () => {
            const yamlPath = path.join(RUNTIMES_DIR, 'postgres.queryplan.agent.yaml');
            const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

            expect(def.id).toBe('agent.runtime.postgres.queryplan');
            expect(def.name).toBe('PostgreSQL AST Query Execution Plan Optimizer');
            expect(def.capabilities).toContain('explain_plan_parsing');
        });

        it('should successfully parse and load the TS Strict Mode agent', async () => {
            const yamlPath = path.join(RUNTIMES_DIR, 'typescript.compiler.agent.yaml');
            const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

            expect(def.id).toBe('agent.runtime.typescript.compiler');
            expect(def.name).toBe('TypeScript strictNullChecks & Compiler Error Resolver');
            expect(def.capabilities).toContain('strict_type_checks');
        });

        it('should successfully parse and load the Docker Layer Minimizer agent', async () => {
            const yamlPath = path.join(RUNTIMES_DIR, 'docker.layers.agent.yaml');
            const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

            expect(def.id).toBe('agent.runtime.docker.layers');
            expect(def.name).toBe('Docker Container Multi-Stage Layer Minimization Specialist');
            expect(def.capabilities).toContain('docker_multistage_build');
        });

        it('should successfully parse and load the K8s Policy agent', async () => {
            const yamlPath = path.join(RUNTIMES_DIR, 'k8s.policy.agent.yaml');
            const def = parseYaml(await fs.readFile(yamlPath, 'utf8'));

            expect(def.id).toBe('agent.runtime.k8s.policy');
            expect(def.name).toBe('Kubernetes Kustomize & OPA Gatekeeper Policy Auditor');
            expect(def.capabilities).toContain('opa_rego_policy');
        });
    });

    describe('Precision Swarm Routing for Compiler & Language Runtimes', () => {
        it('should route Rust safety keywords to the Rust safety specialist', async () => {
            const output = 'Perform rust_unsafe_audit boundary checks and evaluate lifetime_sanitization constraints';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Advanced Compiler Swarm: Rust Borrow Checker & Safety');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Rust Borrow Checker & Lifetime Sanitizer Specialist');
        });

        it('should route Go concurrency keywords to the Go concurrency specialist', async () => {
            const output = 'Execute goroutine_leak_audit on channel workers and resolve go_race_detector anomalies';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Advanced Compiler Swarm: Go Concurrency & Race Detection');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Go Goroutine Concurrency & Race Detector Specialist');
        });

        it('should route Wasm sandbox keywords to the Wasm sandbox specialist', async () => {
            const output = 'Isolate wasm_linear_memory bounds and verify guest wasi_capability_access lists';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Advanced Compiler Swarm: Wasm Sandbox Isolation');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Wasm WebAssembly Linear Memory Sandbox Auditor');
        });

        it('should route JVM memory keywords to the JVM tuner', async () => {
            const output = 'Configure jvm_gc_tuning heap boundaries and resolve dynamic oom_leak_diagnosis failures';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Advanced Compiler Swarm: JVM GC & Memory Optimization');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('JVM Garbage Collection & Memory Management Tuner');
        });

        it('should route C/C++ safety keywords to the Valgrind auditor', async () => {
            const output = 'Secure cpp_pointer_safety array dereferences and parse Valgrind valgrind_log_parse output';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Advanced Compiler Swarm: C/C++ Pointer Safety & Valgrind');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('C/C++ Pointer Safety & Valgrind Diagnostic Auditor');
        });

        it('should route Python CPython keywords to the Python optimizer', async () => {
            const output = 'Solve thread locks gil_thread_contention and optimize the asyncio_eventloop task schedule';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Advanced Compiler Swarm: Python Interpreter & GIL');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Python CPython GIL & AsyncIO Performance Optimizer');
        });

        it('should route PostgreSQL plan keywords to the PG execution plan specialist', async () => {
            const output = 'Parse explain_plan_parsing execution graphs and perform ast_query_rewriting optimization';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Advanced Compiler Swarm: PostgreSQL AST Query Planner');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('PostgreSQL AST Query Execution Plan Optimizer');
        });

        it('should route TypeScript compiler keywords to the TS compiler specialist', async () => {
            const output = 'Enable strict_type_checks generic bounds and evaluate tsc_compiler_diagnostics logs';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Advanced Compiler Swarm: TypeScript Strict Compiler');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('TypeScript strictNullChecks & Compiler Error Resolver');
        });

        it('should route Docker layers keywords to the Docker layer minimizer specialist', async () => {
            const output = 'Design docker_multistage_build files and optimize layer_cache_opt stages';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Advanced Compiler Swarm: Docker Layer Minimization');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Docker Container Multi-Stage Layer Minimization Specialist');
        });

        it('should route Kubernetes policy keywords to the Kubernetes policy auditor', async () => {
            const output = 'Enforce OPA gatekeeper opa_rego_policy constraints and compile kustomize_overlays maps';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Advanced Compiler Swarm: Kubernetes Policy & OPA');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Kubernetes Kustomize & OPA Gatekeeper Policy Auditor');
        });
    });
});
