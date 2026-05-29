import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml, createAgentFromDefinition } from './yaml_agent_loader.js';
import { capabilityRouter } from './capability.router.js';
import { agentRegistry } from './agent.registry.js';
import { CodeExecutionSandbox } from '../sandbox/code_execution_sandbox.js';
import { dynamicSessionsService } from '../googleCloud/dynamic_sessions.service.js';
import { gcsService } from '../googleCloud/storage.service.js';
import { pubsubService } from '../googleCloud/pubsub.service.js';
import { evolutionService } from '../../../shared/evolution.service.js';

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

    describe('Google Cloud Platform native Infrastructure (Storage & Pub/Sub)', () => {
        it('should successfully upload and download content using GoogleCloudStorageService sandbox fallback', async () => {
            const bucketName = 'test-bucket';
            const fileName = 'trajectories/test-trajectory.json';
            const testPayload = JSON.stringify({ key: 'test-value', timestamp: Date.now() });

            // 1. Upload content
            const uploadSuccess = await gcsService.uploadContent(bucketName, fileName, testPayload);
            expect(uploadSuccess).toBe(true);

            // 2. Download content and verify consistency
            const downloadedContent = await gcsService.downloadContent(bucketName, fileName);
            expect(downloadedContent).toBe(testPayload);

            // 3. Verify that it was correctly archived under the local fallback directory
            const expectedLocalPath = path.resolve(`./logs/gcs_mock/${bucketName}/${fileName}`);
            const stats = await fs.stat(expectedLocalPath);
            expect(stats.isFile()).toBe(true);
        });

        it('should publish events and route them to subscribers using GooglePubSubService fallback', async () => {
            const topicName = 'test-topic';
            const subName = 'test-topic-sub';
            const testPayload = { message: 'Hello from GCP Pub/Sub Integration Test', test: true };

            let receivedPayload = null;
            const messagePromise = new Promise((resolve) => {
                pubsubService.subscribe(subName, topicName, (payload) => {
                    receivedPayload = payload;
                    resolve();
                });
            });

            // Publish message
            const messageId = await pubsubService.publishEvent(topicName, testPayload);
            expect(messageId).toBeDefined();
            expect(typeof messageId).toBe('string');

            // Wait for event handler routing
            await messagePromise;
            expect(receivedPayload).toEqual(testPayload);
        });

        it('should archive style weights to GCS and broadcast evolution event via Pub/Sub when evolutionService updates style weights', async () => {
            const testWorkspaceDir = path.resolve('./logs/workspaces/test_evolution_workspace');
            await fs.mkdir(testWorkspaceDir, { recursive: true });

            const newRules = ['Ensure all functions use standard arrow syntax style', 'Bypass local loops in DB query'];
            
            // Set up Pub/Sub subscription to watch for the broadcast event
            let evolutionEventReceived = null;
            const evolutionPromise = new Promise((resolve) => {
                pubsubService.subscribe('alti-swarm-events-sub', 'alti-swarm-events', (payload) => {
                    if (payload.event === 'STYLE_WEIGHTS_EVOLVED') {
                        evolutionEventReceived = payload;
                        resolve();
                    }
                });
            });

            // Trigger the internal weights update
            await evolutionService._updateStyleWeights(testWorkspaceDir, newRules);

            // 1. Verify local weights file was generated
            const weightsPath = path.join(testWorkspaceDir, '.alti-style-weights.json');
            const fileContent = await fs.readFile(weightsPath, 'utf8');
            const parsedWeights = JSON.parse(fileContent);
            expect(parsedWeights.enforced_human_styles).toContain(newRules[0]);

            // 2. Verify that weights were archived to GCS sandbox mock
            const expectedGcsMockPath = path.resolve('./logs/gcs_mock/alti-style-registry/weights/global-style-weights.json');
            const gcsMockStats = await fs.stat(expectedGcsMockPath);
            expect(gcsMockStats.isFile()).toBe(true);

            // 3. Verify that Pub/Sub evolution event was successfully published and routed
            await evolutionPromise;
            expect(evolutionEventReceived).toBeDefined();
            expect(evolutionEventReceived.event).toBe('STYLE_WEIGHTS_EVOLVED');
            expect(evolutionEventReceived.newRules).toEqual(newRules);

            // Cleanup test directory
            await fs.rm(testWorkspaceDir, { recursive: true, force: true });
        });
    });
});
