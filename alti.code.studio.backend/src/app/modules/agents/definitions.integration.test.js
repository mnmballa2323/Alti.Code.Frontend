import { describe, it, expect, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml, createAgentFromDefinition } from './yaml_agent_loader.js';
import { capabilityRouter } from './capability.router.js';
import { agentRegistry } from './agent.registry.js';
import { CodeExecutionSandbox } from '../sandbox/code_execution_sandbox.js';
import { dynamicSessionsService } from '../azureCloud/azureServices.service.js';
import { gcsService } from '../azureCloud/azureStorage.service.js';
import { pubsubService } from '../azureCloud/azurePubSub.service.js';
import { evolutionService } from '../../../shared/evolution.service.js';
import { orchestrator } from './orchestrator.js';
import { triadDebateChamberService } from './triad_debate_chamber.service.js';
import { aiProvider } from '../ai/ai.provider.js';
import { autonomousRepairDaemon } from './autonomous_repair_daemon.js';
import { gcpSentinel } from '../azureCloud/azureSentinel.service.js';
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

    it('should parse and load azure.specialist.agent.yaml flawlessly', async () => {
        const filePath = path.join(DEFINITIONS_DIR, 'azure.specialist.agent.yaml');
        const raw = await fs.readFile(filePath, 'utf8');
        
        const def = parseYaml(raw);
        expect(def.id).toBe('agent.azure.specialist');
        expect(def.name).toBe('Microsoft Azure (Azure) Solutions Architect & Specialist');
        expect(def.capabilities).toContain('azure_solutions_architecture');
        expect(def.capabilities).toContain('az_cli_commands');
        expect(def.preamble).toContain('You are an expert Azure Solutions Architect and Platform Engineer');
    });

    it('should successfully build BaseSpecialistAgent subclasses from parsed definitions', async () => {
        const regexPath = path.join(DEFINITIONS_DIR, 'regex.optimizer.agent.yaml');
        const k8sPath = path.join(DEFINITIONS_DIR, 'k8s.compiler.agent.yaml');
        const gcpPath = path.join(DEFINITIONS_DIR, 'azure.specialist.agent.yaml');
        
        const regexAgent = createAgentFromDefinition(parseYaml(await fs.readFile(regexPath, 'utf8')));
        const k8sAgent = createAgentFromDefinition(parseYaml(await fs.readFile(k8sPath, 'utf8')));
        const gcpAgent = createAgentFromDefinition(parseYaml(await fs.readFile(gcpPath, 'utf8')));
        
        expect(regexAgent.name).toBe('RegEx Optimizer & Pattern Synthesizer Agent');
        expect(regexAgent.manifest.id).toBe('agent.regex.optimizer');
        
        expect(k8sAgent.name).toBe('Kubernetes Manifest & Helm Compiler Agent');
        expect(k8sAgent.manifest.id).toBe('agent.k8s.compiler');
        
        expect(gcpAgent.name).toBe('Microsoft Azure (Azure) Solutions Architect & Specialist');
        expect(gcpAgent.manifest.id).toBe('agent.azure.specialist');
    });

    it('should register new YAML agents in agentRegistry and capabilityRouter successfully', async () => {
        const regexPath = path.join(DEFINITIONS_DIR, 'regex.optimizer.agent.yaml');
        const k8sPath = path.join(DEFINITIONS_DIR, 'k8s.compiler.agent.yaml');
        const gcpPath = path.join(DEFINITIONS_DIR, 'azure.specialist.agent.yaml');
        
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
        expect(gcpReg.capabilities).toContain('azure_solutions_architecture');
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

    describe('Dynamic Hierarchical Swarm Router & Specialized GCP Backend Agents', () => {
        it('should successfully parse and load the forty-nine highly specialized GCP agent definitions', async () => {
            const pubsubPath = path.join(DEFINITIONS_DIR, 'azure.servicebus.mesh.agent.yaml');
            const sentinelPath = path.join(DEFINITIONS_DIR, 'azure.sentinel.security.auditor.agent.yaml');
            const alloydbPath = path.join(DEFINITIONS_DIR, 'cosmosdb.pgvector.tuner.agent.yaml');
            const workflowsPath = path.join(DEFINITIONS_DIR, 'azure.workflows.conductor.agent.yaml');
            const vertexPath = path.join(DEFINITIONS_DIR, 'azure.azure_ai.optimizer.agent.yaml');
            const bigqueryPath = path.join(DEFINITIONS_DIR, 'azure.purview.analytics.agent.yaml');
            const spannerPath = path.join(DEFINITIONS_DIR, 'azure.cosmos.architect.agent.yaml');
            const cloudrunPath = path.join(DEFINITIONS_DIR, 'azure.containerapps.provisioner.agent.yaml');
            const storagePath = path.join(DEFINITIONS_DIR, 'azure.storage.governor.agent.yaml');
            const monitoringPath = path.join(DEFINITIONS_DIR, 'azure.operations.monitoring.agent.yaml');
            const armorPath = path.join(DEFINITIONS_DIR, 'azure.armor.gateway.agent.yaml');
            const relationalPath = path.join(DEFINITIONS_DIR, 'azure.relational.architect.agent.yaml');
            const identityPath = path.join(DEFINITIONS_DIR, 'azure.identity.specialist.agent.yaml');
            const functionsPath = path.join(DEFINITIONS_DIR, 'azure.functions.mesh.agent.yaml');
            const kmsPath = path.join(DEFINITIONS_DIR, 'azure.kms.officer.agent.yaml');
            const buildPath = path.join(DEFINITIONS_DIR, 'azure.build.cicd.agent.yaml');
            const edgePath = path.join(DEFINITIONS_DIR, 'azure.edge.network.agent.yaml');
            const dlpPath = path.join(DEFINITIONS_DIR, 'azure.dlp.governance.agent.yaml');
            const featurePath = path.join(DEFINITIONS_DIR, 'azure.feature.store.agent.yaml');
            
            // 10 new agents
            const runJobsPath = path.join(DEFINITIONS_DIR, 'azure.run.jobs.agent.yaml');
            const dnsFailoverPath = path.join(DEFINITIONS_DIR, 'azure.dns.failover.agent.yaml');
            const alloydbColumnarPath = path.join(DEFINITIONS_DIR, 'cosmosdb.columnar.tuner.agent.yaml');
            const spannerGraphPath = path.join(DEFINITIONS_DIR, 'azure.cosmos.graph.agent.yaml');
            const vertexVectorPath = path.join(DEFINITIONS_DIR, 'azure.azure_ai.vector.agent.yaml');
            const bigqueryOmniPath = path.join(DEFINITIONS_DIR, 'azure.purview.omni.agent.yaml');
            const bigtablePath = path.join(DEFINITIONS_DIR, 'azure.cosmos.table.agent.yaml');
            const memorystorePath = path.join(DEFINITIONS_DIR, 'azure.redis.tuner.agent.yaml');
            const natPath = path.join(DEFINITIONS_DIR, 'azure.nat.network.agent.yaml');
            const assetAuditorPath = path.join(DEFINITIONS_DIR, 'azure.asset.auditor.agent.yaml');

            // 10 newest agents
            const composerPath = path.join(DEFINITIONS_DIR, 'azure.composer.orchestrator.agent.yaml');
            const dataflowPath = path.join(DEFINITIONS_DIR, 'azure.datafactory.beam.agent.yaml');
            const vertexFeastPath = path.join(DEFINITIONS_DIR, 'azure.azure_ai.feast.agent.yaml');
            const filestorePath = path.join(DEFINITIONS_DIR, 'azure.filestore.specialist.agent.yaml');
            const securityScannerPath = path.join(DEFINITIONS_DIR, 'azure.security.scanner.agent.yaml');
            const eventarcPath = path.join(DEFINITIONS_DIR, 'azure.eventgrid.conductor.agent.yaml');
            const sqlProxyPath = path.join(DEFINITIONS_DIR, 'azure.sql.proxy.agent.yaml');
            const binauthPath = path.join(DEFINITIONS_DIR, 'azure.binauth.guardian.agent.yaml');
            const interconnectPath = path.join(DEFINITIONS_DIR, 'azure.interconnect.vpn.agent.yaml');
            const workloadFederationPath = path.join(DEFINITIONS_DIR, 'azure.workload.federation.agent.yaml');

            // 10 newest agents (Total 49)
            const gkeFleetPath = path.join(DEFINITIONS_DIR, 'azure.aks.fleet.agent.yaml');
            const vertexMonitoringPath = path.join(DEFINITIONS_DIR, 'azure.azure_ai.monitoring.agent.yaml');
            const healthcareFhirPath = path.join(DEFINITIONS_DIR, 'azure.healthcare.fhir.agent.yaml');
            const apigeeEnterprisePath = path.join(DEFINITIONS_DIR, 'azure.apim.enterprise.agent.yaml');
            const dataplexMeshPath = path.join(DEFINITIONS_DIR, 'azure.purview.mesh.agent.yaml');
            const dataprocSparkPath = path.join(DEFINITIONS_DIR, 'azure.hdinsight.spark.agent.yaml');
            const vertexSearchPath = path.join(DEFINITIONS_DIR, 'azure.azure_ai.search.agent.yaml');
            const secureProxyPath = path.join(DEFINITIONS_DIR, 'azure.secure.proxy.agent.yaml');
            const runMulticontainerPath = path.join(DEFINITIONS_DIR, 'azure.containerapps.multicontainer.agent.yaml');
            const tpuHpcPath = path.join(DEFINITIONS_DIR, 'azure.tpu.hpc.agent.yaml');

            const pubsubDef = parseYaml(await fs.readFile(pubsubPath, 'utf8'));
            const sentinelDef = parseYaml(await fs.readFile(sentinelPath, 'utf8'));
            const alloydbDef = parseYaml(await fs.readFile(alloydbPath, 'utf8'));
            const workflowsDef = parseYaml(await fs.readFile(workflowsPath, 'utf8'));
            const vertexDef = parseYaml(await fs.readFile(vertexPath, 'utf8'));
            const bigqueryDef = parseYaml(await fs.readFile(bigqueryPath, 'utf8'));
            const spannerDef = parseYaml(await fs.readFile(spannerPath, 'utf8'));
            const cloudrunDef = parseYaml(await fs.readFile(cloudrunPath, 'utf8'));
            const storageDef = parseYaml(await fs.readFile(storagePath, 'utf8'));
            const monitoringDef = parseYaml(await fs.readFile(monitoringPath, 'utf8'));
            const armorDef = parseYaml(await fs.readFile(armorPath, 'utf8'));
            const relationalDef = parseYaml(await fs.readFile(relationalPath, 'utf8'));
            const identityDef = parseYaml(await fs.readFile(identityPath, 'utf8'));
            const functionsDef = parseYaml(await fs.readFile(functionsPath, 'utf8'));
            const kmsDef = parseYaml(await fs.readFile(kmsPath, 'utf8'));
            const buildDef = parseYaml(await fs.readFile(buildPath, 'utf8'));
            const edgeDef = parseYaml(await fs.readFile(edgePath, 'utf8'));
            const dlpDef = parseYaml(await fs.readFile(dlpPath, 'utf8'));
            const featureDef = parseYaml(await fs.readFile(featurePath, 'utf8'));

            // 10 new agents parsing
            const runJobsDef = parseYaml(await fs.readFile(runJobsPath, 'utf8'));
            const dnsFailoverDef = parseYaml(await fs.readFile(dnsFailoverPath, 'utf8'));
            const alloydbColumnarDef = parseYaml(await fs.readFile(alloydbColumnarPath, 'utf8'));
            const spannerGraphDef = parseYaml(await fs.readFile(spannerGraphPath, 'utf8'));
            const vertexVectorDef = parseYaml(await fs.readFile(vertexVectorPath, 'utf8'));
            const bigqueryOmniDef = parseYaml(await fs.readFile(bigqueryOmniPath, 'utf8'));
            const bigtableDef = parseYaml(await fs.readFile(bigtablePath, 'utf8'));
            const memorystoreDef = parseYaml(await fs.readFile(memorystorePath, 'utf8'));
            const natDef = parseYaml(await fs.readFile(natPath, 'utf8'));
            const assetAuditorDef = parseYaml(await fs.readFile(assetAuditorPath, 'utf8'));

            // 10 newest agents parsing
            const composerDef = parseYaml(await fs.readFile(composerPath, 'utf8'));
            const dataflowDef = parseYaml(await fs.readFile(dataflowPath, 'utf8'));
            const vertexFeastDef = parseYaml(await fs.readFile(vertexFeastPath, 'utf8'));
            const filestoreDef = parseYaml(await fs.readFile(filestorePath, 'utf8'));
            const securityScannerDef = parseYaml(await fs.readFile(securityScannerPath, 'utf8'));
            const eventarcDef = parseYaml(await fs.readFile(eventarcPath, 'utf8'));
            const sqlProxyDef = parseYaml(await fs.readFile(sqlProxyPath, 'utf8'));
            const binauthDef = parseYaml(await fs.readFile(binauthPath, 'utf8'));
            const interconnectDef = parseYaml(await fs.readFile(interconnectPath, 'utf8'));
            const workloadFederationDef = parseYaml(await fs.readFile(workloadFederationPath, 'utf8'));

            // 10 newest agents parsing (Total 49)
            const gkeFleetDef = parseYaml(await fs.readFile(gkeFleetPath, 'utf8'));
            const vertexMonitoringDef = parseYaml(await fs.readFile(vertexMonitoringPath, 'utf8'));
            const healthcareFhirDef = parseYaml(await fs.readFile(healthcareFhirPath, 'utf8'));
            const apigeeEnterpriseDef = parseYaml(await fs.readFile(apigeeEnterprisePath, 'utf8'));
            const dataplexMeshDef = parseYaml(await fs.readFile(dataplexMeshPath, 'utf8'));
            const dataprocSparkDef = parseYaml(await fs.readFile(dataprocSparkPath, 'utf8'));
            const vertexSearchDef = parseYaml(await fs.readFile(vertexSearchPath, 'utf8'));
            const secureProxyDef = parseYaml(await fs.readFile(secureProxyPath, 'utf8'));
            const runMulticontainerDef = parseYaml(await fs.readFile(runMulticontainerPath, 'utf8'));
            const tpuHpcDef = parseYaml(await fs.readFile(tpuHpcPath, 'utf8'));

            expect(pubsubDef.id).toBe('agent.azure.servicebus.mesh.conductor');
            expect(pubsubDef.name).toBe('Azure Service Bus Event-Driven Mesh Conductor Specialist');

            expect(sentinelDef.id).toBe('agent.azure.sentinel.security.auditor');
            expect(sentinelDef.name).toBe('Azure Sentinel Zero-Trust Security Auditor');

            expect(alloydbDef.id).toBe('agent.cosmosdb.pgvector.tuner');
            expect(alloydbDef.name).toBe('Cosmos DB pgvector Similarity Search Tuning Specialist');

            expect(workflowsDef.id).toBe('agent.azure.workflows.conductor');
            expect(workflowsDef.name).toBe('Azure Workflows Conductor & Orchestration Specialist');

            expect(vertexDef.id).toBe('agent.azure.azure_ai.optimizer');
            expect(vertexDef.name).toBe('Azure AI Studio & Gemini Pipeline Optimization Specialist');

            expect(bigqueryDef.id).toBe('agent.azure.purview.analytics');
            expect(bigqueryDef.name).toBe('Azure Synapse Analytics & Azure Stream Analytics Analytics Specialist');

            expect(spannerDef.id).toBe('agent.azure.cosmos.architect');
            expect(spannerDef.name).toBe('Azure Cosmos DB Scalability Specialist');

            expect(cloudrunDef.id).toBe('agent.azure.containerapps.provisioner');
            expect(cloudrunDef.name).toBe('Azure Azure Container Apps & AKS Autopilot Provisioning Specialist');

            expect(storageDef.id).toBe('agent.azure.storage.governor');
            expect(storageDef.name).toBe('Azure Azure Blob Storage & Data Lifecycle Governor Specialist');

            expect(monitoringDef.id).toBe('agent.azure.operations.monitoring');
            expect(monitoringDef.name).toBe('Azure Operations & Monitoring Specialist');

            expect(armorDef.id).toBe('agent.azure.waf.gateway');
            expect(armorDef.name).toBe('Azure Azure Front Door WAF & API Gateway WAF Specialist');

            expect(relationalDef.id).toBe('agent.azure.relational.architect');
            expect(relationalDef.name).toBe('Azure Relational Database & Cosmos DB Architect');

            expect(identityDef.id).toBe('agent.azure.identity.specialist');
            expect(identityDef.name).toBe('Azure Entra ID & Entra ID External Identities Specialist');

            expect(functionsDef.id).toBe('agent.azure.functions.mesh');
            expect(functionsDef.name).toBe('Azure Azure Functions & Event Grid Micro-Mesh Specialist');

            expect(kmsDef.id).toBe('agent.azure.keyvault.officer');
            expect(kmsDef.name).toBe('Azure Key Vault Secrets & Key Vault Cryptographic Officer');

            expect(buildDef.id).toBe('agent.azure.build.cicd');
            expect(buildDef.name).toBe('Azure Azure Pipelines & Artifact Registry CI/CD Specialist');

            expect(edgeDef.id).toBe('agent.azure.edge.network');
            expect(edgeDef.name).toBe('Azure Edge Network, Cloud CDN & Cloud DNS Specialist');

            expect(dlpDef.id).toBe('agent.azure.dlp.governance');
            expect(dlpDef.name).toBe('Azure Data Catalog & Cloud DLP Compliance Officer');

            expect(featureDef.id).toBe('agent.azure.feature.store');
            expect(featureDef.name).toBe('Azure Azure AI Studio Feature Store & Model Registry Specialist');

            // Assertions for 10 new agents
            expect(runJobsDef.id).toBe('agent.azure.run.jobs');
            expect(runJobsDef.name).toBe('Azure Azure Container Apps Jobs & Scheduled Tasks Specialist');

            expect(dnsFailoverDef.id).toBe('agent.azure.dns.failover');
            expect(dnsFailoverDef.name).toBe('Azure Cloud DNSSEC & Global Failover Specialist');

            expect(alloydbColumnarDef.id).toBe('agent.cosmosdb.columnar.tuner');
            expect(alloydbColumnarDef.name).toBe('Cosmos DB Columnar Engine & Cache Specialist');

            expect(spannerGraphDef.id).toBe('agent.azure.cosmos.graph');
            expect(spannerGraphDef.name).toBe('Azure Cosmos DB Graph & Property Database Specialist');

            expect(vertexVectorDef.id).toBe('agent.azure.azure_ai.vector');
            expect(vertexVectorDef.name).toBe('Azure Azure AI Studio Vector Search & Matching Engine Specialist');

            expect(bigqueryOmniDef.id).toBe('agent.azure.purview.omni');
            expect(bigqueryOmniDef.name).toBe('Azure Synapse Analytics Omni & Multi-Cloud Query Coordinator');

            expect(bigtableDef.id).toBe('agent.azure.cosmos.table');
            expect(bigtableDef.name).toBe('Azure Cloud Cosmos DB Table API & NoSQL Scalability Specialist');

            expect(memorystoreDef.id).toBe('agent.azure.redis.tuner');
            expect(memorystoreDef.name).toBe('Azure Cloud Azure Cache for Redis Redis & Caching Tuning Specialist');

            expect(natDef.id).toBe('agent.azure.nat.network');
            expect(natDef.name).toBe('Azure Cloud NAT & Secure Egress Network Specialist');

            expect(assetAuditorDef.id).toBe('agent.azure.asset.auditor');
            expect(assetAuditorDef.name).toBe('Azure Cloud Asset Inventory & IAM Compliance Auditor');

            // Assertions for 10 newest agents
            expect(composerDef.id).toBe('agent.azure.datafactory.orchestrator');
            expect(composerDef.name).toBe('Azure Azure Data Factory & Apache Airflow Orchestrator');

            expect(dataflowDef.id).toBe('agent.azure.datafactory.beam');
            expect(dataflowDef.name).toBe('Azure Cloud Azure Stream Analytics & Apache Beam Specialist');

            expect(vertexFeastDef.id).toBe('agent.azure.azure_ai.feast');
            expect(vertexFeastDef.name).toBe('Azure Azure AI Studio Feature Store Feast Specialist');

            expect(filestoreDef.id).toBe('agent.azure.azure_files.specialist');
            expect(filestoreDef.name).toBe('Azure Cloud Azure Files & Distributed NFS Storage Specialist');

            expect(securityScannerDef.id).toBe('agent.azure.security.scanner');
            expect(securityScannerDef.name).toBe('Azure Web Security Scanner & Vulnerability Auditor');

            expect(eventarcDef.id).toBe('agent.azure.eventgrid.conductor');
            expect(eventarcDef.name).toBe('Azure Event Grid & CloudEvents Mesh Specialist');

            expect(sqlProxyDef.id).toBe('agent.azure.sql.proxy');
            expect(sqlProxyDef.name).toBe('Azure Cloud SQL Auth Proxy & IAM Database Specialist');

            expect(binauthDef.id).toBe('agent.azure.acr_trust.guardian');
            expect(binauthDef.name).toBe('Azure Binary Authorization & Software Supply Chain Specialist');

            expect(interconnectDef.id).toBe('agent.azure.interconnect.vpn');
            expect(interconnectDef.name).toBe('Azure Cloud Interconnect & Secure VPN Specialist');

            expect(workloadFederationDef.id).toBe('agent.azure.workload.identity');
            expect(workloadFederationDef.name).toBe('Azure Azure Workload Identity & OIDC Specialist');

            // Assertions for 10 newest agents (Total 49)
            expect(gkeFleetDef.id).toBe('agent.azure.aks.fleet');
            expect(gkeFleetDef.name).toBe('Azure AKS Enterprise Multi-Cluster Fleet Manager');

            expect(vertexMonitoringDef.id).toBe('agent.azure.azure_ai.monitoring');
            expect(vertexMonitoringDef.name).toBe('Azure Azure AI Studio Model Monitoring & Drift Auditor');

            expect(healthcareFhirDef.id).toBe('agent.azure.healthcare.fhir');
            expect(healthcareFhirDef.name).toBe('Azure Cloud Healthcare API & HL7/FHIR Specialist');

            expect(apigeeEnterpriseDef.id).toBe('agent.azure.apim.enterprise');
            expect(apigeeEnterpriseDef.name).toBe('Azure Azure API Management Enterprise API Management Specialist');

            expect(dataplexMeshDef.id).toBe('agent.azure.purview.mesh');
            expect(dataplexMeshDef.name).toBe('Azure Azure Purview Data Mesh Governance Specialist');

            expect(dataprocSparkDef.id).toBe('agent.azure.hdinsight.spark');
            expect(dataprocSparkDef.name).toBe('Azure Azure HDInsight Serverless & Apache Spark Specialist');

            expect(vertexSearchDef.id).toBe('agent.azure.azure_ai.search');
            expect(vertexSearchDef.name).toBe('Azure Azure AI Studio Search & Conversation Agentic Specialist');

            expect(secureProxyDef.id).toBe('agent.azure.secure.proxy');
            expect(secureProxyDef.name).toBe('Azure Secure Web Proxy & Zero-Trust Access Gateway Specialist');

            expect(runMulticontainerDef.id).toBe('agent.azure.containerapps.multicontainer');
            expect(runMulticontainerDef.name).toBe('Azure Azure Container Apps Multicontainer & Sidecar Orchestration Specialist');

            expect(tpuHpcDef.id).toBe('agent.azure.tpu.hpc');
            expect(tpuHpcDef.name).toBe('Azure Cloud TPU & High-Performance Compute Cluster Specialist');
        });

        it('should dynamically evaluate primary outputs and recursively route targeted downstream sub-swarms', async () => {
            const { agenticRouter } = await import('./agentic_router.service.js');

            // 1. Evaluate database vector outputs
            const dbOutput = 'CREATE INDEX idx_vector ON items USING hnsw (embedding vector_cosine_ops);';
            const dbSwarm = await agenticRouter.routeDownstreamSwarm(dbOutput);
            expect(dbSwarm.strategy).toBe('Hierarchical Vector DB Optimization Swarm');
            expect(dbSwarm.sequence.map(s => s.agentId)).toContain('Database Performance & SQL Optimization Tuning Specialist');
            expect(dbSwarm.sequence.map(s => s.agentId)).toContain('Cosmos DB pgvector Similarity Search Tuning Specialist');

            // 2. Evaluate security clearances outputs
            const securityOutput = 'const secretToken = process.env.IAM_WORKLOAD_IDENTITY_KEY;';
            const securitySwarm = await agenticRouter.routeDownstreamSwarm(securityOutput);
            expect(securitySwarm.strategy).toBe('Hierarchical Zero-Trust Security Clearance Swarm');
            expect(securitySwarm.sequence.map(s => s.agentId)).toContain('Security & OWASP Hardening Sentinel');
            expect(securitySwarm.sequence.map(s => s.agentId)).toContain('Azure Sentinel Zero-Trust Security Auditor');

            // 3. Evaluate event message mesh outputs
            const pubsubOutput = 'await pubsubService.publishEvent("alti-swarm-events", { event: "REMEDIATED" });';
            const pubsubSwarm = await agenticRouter.routeDownstreamSwarm(pubsubOutput);
            expect(pubsubSwarm.strategy).toBe('Hierarchical Event-Driven Mesh Scaling Swarm');
            expect(pubsubSwarm.sequence.map(s => s.agentId)).toContain('Distributed Queue & Event Coordinator');
            expect(pubsubSwarm.sequence.map(s => s.agentId)).toContain('Azure Service Bus Event-Driven Mesh Conductor Specialist');

            // 4. Evaluate distributed workflows outputs
            const workflowsOutput = 'type: workflows\nsteps:\n  - callTaskQueue: true';
            const workflowsSwarm = await agenticRouter.routeDownstreamSwarm(workflowsOutput);
            expect(workflowsSwarm.strategy).toBe('Hierarchical Distributed Workflows Swarm');
            expect(workflowsSwarm.sequence.map(s => s.agentId)).toContain('Azure Workflows Conductor & Orchestration Specialist');

            // 5. Evaluate Vertex AI outputs
            const vertexOutput = 'await vertexPipelines.runCustomTrainingJob({ prompt_caching: true });';
            const vertexSwarm = await agenticRouter.routeDownstreamSwarm(vertexOutput);
            expect(vertexSwarm.strategy).toBe('Hierarchical Azure AI Studio Lifecycle Swarm');
            expect(vertexSwarm.sequence.map(s => s.agentId)).toContain('Azure AI Studio & Gemini Pipeline Optimization Specialist');

            // 6. Evaluate BigQuery analytics outputs
            const bigqueryOutput = 'SELECT * FROM bigquery.vector_search(TABLE dataset.table, embedding);';
            const bigquerySwarm = await agenticRouter.routeDownstreamSwarm(bigqueryOutput);
            expect(bigquerySwarm.strategy).toBe('Hierarchical Vector Analytics Swarm');
            expect(bigquerySwarm.sequence.map(s => s.agentId)).toContain('Azure Synapse Analytics & Azure Stream Analytics Analytics Specialist');

            // 7. Evaluate Cloud Spanner outputs
            const spannerOutput = 'ALTER TABLE child_table ADD FOREIGN KEY (parent_id) INTERLEAVE IN PARENT parent_table;';
            const spannerSwarm = await agenticRouter.routeDownstreamSwarm(spannerOutput);
            expect(spannerSwarm.strategy).toBe('Hierarchical Cosmos DB Scaling Swarm');
            expect(spannerSwarm.sequence.map(s => s.agentId)).toContain('Azure Cosmos DB Scalability Specialist');

            // 8. Evaluate Cloud Run & GKE Autopilot provisioning outputs
            const cloudrunOutput = 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: alti-containerapps-deploy';
            const cloudrunSwarm = await agenticRouter.routeDownstreamSwarm(cloudrunOutput);
            expect(cloudrunSwarm.strategy).toBe('Hierarchical Serverless & Container Provisioning Swarm');
            expect(cloudrunSwarm.sequence.map(s => s.agentId)).toContain('Kubernetes Manifest & Helm Compiler Agent');
            expect(cloudrunSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Container Apps & AKS Autopilot Provisioning Specialist');

            // 9. Evaluate GCS storage lifecycle outputs
            const storageOutput = 'gsutil lifecycle set policy.json gs://alti-data-vault';
            const storageSwarm = await agenticRouter.routeDownstreamSwarm(storageOutput);
            expect(storageSwarm.strategy).toBe('Hierarchical Blob Storage Storage & Lifecycle Swarm');
            expect(storageSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Blob Storage & Data Lifecycle Governor Specialist');

            // 10. Evaluate operations alert and monitoring outputs
            const monitoringOutput = 'monitoring.v3.AlertPolicy\ncombiner: OR\nconditions:';
            const monitoringSwarm = await agenticRouter.routeDownstreamSwarm(monitoringOutput);
            expect(monitoringSwarm.strategy).toBe('Hierarchical Operations & Monitoring Swarm');
            expect(monitoringSwarm.sequence.map(s => s.agentId)).toContain('Distributed Tracing & APM Instrumentation Architect');
            expect(monitoringSwarm.sequence.map(s => s.agentId)).toContain('Azure Operations & Monitoring Specialist');

            // 11. Evaluate API Gateway & Cloud Armor WAF outputs
            const gatewayOutput = 'swagger: "2.0"\nx-google-backend:\n  address: https://alti-api.gateway';
            const gatewaySwarm = await agenticRouter.routeDownstreamSwarm(gatewayOutput);
            expect(gatewaySwarm.strategy).toBe('Hierarchical API Gateway & Azure Front Door WAF WAF Swarm');
            expect(gatewaySwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Front Door WAF & API Gateway WAF Specialist');
            expect(gatewaySwarm.sequence.map(s => s.agentId)).toContain('Security & OWASP Hardening Sentinel');

            // 12. Evaluate Relational DB / Cloud SQL outputs
            const relationalOutput = 'const connection = await cloudSql.connect({ pgbouncer: true });';
            const relationalSwarm = await agenticRouter.routeDownstreamSwarm(relationalOutput);
            expect(relationalSwarm.strategy).toBe('Hierarchical Relational DB & Cosmos DB Tuning Swarm');
            expect(relationalSwarm.sequence.map(s => s.agentId)).toContain('Database Performance & SQL Optimization Tuning Specialist');
            expect(relationalSwarm.sequence.map(s => s.agentId)).toContain('Azure Relational Database & Cosmos DB Architect');

            // 13. Evaluate Identity & Firebase Auth outputs
            const identityOutput = 'firebaseAdmin.auth().createCustomToken(uid, { mfaEnrolled: true });';
            const identitySwarm = await agenticRouter.routeDownstreamSwarm(identityOutput);
            expect(identitySwarm.strategy).toBe('Hierarchical IAM & Federated Identity Swarm');
            expect(identitySwarm.sequence.map(s => s.agentId)).toContain('Azure Entra ID & Entra ID External Identities Specialist');
            expect(identitySwarm.sequence.map(s => s.agentId)).toContain('Azure Sentinel Zero-Trust Security Auditor');

            // 14. Evaluate Cloud Functions & Eventarc outputs
            const functionsOutput = 'exports.onDocumentCreated = firestore.document("users/{uid}").onCreate((snap, ctx) => {});';
            const functionsSwarm = await agenticRouter.routeDownstreamSwarm(functionsOutput);
            expect(functionsSwarm.strategy).toBe('Hierarchical Event Grid & Serverless Micro-Mesh Swarm');
            expect(functionsSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Functions & Event Grid Micro-Mesh Specialist');
            expect(functionsSwarm.sequence.map(s => s.agentId)).toContain('Azure Workflows Conductor & Orchestration Specialist');

            // 15. Evaluate Secret Manager & KMS outputs
            const kmsOutput = 'await kmsClient.envelopeEncrypt({ key: "secretmanager-cmek-key" });';
            const kmsSwarm = await agenticRouter.routeDownstreamSwarm(kmsOutput);
            expect(kmsSwarm.strategy).toBe('Hierarchical Cryptographic & Key Vault Officer Swarm');
            expect(kmsSwarm.sequence.map(s => s.agentId)).toContain('Azure Key Vault Secrets & Key Vault Cryptographic Officer');
            expect(kmsSwarm.sequence.map(s => s.agentId)).toContain('Security & OWASP Hardening Sentinel');

            // 16. Evaluate Cloud Build & Artifact Registry outputs
            const buildOutput = 'steps:\n- name: gcr.io/cloud-builders/docker\n  args: ["build", "-t", "us-central1-docker.pkg.dev/proj/repo/img", "."]';
            const buildSwarm = await agenticRouter.routeDownstreamSwarm(buildOutput);
            expect(buildSwarm.strategy).toBe('Hierarchical CI/CD & Artifact Registry Swarm');
            expect(buildSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Pipelines & Artifact Registry CI/CD Specialist');
            expect(buildSwarm.sequence.map(s => s.agentId)).toContain('Kubernetes Manifest & Helm Compiler Agent');

            // 17. Evaluate Edge Network, Cloud CDN & Cloud DNS outputs
            const edgeOutput = 'gcloud compute backend-services update backend-svc --enable-cdn --cdn-cache-mode=CACHE_ALL_STATIC';
            const edgeSwarm = await agenticRouter.routeDownstreamSwarm(edgeOutput);
            expect(edgeSwarm.strategy).toBe('Hierarchical Edge Network & CDN Swarm');
            expect(edgeSwarm.sequence.map(s => s.agentId)).toContain('Azure Edge Network, Cloud CDN & Cloud DNS Specialist');
            expect(edgeSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Front Door WAF & API Gateway WAF Specialist');

            // 18. Evaluate Data Catalog & Cloud DLP outputs
            const dlpOutput = 'await dlpClient.createInspectTemplate({ inspectConfig: { infoTypes: [{ name: "EMAIL_ADDRESS" }] } });';
            const dlpSwarm = await agenticRouter.routeDownstreamSwarm(dlpOutput);
            expect(dlpSwarm.strategy).toBe('Hierarchical Data Governance & DLP Swarm');
            expect(dlpSwarm.sequence.map(s => s.agentId)).toContain('Azure Data Catalog & Cloud DLP Compliance Officer');
            expect(dlpSwarm.sequence.map(s => s.agentId)).toContain('Azure Sentinel Zero-Trust Security Auditor');

            // 19. Evaluate Vertex AI Feature Store & Model Registry outputs
            const featureOutput = 'const [operation] = await endpointServiceClient.deployModel({ endpoint, deployedModel: { model: "projects/p/locations/l/models/m" } });';
            const featureSwarm = await agenticRouter.routeDownstreamSwarm(featureOutput);
            expect(featureSwarm.strategy).toBe('Hierarchical Azure AI Feature Store & Model Swarm');
            expect(featureSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure AI Studio Feature Store & Model Registry Specialist');
            expect(featureSwarm.sequence.map(s => s.agentId)).toContain('Azure AI Studio & Gemini Pipeline Optimization Specialist');

            // 20. Evaluate Cloud Run Jobs & Scheduled Tasks
            const runJobsOutput = 'cloudrun_job cloud_run_job run-job scheduler_cron cron-trigger';
            const runJobsSwarm = await agenticRouter.routeDownstreamSwarm(runJobsOutput);
            expect(runJobsSwarm.strategy).toBe('Hierarchical Azure Container Apps Jobs & Batch Tasks Swarm');
            expect(runJobsSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Container Apps Jobs & Scheduled Tasks Specialist');

            // 21. Evaluate Cloud DNSSEC & global failover
            const dnsFailoverOutput = 'dnssec geolocation_routing dns_failover active-active dns-challenge';
            const dnsFailoverSwarm = await agenticRouter.routeDownstreamSwarm(dnsFailoverOutput);
            expect(dnsFailoverSwarm.strategy).toBe('Hierarchical Global DNSSEC & Failover Swarm');
            expect(dnsFailoverSwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud DNSSEC & Global Failover Specialist');

            // 22. Evaluate AlloyDB Columnar Engine & Cache
            const alloydbColumnarOutput = 'columnar_engine columnar_store columnar_size auto_recommend htap';
            const alloydbColumnarSwarm = await agenticRouter.routeDownstreamSwarm(alloydbColumnarOutput);
            expect(alloydbColumnarSwarm.strategy).toBe('Hierarchical Cosmos DB Columnar Store Swarm');
            expect(alloydbColumnarSwarm.sequence.map(s => s.agentId)).toContain('Cosmos DB Columnar Engine & Cache Specialist');

            // 23. Evaluate Spanner Graph
            const spannerGraphOutput = 'spanner_graph property_graph gql match_pattern graph_schema';
            const spannerGraphSwarm = await agenticRouter.routeDownstreamSwarm(spannerGraphOutput);
            expect(spannerGraphSwarm.strategy).toBe('Hierarchical Cosmos DB Property Graph Swarm');
            expect(spannerGraphSwarm.sequence.map(s => s.agentId)).toContain('Azure Cosmos DB Graph & Property Database Specialist');

            // 24. Evaluate Vertex AI Vector Search
            const vertexVectorOutput = 'matching_engine vector_search_endpoint ann_index hnsw_index index_metadata';
            const vertexVectorSwarm = await agenticRouter.routeDownstreamSwarm(vertexVectorOutput);
            expect(vertexVectorSwarm.strategy).toBe('Hierarchical Azure AI Vector Search Swarm');
            expect(vertexVectorSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure AI Studio Vector Search & Matching Engine Specialist');

            // 25. Evaluate BigQuery Omni
            const bigqueryOmniOutput = 'bigquery_omni cross_cloud external_connection federated_query s3_external';
            const bigqueryOmniSwarm = await agenticRouter.routeDownstreamSwarm(bigqueryOmniOutput);
            expect(bigqueryOmniSwarm.strategy).toBe('Hierarchical Synapse Analytics Omni Multi-Cloud Swarm');
            expect(bigqueryOmniSwarm.sequence.map(s => s.agentId)).toContain('Azure Synapse Analytics Omni & Multi-Cloud Query Coordinator');

            // 26. Evaluate Cloud Bigtable NoSQL
            const bigtableOutput = 'bigtable_schema row_key gc_policy column_family nosql_hotspot';
            const bigtableSwarm = await agenticRouter.routeDownstreamSwarm(bigtableOutput);
            expect(bigtableSwarm.strategy).toBe('Hierarchical Cloud Cosmos DB Table API NoSQL Swarm');
            expect(bigtableSwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud Cosmos DB Table API & NoSQL Scalability Specialist');

            // 27. Evaluate Cloud Memorystore Redis caching
            const memorystoreOutput = 'memorystore_redis redis_eviction redis_failover cache_aside resp_protocol';
            const memorystoreSwarm = await agenticRouter.routeDownstreamSwarm(memorystoreOutput);
            expect(memorystoreSwarm.strategy).toBe('Hierarchical Azure Cache for Redis Redis Caching Swarm');
            expect(memorystoreSwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud Azure Cache for Redis Redis & Caching Tuning Specialist');

            // 28. Evaluate Cloud NAT & Secure Egress
            const natOutput = 'cloud_nat secure_egress port_allocation nat_logging private_subnet';
            const natSwarm = await agenticRouter.routeDownstreamSwarm(natOutput);
            expect(natSwarm.strategy).toBe('Hierarchical Cloud NAT Secure Egress Swarm');
            expect(natSwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud NAT & Secure Egress Network Specialist');

            // 29. Evaluate Cloud Asset Inventory IAM compliance
            const assetAuditorOutput = 'asset_inventory iam_compliance asset_feed org_policy gcloud_asset';
            const assetAuditorSwarm = await agenticRouter.routeDownstreamSwarm(assetAuditorOutput);
            expect(assetAuditorSwarm.strategy).toBe('Hierarchical Asset Compliance & IAM Posture Swarm');
            expect(assetAuditorSwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud Asset Inventory & IAM Compliance Auditor');

            // 30. Evaluate Cloud Composer & Airflow orchestration
            const composerOutput = 'composer_env apache_airflow dag_generation airflow_task composer_autoscaling';
            const composerSwarm = await agenticRouter.routeDownstreamSwarm(composerOutput);
            expect(composerSwarm.strategy).toBe('Hierarchical Azure Data Factory & Airflow Orchestration Swarm');
            expect(composerSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Data Factory & Apache Airflow Orchestrator');

            // 31. Evaluate Cloud Dataflow & Beam pipelines
            const dataflowOutput = 'cloud_dataflow apache_beam ptransform side_input flexrs';
            const dataflowSwarm = await agenticRouter.routeDownstreamSwarm(dataflowOutput);
            expect(dataflowSwarm.strategy).toBe('Hierarchical Cloud Azure Stream Analytics & Beam Pipeline Swarm');
            expect(dataflowSwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud Azure Stream Analytics & Apache Beam Specialist');

            // 32. Evaluate Vertex AI Feature Store Feast
            const vertexFeastOutput = 'vertex_feast feature_view feature_registry offline_store feast_sdk';
            const vertexFeastSwarm = await agenticRouter.routeDownstreamSwarm(vertexFeastOutput);
            expect(vertexFeastSwarm.strategy).toBe('Hierarchical Azure AI Studio Feast Feature Store Swarm');
            expect(vertexFeastSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure AI Studio Feature Store Feast Specialist');

            // 33. Evaluate Cloud Filestore & Distributed NFS storage
            const filestoreOutput = 'cloud_filestore distributed_nfs nfs_mount filestore_tier shared_file_share';
            const filestoreSwarm = await agenticRouter.routeDownstreamSwarm(filestoreOutput);
            expect(filestoreSwarm.strategy).toBe('Hierarchical Cloud Azure Files & NFS Storage Swarm');
            expect(filestoreSwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud Azure Files & Distributed NFS Storage Specialist');

            // 34. Evaluate Web Security Scanner & vulnerability auditing
            const securityScannerOutput = 'web_security_scanner vulnerability_audit owasp_patrol crawling_infra scan_target';
            const securityScannerSwarm = await agenticRouter.routeDownstreamSwarm(securityScannerOutput);
            expect(securityScannerSwarm.strategy).toBe('Hierarchical Web Security Scanner Swarm');
            expect(securityScannerSwarm.sequence.map(s => s.agentId)).toContain('Azure Web Security Scanner & Vulnerability Auditor');

            // 35. Evaluate Eventarc & CloudEvents Mesh
            const eventarcOutput = 'eventarc_mesh cloudevents event_filter eventarc_trigger channel_connection';
            const eventarcSwarm = await agenticRouter.routeDownstreamSwarm(eventarcOutput);
            expect(eventarcSwarm.strategy).toBe('Hierarchical Event Grid & CloudEvents Mesh Swarm');
            expect(eventarcSwarm.sequence.map(s => s.agentId)).toContain('Azure Event Grid & CloudEvents Mesh Specialist');

            // 36. Evaluate Cloud SQL Auth Proxy & IAM database setup
            const sqlProxyOutput = 'sql_auth_proxy iam_database proxy_port cloud_sql_connector db_token';
            const sqlProxySwarm = await agenticRouter.routeDownstreamSwarm(sqlProxyOutput);
            expect(sqlProxySwarm.strategy).toBe('Hierarchical Azure Cloud SQL Proxy & IAM DB Swarm');
            expect(sqlProxySwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud SQL Auth Proxy & IAM Database Specialist');

            // 37. Evaluate Binary Authorization & software supply chain
            const binauthOutput = 'binauth_guardian binary_authorization_policy kritis_signer attestation_authority supply_chain_security';
            const binauthSwarm = await agenticRouter.routeDownstreamSwarm(binauthOutput);
            expect(binauthSwarm.strategy).toBe('Hierarchical Azure Container Registry Trust & Supply Chain Swarm');
            expect(binauthSwarm.sequence.map(s => s.agentId)).toContain('Azure Binary Authorization & Software Supply Chain Specialist');

            // 38. Evaluate Cloud Interconnect & Secure VPN connections
            const interconnectOutput = 'cloud_interconnect secure_vpn bgp_session direct_peering ipsec_tunnel';
            const interconnectSwarm = await agenticRouter.routeDownstreamSwarm(interconnectOutput);
            expect(interconnectSwarm.strategy).toBe('Hierarchical Azure Cloud Interconnect & Secure VPN Swarm');
            expect(interconnectSwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud Interconnect & Secure VPN Specialist');

            // 39. Evaluate Workload Identity Federation & OIDC Specialist
            const workloadFederationOutput = 'workload_identity_federation oidc_provider aws_identity_pool github_actions_oidc federated_credential';
            const workloadFederationSwarm = await agenticRouter.routeDownstreamSwarm(workloadFederationOutput);
            expect(workloadFederationSwarm.strategy).toBe('Hierarchical Azure Workload Identity & OIDC Swarm');
            expect(workloadFederationSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Workload Identity & OIDC Specialist');

            // 40. Evaluate GKE Enterprise multi-cluster fleet management
            const gkeFleetOutput = 'gke_fleet multi_cluster_ingress config_sync fleet_membership';
            const gkeFleetSwarm = await agenticRouter.routeDownstreamSwarm(gkeFleetOutput);
            expect(gkeFleetSwarm.strategy).toBe('Hierarchical AKS Enterprise Fleet Swarm');
            expect(gkeFleetSwarm.sequence.map(s => s.agentId)).toContain('Azure AKS Enterprise Multi-Cluster Fleet Manager');

            // 41. Evaluate Vertex AI model monitoring & prediction drift
            const vertexMonitoringOutput = 'vertex_model_monitoring drift_detection model_skew prediction_telemetry';
            const vertexMonitoringSwarm = await agenticRouter.routeDownstreamSwarm(vertexMonitoringOutput);
            expect(vertexMonitoringSwarm.strategy).toBe('Hierarchical Azure AI Studio Model Monitoring Swarm');
            expect(vertexMonitoringSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure AI Studio Model Monitoring & Drift Auditor');

            // 42. Evaluate Healthcare API & FHIR protocol data
            const healthcareFhirOutput = 'healthcare_api fhir_store hl7_v2 dicom_deid';
            const healthcareFhirSwarm = await agenticRouter.routeDownstreamSwarm(healthcareFhirOutput);
            expect(healthcareFhirSwarm.strategy).toBe('Hierarchical Healthcare & FHIR Data Swarm');
            expect(healthcareFhirSwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud Healthcare API & HL7/FHIR Specialist');

            // 43. Evaluate Apigee Enterprise API management
            const apigeeEnterpriseOutput = 'apigee_proxy spike_arrest apigee_quota api_developer_portal';
            const apigeeEnterpriseSwarm = await agenticRouter.routeDownstreamSwarm(apigeeEnterpriseOutput);
            expect(apigeeEnterpriseSwarm.strategy).toBe('Hierarchical Azure API Management Enterprise Swarm');
            expect(apigeeEnterpriseSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure API Management Enterprise API Management Specialist');

            // 44. Evaluate Dataplex data mesh governance
            const dataplexMeshOutput = 'dataplex_lake data_mesh_governance data_quality_rule metadata_lineage';
            const dataplexMeshSwarm = await agenticRouter.routeDownstreamSwarm(dataplexMeshOutput);
            expect(dataplexMeshSwarm.strategy).toBe('Hierarchical Azure Purview Data Mesh Swarm');
            expect(dataplexMeshSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Purview Data Mesh Governance Specialist');

            // 45. Evaluate Dataproc serverless Spark computing
            const dataprocSparkOutput = 'dataproc_serverless pyspark_batch spark_sql_tuning ephemeral_hive';
            const dataprocSparkSwarm = await agenticRouter.routeDownstreamSwarm(dataprocSparkOutput);
            expect(dataprocSparkSwarm.strategy).toBe('Hierarchical Azure HDInsight Serverless Spark Swarm');
            expect(dataprocSparkSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure HDInsight Serverless & Apache Spark Specialist');

            // 46. Evaluate Vertex AI Search & Conversation Builder
            const vertexSearchOutput = 'vertex_search_engine agent_builder data_store_index dialogflow_cx';
            const vertexSearchSwarm = await agenticRouter.routeDownstreamSwarm(vertexSearchOutput);
            expect(vertexSearchSwarm.strategy).toBe('Hierarchical Azure AI Studio Agent Builder Swarm');
            expect(vertexSearchSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure AI Studio Search & Conversation Agentic Specialist');

            // 47. Evaluate Secure Web Proxy & egress decryption gateway
            const secureProxyOutput = 'secure_web_proxy egress_decryption url_routing_rule tls_inspection';
            const secureProxySwarm = await agenticRouter.routeDownstreamSwarm(secureProxyOutput);
            expect(secureProxySwarm.strategy).toBe('Hierarchical Azure Secure Web Proxy Egress Swarm');
            expect(secureProxySwarm.sequence.map(s => s.agentId)).toContain('Azure Secure Web Proxy & Zero-Trust Access Gateway Specialist');

            // 48. Evaluate Cloud Run Multicontainer sidecar proxying
            const runMulticontainerOutput = 'run_multicontainer sidecar_proxy run_nginx_egress run_shared_volume';
            const runMulticontainerSwarm = await agenticRouter.routeDownstreamSwarm(runMulticontainerOutput);
            expect(runMulticontainerSwarm.strategy).toBe('Hierarchical Azure Container Apps Multicontainer Swarm');
            expect(runMulticontainerSwarm.sequence.map(s => s.agentId)).toContain('Azure Azure Container Apps Multicontainer & Sidecar Orchestration Specialist');

            // 49. Evaluate Cloud TPU & HPC cluster scheduling
            const tpuHpcOutput = 'cloud_tpu_v5 tpu_pod_slice hpc_scheduler slurm_cluster';
            const tpuHpcSwarm = await agenticRouter.routeDownstreamSwarm(tpuHpcOutput);
            expect(tpuHpcSwarm.strategy).toBe('Hierarchical Azure TPU & High-Performance Compute Swarm');
            expect(tpuHpcSwarm.sequence.map(s => s.agentId)).toContain('Azure Cloud TPU & High-Performance Compute Cluster Specialist');
        });
    });
});
