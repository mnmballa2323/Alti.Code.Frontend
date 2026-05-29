import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml, createAgentFromDefinition } from './yaml_agent_loader.js';
import { capabilityRouter } from './capability.router.js';
import { agentRegistry } from './agent.registry.js';
import { CodeExecutionSandbox } from '../sandbox/code_execution_sandbox.js';
import { dynamicSessionsService } from '../googleCloud/dynamic_sessions.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');

describe('Declarative YAML Agent Integration & Routing System', () => {
    it('should parse and load git.resolver.agent.yaml flawlessly', async () => {
        const filePath = path.join(DEFINITIONS_DIR, 'git.resolver.agent.yaml');
        const raw = await fs.readFile(filePath, 'utf8');
        
        const def = parseYaml(raw);
        expect(def.id).toBe('agent.git.resolver');
        expect(def.name).toBe('Git Conflict Resolver & Submodule Synchronizer');
        expect(def.capabilities).toContain('git_conflict_resolution');
    });

    it('should parse and load db.tuner.agent.yaml flawlessly', async () => {
        const filePath = path.join(DEFINITIONS_DIR, 'db.tuner.agent.yaml');
        const raw = await fs.readFile(filePath, 'utf8');
        
        const def = parseYaml(raw);
        expect(def.id).toBe('agent.db.tuner');
        expect(def.name).toBe('Database Performance & SQL Optimization Tuning Specialist');
        expect(def.capabilities).toContain('sql_optimization');
    });

    it('should parse and load regex.optimizer.agent.yaml flawlessly', async () => {
        const filePath = path.join(DEFINITIONS_DIR, 'regex.optimizer.agent.yaml');
        const raw = await fs.readFile(filePath, 'utf8');
        
        const def = parseYaml(raw);
        expect(def.id).toBe('agent.regex.optimizer');
        expect(def.name).toBe('RegEx Optimizer & Pattern Synthesizer Agent');
        expect(def.capabilities).toContain('regex_optimization');
        expect(def.capabilities).toContain('redos_audit');
    });

    it('should parse and load k8s.compiler.agent.yaml flawlessly', async () => {
        const filePath = path.join(DEFINITIONS_DIR, 'k8s.compiler.agent.yaml');
        const raw = await fs.readFile(filePath, 'utf8');
        
        const def = parseYaml(raw);
        expect(def.id).toBe('agent.k8s.compiler');
        expect(def.name).toBe('Kubernetes Manifest & Helm Compiler Agent');
        expect(def.capabilities).toContain('k8s_manifest_generation');
        expect(def.capabilities).toContain('helm_template_compilation');
    });

    it('should parse and load gcp.specialist.agent.yaml flawlessly', async () => {
        const filePath = path.join(DEFINITIONS_DIR, 'gcp.specialist.agent.yaml');
        const raw = await fs.readFile(filePath, 'utf8');
        
        const def = parseYaml(raw);
        expect(def.id).toBe('agent.gcp.specialist');
        expect(def.name).toBe('Google Cloud Platform (GCP) Solutions Architect & Specialist');
        expect(def.capabilities).toContain('gcp_solutions_architecture');
        expect(def.capabilities).toContain('gcloud_cli_commands');
        expect(def.preamble).toContain('You are an expert Google Cloud Solutions Architect');
    });

    it('should successfully build BaseSpecialistAgent subclasses from parsed definitions', async () => {
        const regexPath = path.join(DEFINITIONS_DIR, 'regex.optimizer.agent.yaml');
        const k8sPath = path.join(DEFINITIONS_DIR, 'k8s.compiler.agent.yaml');
        const gcpPath = path.join(DEFINITIONS_DIR, 'gcp.specialist.agent.yaml');
        
        const regexAgent = createAgentFromDefinition(parseYaml(await fs.readFile(regexPath, 'utf8')));
        const k8sAgent = createAgentFromDefinition(parseYaml(await fs.readFile(k8sPath, 'utf8')));
        const gcpAgent = createAgentFromDefinition(parseYaml(await fs.readFile(gcpPath, 'utf8')));
        
        expect(regexAgent.name).toBe('RegEx Optimizer & Pattern Synthesizer Agent');
        expect(regexAgent.manifest.id).toBe('agent.regex.optimizer');
        
        expect(k8sAgent.name).toBe('Kubernetes Manifest & Helm Compiler Agent');
        expect(k8sAgent.manifest.id).toBe('agent.k8s.compiler');
        
        expect(gcpAgent.name).toBe('Google Cloud Platform (GCP) Solutions Architect & Specialist');
        expect(gcpAgent.manifest.id).toBe('agent.gcp.specialist');
    });

    it('should register new YAML agents in agentRegistry and capabilityRouter successfully', async () => {
        const regexPath = path.join(DEFINITIONS_DIR, 'regex.optimizer.agent.yaml');
        const k8sPath = path.join(DEFINITIONS_DIR, 'k8s.compiler.agent.yaml');
        const gcpPath = path.join(DEFINITIONS_DIR, 'gcp.specialist.agent.yaml');
        
        const regexAgent = createAgentFromDefinition(parseYaml(await fs.readFile(regexPath, 'utf8')));
        const k8sAgent = createAgentFromDefinition(parseYaml(await fs.readFile(k8sPath, 'utf8')));
        const gcpAgent = createAgentFromDefinition(parseYaml(await fs.readFile(gcpPath, 'utf8')));
        
        // Dynamically register in router
        capabilityRouter.registerAgent(regexAgent, regexAgent.manifest.capabilities);
        capabilityRouter.registerAgent(k8sAgent, k8sAgent.manifest.capabilities);
        capabilityRouter.registerAgent(gcpAgent, gcpAgent.manifest.capabilities);
        
        // Verify registry registration
        const allAgents = agentRegistry.list();
        const regexReg = allAgents.find(a => a.name === regexAgent.name);
        const k8sReg = allAgents.find(a => a.name === k8sAgent.name);
        const gcpReg = allAgents.find(a => a.name === gcpAgent.name);
        
        expect(regexReg).toBeDefined();
        expect(regexReg.capabilities).toContain('regex_optimization');
        
        expect(k8sReg).toBeDefined();
        expect(k8sReg.capabilities).toContain('k8s_manifest_generation');
        
        expect(gcpReg).toBeDefined();
        expect(gcpReg.capabilities).toContain('gcp_solutions_architecture');
    });

    it('should isolate JS code execution in a dedicated agent container using CodeExecutionSandbox', async () => {
        const testCode = "console.log('Isolated execution verification');";
        
        // Execute code under the custom 'agent.typescript.typing' environment
        const result = await CodeExecutionSandbox.execute(testCode, {
            agentId: 'agent.typescript.typing'
        });
        
        expect(result.success).toBe(true);
        expect(typeof result.isMock).toBe('boolean'); 
        expect(result.logs).toContain('Isolated execution verification');
        
        // Verify that the workspace path exists and is partitioned per agent
        const cleanAgentId = 'agent_typescript_typing';
        const expectedWorkspaceDir = path.resolve(`./logs/workspaces/agent_${cleanAgentId}`);
        const dirStats = await fs.stat(expectedWorkspaceDir);
        expect(dirStats.isDirectory()).toBe(true);
    }, 30000);

    it('should isolate Python code execution in a dedicated agent workspace through GoogleDynamicSessionsService fallback', async () => {
        const testPythonCode = "print('Isolated python execution')";
        
        // Execute python fallback under the 'agent.git.resolver' environment
        const result = await dynamicSessionsService._executeCodeLocal(testPythonCode, 'python', {
            agentId: 'agent.git.resolver'
        });
        
        expect(result.success).toBe(true);
        expect(result.status).toBe('OK');
        
        // Verify that the workspace path exists and is partitioned for the git resolver
        const cleanAgentId = 'agent_git_resolver';
        const expectedWorkspaceDir = path.resolve(`./logs/workspaces/agent_${cleanAgentId}`);
        const dirStats = await fs.stat(expectedWorkspaceDir);
        expect(dirStats.isDirectory()).toBe(true);
    }, 30000);
});
