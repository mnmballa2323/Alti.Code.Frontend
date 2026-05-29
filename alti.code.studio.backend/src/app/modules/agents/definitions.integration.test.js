import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml, createAgentFromDefinition } from './yaml_agent_loader.js';
import { capabilityRouter } from './capability.router.js';
import { agentRegistry } from './agent.registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');

describe('Declarative YAML Agent Integration & Routing System', () => {
    it('should parse and load git.resolver.agent.yaml flawlessly', async () => {
        const filePath = path.join(DEFINITIONS_DIR, 'git.resolver.agent.yaml');
        const raw = await fs.readFile(filePath, 'utf8');
        
        const def = parseYaml(raw);
        expect(def.id).toBe('agent.git.resolver');
        expect(def.name).toBe('Git Conflict Resolver & Submodule Synchronizer');
        expect(def.version).toBe('1.0.0');
        expect(def.capabilities).toContain('git_conflict_resolution');
        expect(def.capabilities).toContain('merge_marker_parsing');
        expect(def.capabilities).toContain('submodule_sync');
        expect(def.preamble).toContain('You are an expert Git Systems Engineer');
    });

    it('should parse and load db.tuner.agent.yaml flawlessly', async () => {
        const filePath = path.join(DEFINITIONS_DIR, 'db.tuner.agent.yaml');
        const raw = await fs.readFile(filePath, 'utf8');
        
        const def = parseYaml(raw);
        expect(def.id).toBe('agent.db.tuner');
        expect(def.name).toBe('Database Performance & SQL Optimization Tuning Specialist');
        expect(def.version).toBe('1.0.0');
        expect(def.capabilities).toContain('sql_optimization');
        expect(def.capabilities).toContain('query_plan_analysis');
        expect(def.capabilities).toContain('index_design');
        expect(def.preamble).toContain('You are an expert Database Administrator');
    });

    it('should successfully build BaseSpecialistAgent subclasses from parsed definitions', async () => {
        const gitPath = path.join(DEFINITIONS_DIR, 'git.resolver.agent.yaml');
        const dbPath = path.join(DEFINITIONS_DIR, 'db.tuner.agent.yaml');
        
        const gitRaw = await fs.readFile(gitPath, 'utf8');
        const dbRaw = await fs.readFile(dbPath, 'utf8');
        
        const gitAgent = createAgentFromDefinition(parseYaml(gitRaw));
        const dbAgent = createAgentFromDefinition(parseYaml(dbRaw));
        
        expect(gitAgent.name).toBe('Git Conflict Resolver & Submodule Synchronizer');
        expect(gitAgent.manifest.id).toBe('agent.git.resolver');
        expect(gitAgent.manifest.capabilities).toContain('git_conflict_resolution');
        
        expect(dbAgent.name).toBe('Database Performance & SQL Optimization Tuning Specialist');
        expect(dbAgent.manifest.id).toBe('agent.db.tuner');
        expect(dbAgent.manifest.capabilities).toContain('sql_optimization');
    });

    it('should register new YAML agents in agentRegistry and capabilityRouter successfully', async () => {
        const gitPath = path.join(DEFINITIONS_DIR, 'git.resolver.agent.yaml');
        const dbPath = path.join(DEFINITIONS_DIR, 'db.tuner.agent.yaml');
        
        const gitRaw = await fs.readFile(gitPath, 'utf8');
        const dbRaw = await fs.readFile(dbPath, 'utf8');
        
        const gitAgent = createAgentFromDefinition(parseYaml(gitRaw));
        const dbAgent = createAgentFromDefinition(parseYaml(dbRaw));
        
        // Dynamically register in router
        capabilityRouter.registerAgent(gitAgent, gitAgent.manifest.capabilities);
        capabilityRouter.registerAgent(dbAgent, dbAgent.manifest.capabilities);
        
        // Verify registry registration
        const allAgents = agentRegistry.list();
        const gitReg = allAgents.find(a => a.name === gitAgent.name);
        const dbReg = allAgents.find(a => a.name === dbAgent.name);
        
        expect(gitReg).toBeDefined();
        expect(gitReg.capabilities).toContain('git_conflict_resolution');
        
        expect(dbReg).toBeDefined();
        expect(dbReg.capabilities).toContain('sql_optimization');
    });
});
