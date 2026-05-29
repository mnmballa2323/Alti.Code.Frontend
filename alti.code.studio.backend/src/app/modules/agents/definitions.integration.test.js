import { describe, it, expect, vi } from 'vitest';
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
import { orchestrator } from './orchestrator.js';
import { triadDebateChamberService } from './triad_debate_chamber.service.js';
import { aiProvider } from '../ai/ai.provider.js';
import { autonomousRepairDaemon } from './autonomous_repair_daemon.js';
import { gcpSentinel } from '../googleCloud/gcpSentinel.service.js';
import { swarmBrain } from './swarm_brain.js';

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

    describe('Swarm Conductor Meta-Cognitive Self-Healing & Refinement Gate', () => {
        it('should intercept step failures, convene Triad Debate, and successfully heal the execution on retry', async () => {
            const step = {
                agent: 'agent.regex.optimizer',
                description: 'Compile high performance safe regex',
                data: { pattern: '(a+)+' }
            };
            const context = { planId: 'test_heal_plan' };

            // 1. Mock _dispatchStep to fail on first attempt, and succeed on second attempt
            let callCount = 0;
            const originalDispatch = orchestrator._dispatchStep;
            orchestrator._dispatchStep = vi.fn().mockImplementation(async (s, ctx) => {
                callCount++;
                if (callCount === 1) {
                    return { agent: s.agent, error: 'Database Queue Timeout Error' };
                }
                return { agent: s.agent, jobId: 'mock_job_99', status: 'dispatched' };
            });

            // 2. Mock Triad Debate Chamber to avoid real Vertex/Gemini API calls
            const originalInitiateDebate = triadDebateChamberService.initiateDebate;
            triadDebateChamberService.initiateDebate = vi.fn().mockResolvedValue(
                'HEALED: Inject standard limits and eliminate nested quantifiers.'
            );

            // 3. Execute healed step
            const result = await orchestrator._healAndExecuteStep(step, context);

            // 4. Verification Assertions
            expect(callCount).toBe(2); // Retried once
            expect(result.jobId).toBe('mock_job_99');
            expect(step.description).toContain('Healed on attempt 2');
            expect(step.data.healedInstructions).toBe('HEALED: Inject standard limits and eliminate nested quantifiers.');
            expect(triadDebateChamberService.initiateDebate).toHaveBeenCalled();

            // Restore original methods
            orchestrator._dispatchStep = originalDispatch;
            triadDebateChamberService.initiateDebate = originalInitiateDebate;
        });

        it('should reject syntactically invalid code and autonomously run auto-refinement loop to convergence', async () => {
            const planId = 'test_refine_plan';
            const context = {
                generatedCode: 'function brokenSyntax( {' // Throwing parser syntax error
            };

            // 1. Mock AI Provider reason to return clean, syntactically correct code
            const originalReason = aiProvider.reason;
            aiProvider.reason = vi.fn().mockResolvedValue(
                'function brokenSyntax() { return "healed and syntax valid"; }'
            );

            // 2. Execute verification and refinement
            const evalResult = await orchestrator._evaluateAndRefine(planId, [], context);

            // 3. Verification Assertions
            expect(evalResult.success).toBe(true);
            expect(evalResult.complexity).toBeDefined();
            expect(context.generatedCode).toContain('healed and syntax valid');
            expect(aiProvider.reason).toHaveBeenCalled();

            // Restore original method
            aiProvider.reason = originalReason;
        });
    });

    describe('Autonomous DevSecOps SRE Swarm & GCP Sentinel Security Gates', () => {
        it('should successfully patrol simulated logs, remediate crashes, verify safety, and archive post-mortems', async () => {
            // 1. Setup simulated error log file
            const simulatedLogFile = path.resolve('./logs/production_simulated_errors.log');
            await fs.mkdir(path.dirname(simulatedLogFile), { recursive: true });
            await fs.writeFile(simulatedLogFile, 'Error: UnhandledPromiseRejection: Database connection lost at pool.js:12\n', 'utf8');

            // 2. Mock swarmBrain.executeTask to return clean patch
            const originalExecuteTask = swarmBrain.executeTask;
            swarmBrain.executeTask = vi.fn().mockResolvedValue(
                '// Remediated code patch\nfunction connectDb() { return "healed patch data"; }'
            );

            // 3. Mock GCS and Pub/Sub mesh to capture events without network calls
            const originalGcsUpload = gcsService.uploadContent;
            let capturedGcsPath = null;
            let capturedGcsReport = null;
            gcsService.uploadContent = vi.fn().mockImplementation(async (bucket, filename, content) => {
                capturedGcsPath = `gs://${bucket}/${filename}`;
                capturedGcsReport = JSON.parse(content);
                return true;
            });

            const originalPubSubPublish = pubsubService.publishEvent;
            let capturedPubSubEvent = null;
            pubsubService.publishEvent = vi.fn().mockImplementation(async (topic, payload) => {
                capturedPubSubEvent = payload;
                return 'mock-remediation-msg-id';
            });

            // 4. Trigger simulated log scan
            await autonomousRepairDaemon.scanLocalLogs();

            // 5. Verification Assertions
            expect(swarmBrain.executeTask).toHaveBeenCalled();
            expect(capturedGcsPath).toContain('gs://alti-incident-vault/incidents/inc_');
            expect(capturedGcsReport.status).toBe('RESOLVED');
            expect(capturedGcsReport.remediationPatch).toContain('healed patch data');
            expect(capturedPubSubEvent.event).toBe('INCIDENT_REMEDIATED');

            // Cleanup local log
            await fs.rm(simulatedLogFile, { force: true });

            // Restore mocks
            swarmBrain.executeTask = originalExecuteTask;
            gcsService.uploadContent = originalGcsUpload;
            pubsubService.publishEvent = originalPubSubPublish;
        });

        it('should trigger pre-flight Sentinel audits and aggressively abort deployments containing hardcoded secrets', async () => {
            const insecurePatch = `
            // Insecure patch containing plain-text keys
            const GCP_API_KEY = "AIzaSyD-mockKey-1234567890abcdefghijklm";
            function initialize() { console.log(GCP_API_KEY); }
            `;

            // Enforce audit and expect to reject plain-text keys
            await expect(gcpSentinel.auditDeployment(insecurePatch)).rejects.toThrow(
                'CRITICAL: Plain-text secrets detected in deployment payload. Mission aborted.'
            );
        });
    });

    describe('Local AST Dependency Graph Crawler & Architectural Patrol', () => {
        it('should parse mock dependency files, construct directed edges, and calculate accurate in-degree coupling centrality', async () => {
            const tempDir = path.resolve('./logs/ast_test_temp');
            await fs.mkdir(tempDir, { recursive: true });

            // File C: The ultimate god object (imported by A and B)
            await fs.writeFile(path.join(tempDir, 'fileC.js'), 'console.log("no imports");', 'utf8');

            // File B: Imported by A, imports C
            await fs.writeFile(path.join(tempDir, 'fileB.js'), 'import "./fileC.js";', 'utf8');

            // File A: Imports B and C
            await fs.writeFile(path.join(tempDir, 'fileA.js'), 'import "./fileB.js";\nimport "./fileC.js";', 'utf8');

            const centralities = await autonomousRepairDaemon.calculateLocalDependencyCentrality(tempDir);

            // Cleanup temp files
            await fs.rm(tempDir, { recursive: true, force: true });

            // Assert C is the most highly coupled
            const nodeC = centralities.find(n => n.name === 'fileC.js');
            const nodeB = centralities.find(n => n.name === 'fileB.js');
            const nodeA = centralities.find(n => n.name === 'fileA.js');

            expect(nodeC).toBeDefined();
            expect(nodeC.score).toBe(2); // Imported by B and A

            expect(nodeB).toBeDefined();
            expect(nodeB.score).toBe(1); // Imported by A

            expect(nodeA).toBeDefined();
            expect(nodeA.score).toBe(0); // Not imported
        });

        it('should successfully fallback to local AST crawler on Neo4j GDS error, convene Triad debate, and trigger Strangler Fig refactoring', async () => {
            // 1. Mock calculateLocalDependencyCentrality to return a mock God Object above threshold
            const originalLocalCrawl = autonomousRepairDaemon.calculateLocalDependencyCentrality;
            autonomousRepairDaemon.calculateLocalDependencyCentrality = vi.fn().mockResolvedValue([
                { name: 'god_block_component.js', filePath: '/src/god_block_component.js', score: 5 }
            ]);

            // 2. Mock debate chamber consensus
            const originalInitiateDebate = triadDebateChamberService.initiateDebate;
            triadDebateChamberService.initiateDebate = vi.fn().mockResolvedValue(
                'CONSTRUCT STRANGLER FIG: Decouple God Block into modular controllers.'
            );

            // 3. Mock SwarmBrain task executor
            const originalExecuteTask = swarmBrain.executeTask;
            swarmBrain.executeTask = vi.fn().mockResolvedValue(
                '// Autonomously generated Refactoring Plan\nexport function subtaskA() {}'
            );

            // 4. Mock GCS and Pub/Sub uploads to verify output archiving
            const originalGcsUpload = gcsService.uploadContent;
            let capturedGcsPath = null;
            let capturedGcsReport = null;
            gcsService.uploadContent = vi.fn().mockImplementation(async (bucket, filename, content) => {
                capturedGcsPath = `gs://${bucket}/${filename}`;
                capturedGcsReport = JSON.parse(content);
                return true;
            });

            const originalPubSubPublish = pubsubService.publishEvent;
            let capturedPubSubEvent = null;
            pubsubService.publishEvent = vi.fn().mockImplementation(async (topic, payload) => {
                capturedPubSubEvent = payload;
                return 'mock-strangler-msg-id';
            });

            // 5. Trigger scanForArchitecturalDecay (will trigger GDS error automatically since Neo4j GDS import or service will throw in test mode)
            await autonomousRepairDaemon.scanForArchitecturalDecay();

            // 6. Verify assertions
            expect(triadDebateChamberService.initiateDebate).toHaveBeenCalled();
            expect(swarmBrain.executeTask).toHaveBeenCalled();
            expect(capturedGcsPath).toBe('gs://alti-incident-vault/blueprints/strangler-god_block_component.js.json');
            expect(capturedGcsReport.status).toBe('Blueprinted');
            expect(capturedGcsReport.decouplingConsensus).toContain('CONSTRUCT STRANGLER FIG');
            expect(capturedGcsReport.refactoringPlan).toContain('export function subtaskA()');
            expect(capturedPubSubEvent.event).toBe('STRANGLER_FIG_BLUEPRINTED');
            expect(capturedPubSubEvent.godObjectName).toBe('god_block_component.js');

            // Restore original methods
            autonomousRepairDaemon.calculateLocalDependencyCentrality = originalLocalCrawl;
            triadDebateChamberService.initiateDebate = originalInitiateDebate;
            swarmBrain.executeTask = originalExecuteTask;
            gcsService.uploadContent = originalGcsUpload;
            pubsubService.publishEvent = originalPubSubPublish;
        });
    });
});
