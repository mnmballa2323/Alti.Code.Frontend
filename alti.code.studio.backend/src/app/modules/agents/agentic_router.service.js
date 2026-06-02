/* DIRECT GEMINI BLOCKED - USE VERTEX VIA GATEWAY */
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import { agentRegistry } from './agent.registry.js';
import { swarmNexusAgent } from './swarm_nexus.agent.js';
import { vectorStoreService } from '../memory/vector.store.js';

const genAI = null /* DIRECT GEMINI BLOCKED */;

/**
 * The 'Brain' of the Swarm.
 * Autonomously routes any prompt to the correct agentic workflow.
 */
class AgenticRouterService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro' });
    }

    /**
     * Parses a natural language prompt and determines the required specialist agents.
     */
    async routePrompt(prompt) {
        logger.info(`🧠 [Router] Orchestrating 'World of Worlds' swarm with Gemini 3.1 Pro...`);

        const cleanPrompt = prompt.toLowerCase();

        // 1. [Garry Tan gstack Virtual Team Swarm Router]
        // If the task mentions 'gstack' or represents a high-complexity full-stack system,
        // we dynamically route it via a collaborative YC-style virtual engineering team.
        const isComplexSystem = cleanPrompt.includes('gstack') || 
                                cleanPrompt.includes('system') || 
                                cleanPrompt.includes('architecture') || 
                                cleanPrompt.includes('payment') ||
                                cleanPrompt.includes('full-stack');

        if (isComplexSystem) {
            logger.info(`👥 [Router] High-complexity prompt detected. Invoking Garry Tan gstack Swarm team layout...`);
            try {
                const gstackRoadmap = await swarmNexusAgent.routeGstackTeam(prompt, 'Project context: backend-only orchestration.');
                logger.info(`✅ [Router] Garry Tan gstack virtual team successfully mapped. Swarm structured.`);
                
                // Convert YC team roadmap into swarm sequence nodes
                return {
                    strategy: 'Garry Tan gstack Virtual Engineering Swarm Layout',
                    sequence: [
                        { agentId: 'yc_pm', task: 'Strategic CEO spec mapping and problem hypothesis validation' },
                        { agentId: 'karpathy_sentinel', task: 'Proactive simplicity and surgical scope compliance validation' },
                        { agentId: 'jules', task: 'Core developer implementation' },
                        { agentId: 'yc_qa', task: 'Automated Vitest/Playwright test suites generation and QA check' },
                        { agentId: 'yc_security', task: 'Zero-trust DLP checks, credentials scans, and input hardening audits' },
                        { agentId: 'yc_ceo', task: 'Strategic YC CEO alignment validation and MVP release authorization' }
                    ],
                    priority: 'HIGH',
                    gstackRoadmap
                };
            } catch (err) {
                logger.warn(`⚠️ [Router] gstack routing failed, falling back to standard sequence: ${err.message}`);
            }
        }

        // RAG-based dynamic candidate pre-selection loop to solve token bloat
        let candidateAgents = [];
        try {
            const searchResults = await vectorStoreService.search(prompt, 12);
            if (searchResults && searchResults.documents && searchResults.documents[0] && searchResults.documents[0].length > 0) {
                const matchedAgentIds = searchResults.metadatas[0].map(m => m.agentId);
                candidateAgents = matchedAgentIds
                    .map(id => agentRegistry.get(id))
                    .filter(Boolean);
            }
        } catch (err) {
            logger.warn(`⚠️ [Router] Vector store candidate retrieval failed: ${err.message}`);
        }

        // Fallback array of 15 agents if vector search yields empty or fails
        if (candidateAgents.length === 0) {
            logger.info(`ℹ️ [Router] Vector store search empty. Falling back to core and sample specialist list.`);
            candidateAgents = agentRegistry.list().slice(0, 15);
        }

        // Ensure critical core workflow agents are always present in the candidates list
        const coreAgentIds = [
            'yc_pm', 'karpathy_sentinel', 'jules', 'yc_qa', 'yc_security', 'yc_ceo',
            'auditor', 'licenseGuardian', 'agent_forge_generator', 'karpathy_refactor'
        ];
        
        for (const id of coreAgentIds) {
            if (!candidateAgents.some(a => a.name === id)) {
                const coreAgent = agentRegistry.get(id);
                if (coreAgent) {
                    candidateAgents.push(coreAgent);
                }
            }
        }

        // Map to ultra token-lean clean profiles
        const leanCandidatesList = candidateAgents.map(a => ({
            name: a.name,
            description: a.description,
            capabilities: a.capabilities
        }));

        const systemInstruction = `
            ACT AS THE CHIEF SMARTRONTING ARCHITECT FOR ALTI CODE STUDIO.
            Available Specialists: ${JSON.stringify(leanCandidatesList)}
            
            UNIVERSE-BEST ROUTING RULES:
            1. **Holistic Intelligence**: If the user asks for code, you MUST include 'Architect' for strategy, 'jules' for execution, and 'auditor' for fidelity review.
            2. **Hard Law Enforcement**: Always include 'licenseGuardian' if new dependencies or external code might be involved.
            3. **Security First**: If the request involves infrastructure, auth, or sensitive data, you MUST include 'security' and 'sentinel' agents.
            4. **Parallel Execution**: Suggest parallel agent activations if the tasks are independent.
            5. **Final Synthesis**: Ensure the chain ends with a quality gate.
            6. **Zero-Limit Routing (The Forge)**: If the user requests a capability, domain, or industry that is NOT covered by any of the available specialists, you MUST route the task to 'agent_forge_generator'. Instruct the Forge to dynamically write, register, and deploy a new hyper-specialized agent capable of fulfilling the request.
            7. **Dynamic Load Balancing**: You MUST explicitly balance execution workloads by assigning the appropriate 'workerConfig'. Assign 'GKE_BURST' for highly compute-heavy tasks (like comprehensive test runs, heavy security audits, full compilation, or extensive refactoring cycles) and 'STANDARD' for lightweight reasoning steps (initial planning, docstring generations, peer reviews). This ensures that standard node pools do not experience bottleneck starvation under heavy load.
            
            Return a JSON object: { 
                strategy: string, 
                sequence: [{ agentId: string, task: string, workerConfig: 'GKE_BURST' | 'STANDARD' }], 
                priority: 'URGENT' | 'HIGH' | 'NORMAL'
            }
        `;

        try {
            // 2. Initial Orchestration Attempt
            const result = await this.model.generateContent([systemInstruction, prompt]);
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            let plan = jsonMatch ? JSON.parse(jsonMatch[0]) : this.fallbackPlan(prompt);

            // 3. [Andrej Karpathy Behavioral Compliance Auditor Gate]
            // We proactively audit the plan *before* execution.
            // If the plan violates simplicity, stated thinking, or surgical changes, we trigger a Self-Correction Loop.
            logger.info(`⚖️ [Router] Proactively auditing orchestration plan under Andrej Karpathy guidelines...`);
            try {
                const karpathyReport = await swarmNexusAgent.auditKarpathyRules(
                    JSON.stringify(plan),
                    `Prompt: "${prompt}"`
                );

                if (karpathyReport.includes('NON-COMPLIANT')) {
                    logger.warn(`🚨 [Router] Plan failed Karpathy Rules. Triggering Self-Correction compliance loop...`);
                    
                    const correctionInstruction = `
                        Your previous orchestration plan failed the Andrej Karpathy Agentic Guidelines.
                        
                        COMPLIANCE REPORT:
                        ${karpathyReport}
                        
                        Please re-orchestrate the plan to be 100% compliant. Ensure it is:
                        - Surgical (touches only the target domain, no orthogonal changes)
                        - Simple (no redundant layers, minimal agents)
                        - Verified (ends with QA / auditor nodes)
                    `;

                    const correctionResult = await this.model.generateContent([correctionInstruction, prompt]);
                    const correctionText = correctionResult.response.text();
                    const correctionJsonMatch = correctionText.match(/\{[\s\S]*\}/);
                    if (correctionJsonMatch) {
                        plan = JSON.parse(correctionJsonMatch[0]);
                        
                        // Inject the Karpathy refactoring agent to execute surgical simplification
                        if (!plan.sequence.find(s => s.agentId === 'karpathy_refactor')) {
                            plan.sequence.unshift({ agentId: 'karpathy_refactor', task: 'Surgical code simplification and diff size minimization mapping' });
                        }
                        
                        logger.info(`✅ [Router] Compliance loop completed. Plan is now 100% Karpathy compliant.`);
                    }
                } else {
                    logger.info(`✅ [Router] Swarm plan passed Andrej Karpathy compliance check.`);
                }
            } catch (err) {
                logger.warn(`⚠️ [Router] Karpathy compliance audit skipped due to error: ${err.message}`);
            }

            // 4. [FLAWLESS VALIDATION LOOP]
            // Verify that every agent suggested actually exists in the Nexus Registry
            const invalidAgents = plan.sequence.filter(s => !agentRegistry.get(s.agentId));
            
            if (invalidAgents.length > 0) {
                logger.warn(`⚠️ [Router] Detected invalid agents in plan: ${invalidAgents.map(a => a.agentId).join(', ')}. Triggering correction loop...`);
                
                const correctionInstruction = `
                    The following agents were suggested but DO NOT exist in the registry: ${invalidAgents.map(a => a.agentId).join(', ')}.
                    Please RE-ORCHESTRATE the plan using ONLY these available agents: ${JSON.stringify(agentRegistry.listAgents())}
                `;
                
                const correctionResult = await this.model.generateContent([correctionInstruction, prompt]);
                const correctionText = correctionResult.response.text();
                const correctionJsonMatch = correctionText.match(/\{[\s\S]*\}/);
                if (correctionJsonMatch) plan = JSON.parse(correctionJsonMatch[0]);
            }

            // 5. 🛡️ [Hard Law Enforcement]: Final Safety Append
            if (!plan.sequence.find(s => s.agentId === 'auditor')) {
                plan.sequence.push({ agentId: 'auditor', task: 'Final fidelity benchmarking and world-best quality audit.' });
            }

            logger.info(`✅ [Router] Flawless routing complete. Active Swarm: ${plan.sequence.map(s => s.agentId).join(' -> ')}`);
            return plan;

        } catch (error) {
            logger.error('Agentic Router Execution Failure:', error);
            return this.fallbackPlan(prompt);
        }
    }

    /**
     * Proactive Hierarchical Routing: Parses primary swarm output and recursively spawns
     * downstream specialist sub-swarms in parallel.
     * @param {string} primaryOutput - Code/Blueprint generated by the primary swarm
     * @param {object} taskContext - Metadata about the execution environment
     * @returns {Promise<{strategy: string, sequence: Array<{agentId: string, task: string}>}>}
     */
    async routeDownstreamSwarm(primaryOutput, taskContext = {}) {
        logger.info('🧠 [Router] Initiating downstream hierarchical sub-swarm analysis on backend output...');

        const outputLower = primaryOutput.toLowerCase();
        const downstreamSequence = [];
        let strategy = 'Default Downstream Swarm Execution';

        // 1. Analyze Database/pgvector schemas
        const isDbOutput = outputLower.includes('db') || 
                           outputLower.includes('sql') || 
                           outputLower.includes('table') || 
                           outputLower.includes('vector') || 
                           outputLower.includes('hnsw') || 
                           outputLower.includes('alloydb') || 
                           outputLower.includes('similarity');
        if (isDbOutput) {
            downstreamSequence.push(
                { agentId: 'Database Performance & SQL Optimization Tuning Specialist', task: 'Tune database queries and schema indices' },
                { agentId: 'AlloyDB pgvector Similarity Search Tuning Specialist', task: 'Optimize pgvector index and RAG embeddings alignment' }
            );
            strategy = 'Hierarchical Vector DB Optimization Swarm';
        }

        // 2. Analyze Security/Clearance perimeters
        const isSecurityOutput = outputLower.includes('security') || 
                                 outputLower.includes('auth') || 
                                 outputLower.includes('secret') || 
                                 (outputLower.includes('key') && !outputLower.includes('foreign key') && !outputLower.includes('primary key')) || 
                                 outputLower.includes('iam') || 
                                 outputLower.includes('vpc') || 
                                 outputLower.includes('workloadidentity');
        if (isSecurityOutput) {
            downstreamSequence.push(
                { agentId: 'Security & OWASP Hardening Sentinel', task: 'Perform basic credentials and configuration scanning' },
                { agentId: 'GCP Sentinel Zero-Trust Security Auditor', task: 'Enforce Zero-Trust perimeter and IAM least-privilege policies' }
            );
            strategy = 'Hierarchical Zero-Trust Security Clearance Swarm';
        }

        // 3. Analyze Message Mesh/Events
        const isPubSubOutput = outputLower.includes('pubsub') || 
                               outputLower.includes('topic') || 
                               outputLower.includes('subscription') || 
                               outputLower.includes('queue') || 
                               outputLower.includes('dlq') || 
                               outputLower.includes('retry_backoff') || 
                               outputLower.includes('event');
        if (isPubSubOutput) {
            downstreamSequence.push(
                { agentId: 'Distributed Queue & Event Coordinator', task: 'Scan queue worker configurations' },
                { agentId: 'GCP Pub/Sub Event-Driven Mesh Conductor Specialist', task: 'Orchestrate event-driven Pub/Sub topologies and DLQ rules' }
            );
            strategy = 'Hierarchical Event-Driven Mesh Scaling Swarm';
        }

        // 4. Analyze GCP Workflows & distributed task orchestration
        const isWorkflowsOutput = outputLower.includes('workflow') || 
                                  outputLower.includes('cloudworkflow') || 
                                  outputLower.includes('cloudtask') || 
                                  outputLower.includes('distributed_orchestration') || 
                                  outputLower.includes('callback');
        if (isWorkflowsOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Workflows Conductor & Orchestration Specialist', task: 'Orchestrate distributed serverless step flows and tasks' }
            );
            strategy = 'Hierarchical Distributed Workflows Swarm';
        }

        // 5. Analyze Vertex AI & model pipelines
        const isVertexOutput = outputLower.includes('vertex') || 
                               outputLower.includes('pipelines') || 
                               outputLower.includes('prompt_caching') || 
                               outputLower.includes('custom_training');
        if (isVertexOutput) {
            downstreamSequence.push(
                { agentId: 'Vertex AI & Gemini Pipeline Optimization Specialist', task: 'Optimize AI pipeline stages and Gemini prompt caching rules' }
            );
            strategy = 'Hierarchical Vertex AI Lifecycle Swarm';
        }

        // 6. Analyze BigQuery vector analytics
        const isBigQueryOutput = outputLower.includes('bigquery') || 
                                 outputLower.includes('dataflow') || 
                                 outputLower.includes('streaming') || 
                                 outputLower.includes('apache_beam') || 
                                 outputLower.includes('vector_search');
        if (isBigQueryOutput) {
            downstreamSequence.push(
                { agentId: 'Google Cloud BigQuery & Dataflow Analytics Specialist', task: 'Structure high-scale analytical queries and streams' }
            );
            strategy = 'Hierarchical Vector Analytics Swarm';
        }

        // 7. Analyze Spanner distributed scaling
        const isSpannerOutput = outputLower.includes('spanner') || 
                                outputLower.includes('interleave') || 
                                outputLower.includes('multi-region') || 
                                outputLower.includes('replication');
        if (isSpannerOutput) {
            downstreamSequence.push(
                { agentId: 'Google Cloud Spanner Scalability Specialist', task: 'Design globally distributed child tables and scale database transactions' }
            );
            strategy = 'Hierarchical Cloud Spanner Scaling Swarm';
        }

        // 8. Analyze Cloud Run & GKE Autopilot provisioning
        const isCloudRunOutput = outputLower.includes('cloudrun') || 
                                 outputLower.includes('gke') || 
                                 outputLower.includes('kubernetes') || 
                                 outputLower.includes('k8s') || 
                                 outputLower.includes('autopilot') || 
                                 outputLower.includes('pod') || 
                                 outputLower.includes('ingress') || 
                                 outputLower.includes('knative') || 
                                 outputLower.includes('container_port');
        if (isCloudRunOutput) {
            downstreamSequence.push(
                { agentId: 'Kubernetes Manifest & Helm Compiler Agent', task: 'Scan and validate Kubernetes manifest templates' },
                { agentId: 'GCP Cloud Run & GKE Autopilot Provisioning Specialist', task: 'Deploy containerized serverless resources and scale GKE Autopilot pods' }
            );
            strategy = 'Hierarchical Serverless & Container Provisioning Swarm';
        }

        // 9. Analyze GCS storage lifecycle policies
        const isGcsOutput = outputLower.includes('gcs') || 
                            outputLower.includes('bucket') || 
                            outputLower.includes('storage') || 
                            outputLower.includes('lifecycle') || 
                            outputLower.includes('signedurl') || 
                            outputLower.includes('coldline') || 
                            outputLower.includes('archive') || 
                            outputLower.includes('cors') || 
                            outputLower.includes('transfer');
        if (isGcsOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Storage & Data Lifecycle Governor Specialist', task: 'Structure lifecycle storage rules and signed URL security policies' }
            );
            strategy = 'Hierarchical GCS Storage & Lifecycle Swarm';
        }

        // 10. Analyze operations alerts and monitoring SLIs/SLOs
        const isMonitoringOutput = outputLower.includes('monitoring') || 
                                   outputLower.includes('alert') || 
                                   outputLower.includes('slo') || 
                                   outputLower.includes('sli') || 
                                   outputLower.includes('metric') || 
                                   outputLower.includes('profiler') || 
                                   outputLower.includes('trace') || 
                                   outputLower.includes('logging') || 
                                   outputLower.includes('cloudlogger');
        if (isMonitoringOutput) {
            downstreamSequence.push(
                { agentId: 'Distributed Tracing & APM Instrumentation Architect', task: 'Correlate trace logs and OTel APM endpoints' },
                { agentId: 'GCP Operations & Monitoring Specialist', task: 'Configure Cloud Operations sinks, continuous profiler, and SLI/SLO dashboards' }
            );
            strategy = 'Hierarchical Operations & Monitoring Swarm';
        }

        // 11. Analyze Cloud Armor WAF & API Gateway routing
        const isArmorGatewayOutput = outputLower.includes('apigateway') || 
                                     outputLower.includes('api.gateway') || 
                                     outputLower.includes('api-gateway') || 
                                     outputLower.includes('gateway') || 
                                     outputLower.includes('cloudarmor') || 
                                     outputLower.includes('waf') || 
                                     outputLower.includes('rate_limiting') || 
                                     outputLower.includes('ddos') || 
                                     outputLower.includes('firewall') || 
                                     outputLower.includes('ssl');
        if (isArmorGatewayOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Armor & API Gateway WAF Specialist', task: 'Formulate OpenAPI Gateway routing and Cloud Armor WAF security profiles' },
                { agentId: 'Security & OWASP Hardening Sentinel', task: 'Audit WAF rate limiting and API edge protection rules' }
            );
            strategy = 'Hierarchical API Gateway & Cloud Armor WAF Swarm';
        }

        // 12. Analyze Relational DB / Cloud SQL
        const isRelationalDbOutput = outputLower.includes('cloudsql') || 
                                     outputLower.includes('connection_pool') || 
                                     outputLower.includes('pgbouncer') || 
                                     outputLower.includes('replica') || 
                                     outputLower.includes('read_replica') || 
                                     outputLower.includes('high_availability') || 
                                     outputLower.includes('ha') || 
                                     outputLower.includes('alloydb_instance') || 
                                     outputLower.includes('query_cache');
        if (isRelationalDbOutput) {
            downstreamSequence.push(
                { agentId: 'Database Performance & SQL Optimization Tuning Specialist', task: 'Audit queries and indexing strategies' },
                { agentId: 'GCP Relational Database & AlloyDB Architect', task: 'Design highly available database replications and Cloud SQL connection pools' }
            );
            strategy = 'Hierarchical Relational DB & AlloyDB Tuning Swarm';
        }

        // 13. Analyze Identity & Federated login
        const isIdentityOutput = outputLower.includes('firebase_auth') || 
                                 outputLower.includes('identity_platform') || 
                                 outputLower.includes('mfa') || 
                                 outputLower.includes('oauth2') || 
                                 outputLower.includes('oidc') || 
                                 outputLower.includes('saml') || 
                                 outputLower.includes('federated') || 
                                 outputLower.includes('jwt') || 
                                 outputLower.includes('custom_claims');
        if (isIdentityOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Identity Platform & Firebase Auth Specialist', task: 'Configure enterprise identity federations and custom JWT tokens' },
                { agentId: 'GCP Sentinel Zero-Trust Security Auditor', task: 'Audit user access controls and authentication boundaries' }
            );
            strategy = 'Hierarchical IAM & Federated Identity Swarm';
        }

        // 14. Analyze Eventarc and serverless functions triggers
        const isFunctionsMeshOutput = outputLower.includes('cloudfunction') || 
                                      outputLower.includes('cloudfunctions') || 
                                      outputLower.includes('eventarc') || 
                                      outputLower.includes('trigger') || 
                                      outputLower.includes('oncreate') || 
                                      outputLower.includes('onupdate') || 
                                      outputLower.includes('ondelete') || 
                                      outputLower.includes('firestore.document') || 
                                      outputLower.includes('event_routing') || 
                                      outputLower.includes('firestore_trigger') || 
                                      outputLower.includes('pubsub_trigger') || 
                                      outputLower.includes('serverless_function');
        if (isFunctionsMeshOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Functions & Eventarc Micro-Mesh Specialist', task: 'Configure 2nd gen serverless handlers and Eventarc trigger meshes' },
                { agentId: 'GCP Workflows Conductor & Orchestration Specialist', task: 'Orchestrate step workflow callbacks and cloud task runs' }
            );
            strategy = 'Hierarchical Eventarc & Serverless Micro-Mesh Swarm';
        }

        // 15. Analyze Secret Manager & KMS encryption keys
        const isKmsOfficerOutput = outputLower.includes('secretmanager') || 
                                   outputLower.includes('kms') || 
                                   outputLower.includes('encryption_key') || 
                                   outputLower.includes('cmek') || 
                                   outputLower.includes('envelope_encryption') || 
                                   outputLower.includes('secret_rotation') || 
                                   outputLower.includes('cryptographic');
        if (isKmsOfficerOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Secret Manager & KMS Cryptographic Officer', task: 'Secure secret manager rotation schemes and KMS key envelopes' },
                { agentId: 'Security & OWASP Hardening Sentinel', task: 'Scan configurations for encryption and secrets leaks compliance' }
            );
            strategy = 'Hierarchical Cryptographic & KMS Officer Swarm';
        }

        // 16. Analyze Cloud Build & Artifact Registry CI/CD
        const isBuildCicdOutput = outputLower.includes('cloudbuild') || 
                                  outputLower.includes('artifact_registry') || 
                                  outputLower.includes('gcr.io') || 
                                  outputLower.includes('pkg.dev') || 
                                  outputLower.includes('cloud-builders') || 
                                  outputLower.includes('dockerfile') || 
                                  outputLower.includes('docker') || 
                                  outputLower.includes('binary_authorization') || 
                                  outputLower.includes('vulnerability_scan') || 
                                  outputLower.includes('ci_cd') || 
                                  outputLower.includes('pipeline_trigger');
        if (isBuildCicdOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Build & Artifact Registry CI/CD Specialist', task: 'Design secure Cloud Build pipelines and Artifact Registry repos' },
                { agentId: 'Kubernetes Manifest & Helm Compiler Agent', task: 'Audit pipeline deployment manifests' }
            );
            strategy = 'Hierarchical CI/CD & Artifact Registry Swarm';
        }

        // 17. Analyze Edge DNS, CDN & load balancers
        const isEdgeNetworkOutput = outputLower.includes('cloudcdn') || 
                                    outputLower.includes('clouddns') || 
                                    outputLower.includes('cdn') || 
                                    outputLower.includes('dns') || 
                                    outputLower.includes('cdn-cache') || 
                                    outputLower.includes('backend-services') || 
                                    outputLower.includes('anycast') || 
                                    outputLower.includes('load_balancer') || 
                                    outputLower.includes('loadbalancer') || 
                                    outputLower.includes('load-balancer') || 
                                    outputLower.includes('cdn_cache') || 
                                    outputLower.includes('dns_routing') || 
                                    outputLower.includes('signed_cookies');
        if (isEdgeNetworkOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Edge Network, Cloud CDN & Cloud DNS Specialist', task: 'Configure Anycast routing, Cloud DNS zones, and Cloud CDN caches' },
                { agentId: 'GCP Cloud Armor & API Gateway WAF Specialist', task: 'Enforce edge load balancer WAF configurations' }
            );
            strategy = 'Hierarchical Edge Network & CDN Swarm';
        }

        // 18. Analyze Data Catalog & DLP privacy templates
        const isDlpGovernanceOutput = outputLower.includes('data_catalog') || 
                                      outputLower.includes('dlp') || 
                                      outputLower.includes('pii_scan') || 
                                      outputLower.includes('de_identification') || 
                                      outputLower.includes('catalog_tagging') || 
                                      outputLower.includes('privacy_compliance') || 
                                      outputLower.includes('data_governance');
        if (isDlpGovernanceOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Data Catalog & Cloud DLP Compliance Officer', task: 'Build DLP inspection templates and Data Catalog taxologies' },
                { agentId: 'GCP Sentinel Zero-Trust Security Auditor', task: 'Verify data privacy access perimeters' }
            );
            strategy = 'Hierarchical Data Governance & DLP Swarm';
        }

        // 19. Analyze Vertex AI Feature Store & ML serving
        const isFeatureStoreOutput = outputLower.includes('feature_store') || 
                                     outputLower.includes('feature-store') || 
                                     outputLower.includes('model_registry') || 
                                     outputLower.includes('model-registry') || 
                                     outputLower.includes('deploymodel') || 
                                     outputLower.includes('deploy_model') || 
                                     outputLower.includes('endpoint') || 
                                     outputLower.includes('vertex_endpoint') || 
                                     outputLower.includes('model_serving') || 
                                     outputLower.includes('online_serving') || 
                                     outputLower.includes('feature_engineering');
        if (isFeatureStoreOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Vertex AI Feature Store & Model Registry Specialist', task: 'Optimize online Feature Store view lookups and Vertex endpoints' },
                { agentId: 'Vertex AI & Gemini Pipeline Optimization Specialist', task: 'Deploy and version models in Vertex Registry' }
            );
            strategy = 'Hierarchical Vertex Feature Store & Model Swarm';
        }

        // 20. Analyze Cloud Run Jobs and scheduler cron tasks
        const isRunJobsOutput = outputLower.includes('cloudrun_job') || 
                                outputLower.includes('cloud_run_job') || 
                                outputLower.includes('run-job') || 
                                outputLower.includes('scheduler_cron') || 
                                outputLower.includes('cron-trigger');
        if (isRunJobsOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Run Jobs & Scheduled Tasks Specialist', task: 'Orchestrate batch job executions, scheduled crons, and container retry policies' }
            );
            strategy = 'Hierarchical Cloud Run Jobs & Batch Tasks Swarm';
        }

        // 21. Analyze Cloud DNSSEC & global failover routing
        const isDnsFailoverOutput = outputLower.includes('dnssec') || 
                                    outputLower.includes('geolocation_routing') || 
                                    outputLower.includes('dns_failover') || 
                                    outputLower.includes('active-active') || 
                                    outputLower.includes('dns-challenge');
        if (isDnsFailoverOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud DNSSEC & Global Failover Specialist', task: 'Configure secure global DNSSEC policies and geolocation failovers' }
            );
            strategy = 'Hierarchical Global DNSSEC & Failover Swarm';
        }

        // 22. Analyze AlloyDB Columnar Engine and Cache configurations
        const isAlloydbColumnarOutput = outputLower.includes('columnar_engine') || 
                                        outputLower.includes('columnar_store') || 
                                        outputLower.includes('columnar_size') || 
                                        outputLower.includes('auto_recommend') || 
                                        outputLower.includes('htap');
        if (isAlloydbColumnarOutput) {
            downstreamSequence.push(
                { agentId: 'AlloyDB Columnar Engine & Cache Specialist', task: 'Optimize AlloyDB columnar memory sizing, htaps queries, and cache buffers' }
            );
            strategy = 'Hierarchical AlloyDB Columnar Store Swarm';
        }

        // 23. Analyze Spanner Graph property databases
        const isSpannerGraphOutput = outputLower.includes('spanner_graph') || 
                                     outputLower.includes('property_graph') || 
                                     outputLower.includes('gql') || 
                                     outputLower.includes('match_pattern') || 
                                     outputLower.includes('graph_schema');
        if (isSpannerGraphOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Spanner Graph & Property Database Specialist', task: 'Design Spanner property graph structures and optimize GQL queries' }
            );
            strategy = 'Hierarchical Spanner Property Graph Swarm';
        }

        // 24. Analyze Vertex AI Vector Search & Matching Engine
        const isVertexVectorOutput = outputLower.includes('matching_engine') || 
                                     outputLower.includes('vector_search_endpoint') || 
                                     outputLower.includes('ann_index') || 
                                     outputLower.includes('hnsw_index') || 
                                     outputLower.includes('index_metadata');
        if (isVertexVectorOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Vertex AI Vector Search & Matching Engine Specialist', task: 'Configure high-dimensional Vector Search index parameters and endpoints' }
            );
            strategy = 'Hierarchical Vertex Vector Search Swarm';
        }

        // 25. Analyze BigQuery Omni & Multi-Cloud Query setups
        const isBigQueryOmniOutput = outputLower.includes('bigquery_omni') || 
                                     outputLower.includes('cross_cloud') || 
                                     outputLower.includes('external_connection') || 
                                     outputLower.includes('federated_query') || 
                                     outputLower.includes('s3_external');
        if (isBigQueryOmniOutput) {
            downstreamSequence.push(
                { agentId: 'GCP BigQuery Omni & Multi-Cloud Query Coordinator', task: 'Orchestrate federated multi-cloud external connections and queries' }
            );
            strategy = 'Hierarchical BigQuery Omni Multi-Cloud Swarm';
        }

        // 26. Analyze Cloud Bigtable NoSQL scalability
        const isBigtableSpecialistOutput = outputLower.includes('bigtable_schema') || 
                                           outputLower.includes('row_key') || 
                                           outputLower.includes('gc_policy') || 
                                           outputLower.includes('column_family') || 
                                           outputLower.includes('nosql_hotspot');
        if (isBigtableSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Bigtable & NoSQL Scalability Specialist', task: 'Optimize Bigtable NoSQL row-key design, replication, and garbage collection policies' }
            );
            strategy = 'Hierarchical Cloud Bigtable NoSQL Swarm';
        }

        // 27. Analyze Cloud Memorystore Redis caching tuning
        const isMemorystoreTunerOutput = outputLower.includes('memorystore_redis') || 
                                         outputLower.includes('redis_eviction') || 
                                         outputLower.includes('redis_failover') || 
                                         outputLower.includes('cache_aside') || 
                                         outputLower.includes('resp_protocol');
        if (isMemorystoreTunerOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Memorystore Redis & Caching Tuning Specialist', task: 'Tune Memorystore Redis memory limits, evictions, and connection routing' }
            );
            strategy = 'Hierarchical Memorystore Redis Caching Swarm';
        }

        // 28. Analyze Cloud NAT & Secure Egress VPC configurations
        const isNatNetworkOutput = outputLower.includes('cloud_nat') || 
                                   outputLower.includes('secure_egress') || 
                                   outputLower.includes('port_allocation') || 
                                   outputLower.includes('nat_logging') || 
                                   outputLower.includes('private_subnet');
        if (isNatNetworkOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud NAT & Secure Egress Network Specialist', task: 'Configure secure NAT egress routing policies and subnet port allocations' }
            );
            strategy = 'Hierarchical Cloud NAT Secure Egress Swarm';
        }

        // 29. Analyze Cloud Asset Inventory IAM compliance
        const isAssetAuditorOutput = outputLower.includes('asset_inventory') || 
                                     outputLower.includes('iam_compliance') || 
                                     outputLower.includes('asset_feed') || 
                                     outputLower.includes('org_policy') || 
                                     outputLower.includes('gcloud_asset');
        if (isAssetAuditorOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Asset Inventory & IAM Compliance Auditor', task: 'Audit resource compliance posture and Organization Policy enforcements' }
            );
            strategy = 'Hierarchical Asset Compliance & IAM Posture Swarm';
        }

        // 30. Analyze Cloud Composer & Airflow orchestration
        const isComposerOutput = outputLower.includes('composer_env') || 
                                 outputLower.includes('apache_airflow') || 
                                 outputLower.includes('dag_generation') || 
                                 outputLower.includes('airflow_task') || 
                                 outputLower.includes('composer_autoscaling');
        if (isComposerOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Composer & Apache Airflow Orchestrator', task: 'Design Apache Airflow DAG structures, task dependencies, and provision Cloud Composer environments' },
                { agentId: 'GCP Workflows Conductor & Orchestration Specialist', task: 'Audit and coordinate cross-environment task workflows' }
            );
            strategy = 'Hierarchical Cloud Composer & Airflow Orchestration Swarm';
        }

        // 31. Analyze Cloud Dataflow & Beam pipelines
        const isDataflowOutput = outputLower.includes('cloud_dataflow') || 
                                 outputLower.includes('apache_beam') || 
                                 outputLower.includes('ptransform') || 
                                 outputLower.includes('side_input') || 
                                 outputLower.includes('flexrs');
        if (isDataflowOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Dataflow & Apache Beam Specialist', task: 'Design real-time Apache Beam pipelines and optimize Cloud Dataflow execution' },
                { agentId: 'Google Cloud BigQuery & Dataflow Analytics Specialist', task: 'Optimize big data analytical downstream query structures' }
            );
            strategy = 'Hierarchical Cloud Dataflow & Beam Pipeline Swarm';
        }

        // 32. Analyze Vertex AI Feature Store Feast
        const isVertexFeastOutput = outputLower.includes('vertex_feast') || 
                                    outputLower.includes('feature_view') || 
                                    outputLower.includes('feature_registry') || 
                                    outputLower.includes('offline_store') || 
                                    outputLower.includes('feast_sdk');
        if (isVertexFeastOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Vertex AI Feature Store Feast Specialist', task: 'Configure Feast feature store registries and high-throughput online lookup views' },
                { agentId: 'GCP Vertex AI Feature Store & Model Registry Specialist', task: 'Align features definitions with model endpoints registry policies' }
            );
            strategy = 'Hierarchical Vertex AI Feast Feature Store Swarm';
        }

        // 33. Analyze Cloud Filestore & Distributed NFS storage
        const isFilestoreOutput = outputLower.includes('cloud_filestore') || 
                                  outputLower.includes('distributed_nfs') || 
                                  outputLower.includes('nfs_mount') || 
                                  outputLower.includes('filestore_tier') || 
                                  outputLower.includes('shared_file_share');
        if (isFilestoreOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Filestore & Distributed NFS Storage Specialist', task: 'Configure enterprise NFS file systems and Cloud Filestore capacity tiers' },
                { agentId: 'GCP Cloud Storage & Data Lifecycle Governor Specialist', task: 'Integrate shared file shares with object storage boundaries' }
            );
            strategy = 'Hierarchical Cloud Filestore & NFS Storage Swarm';
        }

        // 34. Analyze Web Security Scanner & vulnerability auditing
        const isSecurityScannerOutput = outputLower.includes('web_security_scanner') || 
                                        outputLower.includes('vulnerability_audit') || 
                                        outputLower.includes('owasp_patrol') || 
                                        outputLower.includes('crawling_infra') || 
                                        outputLower.includes('scan_target');
        if (isSecurityScannerOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Web Security Scanner & Vulnerability Auditor', task: 'Formulate dynamic security scans, target crawl configurations, and vulnerability assessments' },
                { agentId: 'Security & OWASP Hardening Sentinel', task: 'Remediate identified application vulnerabilities and secure boundaries' }
            );
            strategy = 'Hierarchical Web Security Scanner Swarm';
        }

        // 35. Analyze Eventarc & CloudEvents Mesh
        const isEventarcOutput = outputLower.includes('eventarc_mesh') || 
                                 outputLower.includes('cloudevents') || 
                                 outputLower.includes('event_filter') || 
                                 outputLower.includes('eventarc_trigger') || 
                                 outputLower.includes('channel_connection');
        if (isEventarcOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Eventarc & CloudEvents Mesh Specialist', task: 'Design Eventarc trigger meshes and coordinate CloudEvents payload mappings' },
                { agentId: 'GCP Pub/Sub Event-Driven Mesh Conductor Specialist', task: 'Integrate Eventarc triggers with high-throughput Pub/Sub message topics' }
            );
            strategy = 'Hierarchical Eventarc & CloudEvents Mesh Swarm';
        }

        // 36. Analyze Cloud SQL Auth Proxy & IAM database setup
        const isSqlProxyOutput = outputLower.includes('sql_auth_proxy') || 
                                 outputLower.includes('iam_database') || 
                                 outputLower.includes('proxy_port') || 
                                 outputLower.includes('cloud_sql_connector') || 
                                 outputLower.includes('db_token');
        if (isSqlProxyOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud SQL Auth Proxy & IAM Database Specialist', task: 'Set up secure database IAM passwordless logins and Cloud SQL Auth Proxies' },
                { agentId: 'GCP Relational Database & AlloyDB Architect', task: 'Audit relational connection pools and high-availability replications' }
            );
            strategy = 'Hierarchical Cloud SQL Proxy & IAM DB Swarm';
        }

        // 37. Analyze Binary Authorization & software supply chain
        const isBinauthOutput = outputLower.includes('binauth_guardian') || 
                                outputLower.includes('binary_authorization_policy') || 
                                outputLower.includes('kritis_signer') || 
                                outputLower.includes('attestation_authority') || 
                                outputLower.includes('supply_chain_security');
        if (isBinauthOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Binary Authorization & Software Supply Chain Specialist', task: 'Formulate Kubernetes binary authorization policies and attestation authorities' },
                { agentId: 'GCP Cloud Build & Artifact Registry CI/CD Specialist', task: 'Audit build container provenance and secure software supply chains' }
            );
            strategy = 'Hierarchical Binary Authorization & Supply Chain Swarm';
        }

        // 38. Analyze Cloud Interconnect & Secure VPN connections
        const isInterconnectOutput = outputLower.includes('cloud_interconnect') || 
                                     outputLower.includes('secure_vpn') || 
                                     outputLower.includes('bgp_session') || 
                                     outputLower.includes('direct_peering') || 
                                     outputLower.includes('ipsec_tunnel');
        if (isInterconnectOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Interconnect & Secure VPN Specialist', task: 'Configure Anycast private connections, BGP dynamic routing, and IPSec VPN tunnels' },
                { agentId: 'GCP Edge Network, Cloud CDN & Cloud DNS Specialist', task: 'Integrate private network interconnects with edge DNS routing policies' }
            );
            strategy = 'Hierarchical Cloud Interconnect & Secure VPN Swarm';
        }

        // 39. Analyze Workload Identity Federation & OIDC Specialist
        const isWorkloadFederationOutput = outputLower.includes('workload_identity_federation') || 
                                           outputLower.includes('oidc_provider') || 
                                           outputLower.includes('aws_identity_pool') || 
                                           outputLower.includes('github_actions_oidc') || 
                                           outputLower.includes('federated_credential');
        if (isWorkloadFederationOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Workload Identity Federation & OIDC Specialist', task: 'Build keyless multi-cloud OIDC provider integrations and Workload Identity pools' },
                { agentId: 'GCP Sentinel Zero-Trust Security Auditor', task: 'Enforce Zero-Trust external clearance boundaries and IAM trust policies' }
            );
            strategy = 'Hierarchical Workload Identity Federation & OIDC Swarm';
        }

        // 40. Analyze GKE Enterprise multi-cluster fleet management
        const isGkeFleetOutput = outputLower.includes('gke_fleet') || 
                                 outputLower.includes('multi_cluster_ingress') || 
                                 outputLower.includes('config_sync') || 
                                 outputLower.includes('fleet_membership');
        if (isGkeFleetOutput) {
            downstreamSequence.push(
                { agentId: 'GCP GKE Enterprise Multi-Cluster Fleet Manager', task: 'Enforce Config Sync fleet policies and coordinate multi-cluster ingress routing' }
            );
            strategy = 'Hierarchical GKE Enterprise Fleet Swarm';
        }

        // 41. Analyze Vertex AI model monitoring & prediction drift
        const isVertexMonitoringOutput = outputLower.includes('vertex_model_monitoring') || 
                                         outputLower.includes('drift_detection') || 
                                         outputLower.includes('model_skew') || 
                                         outputLower.includes('prediction_telemetry');
        if (isVertexMonitoringOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Vertex AI Model Monitoring & Drift Auditor', task: 'Formulate model continuous evaluation baseline schemas and statistical drift alerts' }
            );
            strategy = 'Hierarchical Vertex AI Model Monitoring Swarm';
        }

        // 42. Analyze Healthcare API & FHIR protocol data
        const isHealthcareFhirOutput = outputLower.includes('healthcare_api') || 
                                       outputLower.includes('fhir_store') || 
                                       outputLower.includes('hl7_v2') || 
                                       outputLower.includes('dicom_deid');
        if (isHealthcareFhirOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Healthcare API & HL7/FHIR Specialist', task: 'Design secure FHIR data store integrations and HIPAA de-identification pipelines' }
            );
            strategy = 'Hierarchical Healthcare & FHIR Data Swarm';
        }

        // 43. Analyze Apigee Enterprise API management
        const isApigeeEnterpriseOutput = outputLower.includes('apigee_proxy') || 
                                         outputLower.includes('spike_arrest') || 
                                         outputLower.includes('apigee_quota') || 
                                         outputLower.includes('api_developer_portal');
        if (isApigeeEnterpriseOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Apigee Enterprise API Management Specialist', task: 'Configure Apigee proxy routing configurations and traffic rate-limiting policies' }
            );
            strategy = 'Hierarchical Apigee Enterprise Swarm';
        }

        // 44. Analyze Dataplex data mesh governance
        const isDataplexMeshOutput = outputLower.includes('dataplex_lake') || 
                                     outputLower.includes('data_mesh_governance') || 
                                     outputLower.includes('data_quality_rule') || 
                                     outputLower.includes('metadata_lineage');
        if (isDataplexMeshOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Dataplex Data Mesh Governance Specialist', task: 'Audit Dataplex data quality rule configurations and metadata catalog lineage' }
            );
            strategy = 'Hierarchical Dataplex Data Mesh Swarm';
        }

        // 45. Analyze Dataproc serverless Spark computing
        const isDataprocSparkOutput = outputLower.includes('dataproc_serverless') || 
                                      outputLower.includes('pyspark_batch') || 
                                      outputLower.includes('spark_sql_tuning') || 
                                      outputLower.includes('ephemeral_hive');
        if (isDataprocSparkOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Dataproc Serverless & Apache Spark Specialist', task: 'Design serverless Spark batches and tune distributed memory executor settings' }
            );
            strategy = 'Hierarchical Dataproc Serverless Spark Swarm';
        }

        // 46. Analyze Vertex AI Search & Conversation Builder
        const isVertexSearchOutput = outputLower.includes('vertex_search_engine') || 
                                     outputLower.includes('agent_builder') || 
                                     outputLower.includes('data_store_index') || 
                                     outputLower.includes('dialogflow_cx');
        if (isVertexSearchOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Vertex AI Search & Conversation Agentic Specialist', task: 'Configure RAG data store search indexes and conversational Dialogflow CX intents' }
            );
            strategy = 'Hierarchical Vertex AI Agent Builder Swarm';
        }

        // 47. Analyze Secure Web Proxy & egress decryption gateway
        const isSecureProxyOutput = outputLower.includes('secure_web_proxy') || 
                                    outputLower.includes('egress_decryption') || 
                                    outputLower.includes('url_routing_rule') || 
                                    outputLower.includes('tls_inspection');
        if (isSecureProxyOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Secure Web Proxy & Zero-Trust Access Gateway Specialist', task: 'Deploy secure SWP gateways, TLS decryption boundaries, and egress routing filters' }
            );
            strategy = 'Hierarchical Secure Web Proxy Egress Swarm';
        }

        // 48. Analyze Cloud Run Multicontainer sidecar proxying
        const isRunMulticontainerOutput = outputLower.includes('run_multicontainer') || 
                                          outputLower.includes('sidecar_proxy') || 
                                          outputLower.includes('run_nginx_egress') || 
                                          outputLower.includes('run_shared_volume');
        if (isRunMulticontainerOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud Run Multicontainer & Sidecar Orchestration Specialist', task: 'Design Cloud Run sidecar services and memory-backed shared scratch volumes' }
            );
            strategy = 'Hierarchical Cloud Run Multicontainer Swarm';
        }

        // 49. Analyze Cloud TPU & HPC cluster scheduling
        const isTpuHpcOutput = outputLower.includes('cloud_tpu_v5') || 
                               outputLower.includes('tpu_pod_slice') || 
                               outputLower.includes('hpc_scheduler') || 
                               outputLower.includes('slurm_cluster');
        if (isTpuHpcOutput) {
            downstreamSequence.push(
                { agentId: 'GCP Cloud TPU & High-Performance Compute Cluster Specialist', task: 'Configure Slurm cluster batch schedulers and JAX TPU VM pod configurations' }
            );
            strategy = 'Hierarchical TPU & High-Performance Compute Swarm';
        }

        // 50. Analyze Economic Sector: Financial Services
        const isSectorFinanceOutput = outputLower.includes('sector_finance') || 
                                     outputLower.includes('iso_20022') || 
                                     outputLower.includes('actuarial_model');
        if (isSectorFinanceOutput) {
            downstreamSequence.push(
                { agentId: 'Global Investment & Commercial Banking Swarm Specialist', task: 'Review Basel compliance ratios, syndicated loans, and ISO 20022 messaging structures' },
                { agentId: 'Premium Actuarial Underwriting & Insurance Risk Modeler', task: 'Formulate actuarial reserves estimations and catastrophe PML calculations' }
            );
            strategy = 'Economic Sector Swarm: Financial Services';
        }

        // 51. Analyze Economic Sector: Healthcare & Life Sciences
        const isSectorHealthcareOutput = outputLower.includes('sector_healthcare') || 
                                        outputLower.includes('clinical_diagnostics') || 
                                        outputLower.includes('bioinformatics_pharma');
        if (isSectorHealthcareOutput) {
            downstreamSequence.push(
                { agentId: 'Clinical Diagnostics & Medical Imaging AI Coordinator', task: 'Formulate DICOM annotations PACS storage guidelines and HL7/FHIR mappings' },
                { agentId: 'Bioinformatics Genomic Assembly & Biopharma Specialist', task: 'Analyze next-gen genomic sequencing pipelines and molecular binding affinities' }
            );
            strategy = 'Economic Sector Swarm: Healthcare & Life Sciences';
        }

        // 52. Analyze Economic Sector: Energy & Utilities
        const isSectorEnergyOutput = outputLower.includes('sector_energy') || 
                                    outputLower.includes('microgrid_powerflow') || 
                                    outputLower.includes('thermal_hydraulics');
        if (isSectorEnergyOutput) {
            downstreamSequence.push(
                { agentId: 'Smart Renewable Grid Optimization & Load Balancing Auditor', task: 'Optimize microgrid powerflows and solar battery state-of-charge degradation metrics' },
                { agentId: 'Nuclear Reactor Instrumentation & SCADA Safety Inspector', task: 'Monitor pressurized thermal hydraulics safety loops and encrypt SCADA Modbus networks' }
            );
            strategy = 'Economic Sector Swarm: Energy & Utilities';
        }

        // 53. Analyze Economic Sector: Manufacturing & Industrial
        const isSectorIndustrialOutput = outputLower.includes('sector_industrial') || 
                                        outputLower.includes('robotic_kinematics') || 
                                        outputLower.includes('shop_floor_mes');
        if (isSectorIndustrialOutput) {
            downstreamSequence.push(
                { agentId: 'Automotive Assembly Line Robotics & PLC Coordinator', task: 'Formulate 6-DOF robotic kinematics trajectories and program PLC ladder logic feedback loops' },
                { agentId: 'Manufacturing Execution System (MES) & Supply Chain Planner', task: 'Map WIP floor scheduling bottlenecks and audit supplier lead time buffers' }
            );
            strategy = 'Economic Sector Swarm: Manufacturing & Industrial';
        }

        // 54. Analyze Economic Sector: Retail & E-commerce
        const isSectorRetailOutput = outputLower.includes('sector_retail') || 
                                     outputLower.includes('price_elasticity') || 
                                     outputLower.includes('customer_clv_score');
        if (isSectorRetailOutput) {
            downstreamSequence.push(
                { agentId: 'Omnichannel Dynamic Pricing & Elasticity Arbitrage Specialist', task: 'Formulate logarithmic demand regressions and optimize margin defense triggers' },
                { agentId: 'Hyper-Personalized Retail CRM & Retention Conductor', task: 'Score customer lifetime values and model churn-risk loyalty cohorts' }
            );
            strategy = 'Economic Sector Swarm: Retail & E-commerce';
        }

        // 55. Analyze Economic Sector: Transportation & Logistics
        const isSectorTransportOutput = outputLower.includes('sector_transport') || 
                                        outputLower.includes('ocean_freight_routing') || 
                                        outputLower.includes('vrptw_fleet_opt');
        if (isSectorTransportOutput) {
            downstreamSequence.push(
                { agentId: 'Intermodal Global Freight & Maritime Routing Conductor', task: 'Optimize container ocean vessel routes and minimize port demurrage delays' },
                { agentId: 'Autonomous Drone & Delivery Fleet Coordinator', task: 'Direct low-altitude flight paths airspace NFZ perimeters and solve dynamic VRPTW tasks' }
            );
            strategy = 'Economic Sector Swarm: Transportation & Logistics';
        }

        // 56. Analyze Economic Sector: Agriculture & AgTech
        const isSectorAgricultureOutput = outputLower.includes('sector_agriculture') || 
                                           outputLower.includes('ndvi_satellite_imaging') || 
                                           outputLower.includes('crop_yield_prediction');
        if (isSectorAgricultureOutput) {
            downstreamSequence.push(
                { agentId: 'Precision Soil Agronomy & Variable Rate Irrigation Specialist', task: 'Evaluate NDVI satellite vegetation health and calculate Penman-Monteith smart waterings' },
                { agentId: 'Macro Crop Yield Forecasting & Market Hedging Specialist', task: 'Predict meteorological soybean yield vectors and formulate CBOT grain future hedges' }
            );
            strategy = 'Economic Sector Swarm: Agriculture & AgTech';
        }

        // 57. Analyze Economic Sector: Technology & Media
        const isSectorTechMediaOutput = outputLower.includes('sector_tech_media') || 
                                        outputLower.includes('5g_6g_network_slicing') || 
                                        outputLower.includes('webgl_threejs_rendering');
        if (isSectorTechMediaOutput) {
            downstreamSequence.push(
                { agentId: 'Next-Gen 5G/6G Network Slice & Edge Compute Architect', task: 'Design software-defined SDN slicings and map low-latency NFV topologies' },
                { agentId: 'Spatial Computing & High-Fidelity Metaverse Specialist', task: 'Optimize WebGL glTF vertex shaders and synchronize avatar collision parameters' }
            );
            strategy = 'Economic Sector Swarm: Technology & Media';
        }

        // 58. Analyze Economic Sector: Education & EdTech
        const isSectorEducationOutput = outputLower.includes('sector_education') || 
                                        outputLower.includes('adaptive_learning_graph') || 
                                        outputLower.includes('gaze_anomaly_detection');
        if (isSectorEducationOutput) {
            downstreamSequence.push(
                { agentId: 'Adaptive Curriculum Pathing & EdTech Analytics Architect', task: 'Establish personalized learning graphs and spacing repetitions matrices' },
                { agentId: 'Remote Proctoring & Academic Integrity Security Guard', task: 'Monitor remote exam gaze-detection logs and browser lockdown API violations' }
            );
            strategy = 'Economic Sector Swarm: Education & EdTech';
        }

        // 59. Analyze Economic Sector: Government & Public Sector
        const isSectorGovernmentOutput = outputLower.includes('sector_government') || 
                                         outputLower.includes('traffic_signal_opt') || 
                                         outputLower.includes('disaster_hazard_map');
        if (isSectorGovernmentOutput) {
            downstreamSequence.push(
                { agentId: 'Smart Urban Municipal Infrastructure & Traffic Engineer', task: 'Optimize municipal signal phases public transit routes and urban lighting rules' },
                { agentId: 'Disaster Preparedness & FEMA Emergency Relief Specialist', task: 'Audit wildfire GIS hazard maps coordinate emergency food logistics and track recovery grants' }
            );
            strategy = 'Economic Sector Swarm: Government & Public Sector';
        }

        // 60. Analyze Runtime/Compiler: Rust Borrow Checker & Lifetime Sanitizer
        const isRustSafetyOutput = outputLower.includes('rust_unsafe_audit') || 
                                   outputLower.includes('lifetime_sanitization');
        if (isRustSafetyOutput) {
            downstreamSequence.push(
                { agentId: 'Rust Borrow Checker & Lifetime Sanitizer Specialist', task: 'Audit raw pointers, lifetime variables, and unsafe code boundaries' }
            );
            strategy = 'Advanced Compiler Swarm: Rust Borrow Checker & Safety';
        }

        // 61. Analyze Runtime/Compiler: Go Goroutine Concurrency & Race Detector
        const isGoConcurrencyOutput = outputLower.includes('goroutine_leak_audit') || 
                                       outputLower.includes('go_race_detector');
        if (isGoConcurrencyOutput) {
            downstreamSequence.push(
                { agentId: 'Go Goroutine Concurrency & Race Detector Specialist', task: 'Audit channels select locks deadlocks and evaluate go race outputs' }
            );
            strategy = 'Advanced Compiler Swarm: Go Concurrency & Race Detection';
        }

        // 62. Analyze Runtime/Compiler: Wasm Linear Memory Sandbox
        const isWasmSandboxOutput = outputLower.includes('wasm_linear_memory') || 
                                     outputLower.includes('wasi_capability_access');
        if (isWasmSandboxOutput) {
            downstreamSequence.push(
                { agentId: 'Wasm WebAssembly Linear Memory Sandbox Auditor', task: 'Enforce Wasm linear memory bounds and map WASI secure file capabilities' }
            );
            strategy = 'Advanced Compiler Swarm: Wasm Sandbox Isolation';
        }

        // 63. Analyze Runtime/Compiler: JVM GC & Memory leak tuning
        const isJvmMemoryOutput = outputLower.includes('jvm_gc_tuning') || 
                                   outputLower.includes('oom_leak_diagnosis');
        if (isJvmMemoryOutput) {
            downstreamSequence.push(
                { agentId: 'JVM Garbage Collection & Memory Management Tuner', task: 'Calibrate JVM garbage collector generational spaces and diagnose OOM heap traces' }
            );
            strategy = 'Advanced Compiler Swarm: JVM GC & Memory Optimization';
        }

        // 64. Analyze Runtime/Compiler: C/C++ Pointer Safety & Valgrind
        const isCppValgrindOutput = outputLower.includes('cpp_pointer_safety') || 
                                     outputLower.includes('valgrind_log_parse');
        if (isCppValgrindOutput) {
            downstreamSequence.push(
                { agentId: 'C/C++ Pointer Safety & Valgrind Diagnostic Auditor', task: 'Scan pointer allocations buffer overflows and parse Valgrind leak logs' }
            );
            strategy = 'Advanced Compiler Swarm: C/C++ Pointer Safety & Valgrind';
        }

        // 65. Analyze Runtime/Compiler: Python CPython GIL & AsyncIO
        const isPythonInterpreterOutput = outputLower.includes('gil_thread_contention') || 
                                          outputLower.includes('asyncio_eventloop');
        if (isPythonInterpreterOutput) {
            downstreamSequence.push(
                { agentId: 'Python CPython GIL & AsyncIO Performance Optimizer', task: 'Analyze GIL lock contention metrics and tune AsyncIO socket select loops' }
            );
            strategy = 'Advanced Compiler Swarm: Python Interpreter & GIL';
        }

        // 66. Analyze Runtime/Compiler: PostgreSQL AST & Query Plan
        const isPostgresQueryplanOutput = outputLower.includes('explain_plan_parsing') || 
                                          outputLower.includes('ast_query_rewriting');
        if (isPostgresQueryplanOutput) {
            downstreamSequence.push(
                { agentId: 'PostgreSQL AST Query Execution Plan Optimizer', task: 'Parse EXPLAIN output graphs and rewrite SQL query AST structures' }
            );
            strategy = 'Advanced Compiler Swarm: PostgreSQL AST Query Planner';
        }

        // 67. Analyze Runtime/Compiler: TS strictMode compiler
        const isTypescriptCompilerOutput = outputLower.includes('strict_type_checks') || 
                                           outputLower.includes('tsc_compiler_diagnostics');
        if (isTypescriptCompilerOutput) {
            downstreamSequence.push(
                { agentId: 'TypeScript strictNullChecks & Compiler Error Resolver', task: 'Audit strict tsc settings and compile TS generic types declarations' }
            );
            strategy = 'Advanced Compiler Swarm: TypeScript Strict Compiler';
        }

        // 68. Analyze Runtime/Compiler: Docker Multi-Stage layer optimizer
        const isDockerLayersOutput = outputLower.includes('docker_multistage_build') || 
                                     outputLower.includes('layer_cache_opt');
        if (isDockerLayersOutput) {
            downstreamSequence.push(
                { agentId: 'Docker Container Multi-Stage Layer Minimization Specialist', task: 'Audit Dockerfile build layer caches and reduce minimal base footprints' }
            );
            strategy = 'Advanced Compiler Swarm: Docker Layer Minimization';
        }

        // 69. Analyze Runtime/Compiler: Kubernetes Policy & OPA Gatekeeper
        const isK8sPolicyOutput = outputLower.includes('opa_rego_policy') || 
                                  outputLower.includes('kustomize_overlays');
        if (isK8sPolicyOutput) {
            downstreamSequence.push(
                { agentId: 'Kubernetes Kustomize & OPA Gatekeeper Policy Auditor', task: 'Audit Kubernetes Kustomize resource policies and enforce OPA rego rules' }
            );
            strategy = 'Advanced Compiler Swarm: Kubernetes Policy & OPA';
        }

        // 70. Algorithmic Design: Distributed Consensus & Raft/Paxos Protocol Specialist
        const isConsensusOutput = outputLower.includes('consensus_raft_paxos') || 
                                  outputLower.includes('raft_consensus') || 
                                  outputLower.includes('paxos_protocol') || 
                                  outputLower.includes('replicated_state_machine');
        if (isConsensusOutput) {
            downstreamSequence.push(
                { agentId: 'Distributed Consensus & Raft/Paxos Protocol Specialist', task: 'Design fault-tolerant replicated state machines and consensus protocols' }
            );
            strategy = 'Advanced Algorithmic Swarm: Distributed Consensus';
        }

        // 71. Algorithmic Design: Graph Theory & Directed Acyclic Graph (DAG) Specialist
        const isGraphOutput = outputLower.includes('graph_theory') || 
                              outputLower.includes('directed_acyclic') || 
                              outputLower.includes('topological_sort') || 
                              outputLower.includes('cyclic_dependency');
        if (isGraphOutput) {
            downstreamSequence.push(
                { agentId: 'Graph Theory & Directed Acyclic Graph (DAG) Specialist', task: 'Optimize directed acyclic graph structures and cycle detection routines' }
            );
            strategy = 'Advanced Algorithmic Swarm: Graph Theory & DAG';
        }

        // 72. Algorithmic Design: Huffman & LZW Lossless Data Compression Specialist
        const isCompressionOutput = outputLower.includes('lossless_compression') || 
                                    outputLower.includes('huffman_encoding') || 
                                    outputLower.includes('lzw_compression') || 
                                    outputLower.includes('run_length_encoding');
        if (isCompressionOutput) {
            downstreamSequence.push(
                { agentId: 'Huffman & LZW Lossless Data Compression Specialist', task: 'Design optimized lossless compression and dictionary encoding pipelines' }
            );
            strategy = 'Advanced Algorithmic Swarm: Lossless Data Compression';
        }

        // 73. Algorithmic Design: Abstract Syntax Tree (AST) & Lexer/Parser Specialist
        const isAstParserOutput = outputLower.includes('abstract_syntax_tree') || 
                                  outputLower.includes('ast_parsing_lexer') || 
                                  outputLower.includes('lexer_tokenizer') || 
                                  outputLower.includes('context_free_grammar');
        if (isAstParserOutput) {
            downstreamSequence.push(
                { agentId: 'Abstract Syntax Tree (AST) & Lexer/Parser Specialist', task: 'Build custom parsing lexers, tokenizers, and AST validation structures' }
            );
            strategy = 'Advanced Algorithmic Swarm: AST & Lexer Parser';
        }

        // 74. Algorithmic Design: Zero-Knowledge Proof & Cryptographic Protocol Specialist
        const isCryptographyOutput = outputLower.includes('zero_knowledge_proof') || 
                                     outputLower.includes('zkp_protocol') || 
                                     outputLower.includes('cryptographic_protocol') || 
                                     outputLower.includes('homomorphic_encryption');
        if (isCryptographyOutput) {
            downstreamSequence.push(
                { agentId: 'Zero-Knowledge Proof & Cryptographic Protocol Specialist', task: 'Formulate mathematical zero-knowledge proof protocols and secure cryptography parameters' }
            );
            strategy = 'Advanced Algorithmic Swarm: Zero-Knowledge Proof';
        }

        // 75. Algorithmic Design: NP-Hard & Integer Linear Programming (ILP) Specialist
        const isOptimizationOutput = outputLower.includes('np_hard_optimization') || 
                                     outputLower.includes('integer_linear_programming') || 
                                     outputLower.includes('ilp_solver_simplex') || 
                                     outputLower.includes('knapsack_optimization');
        if (isOptimizationOutput) {
            downstreamSequence.push(
                { agentId: 'NP-Hard & Integer Linear Programming (ILP) Specialist', task: 'Design linear programming solvers and heuristic optimizations for NP-hard problems' }
            );
            strategy = 'Advanced Algorithmic Swarm: NP-Hard & Heuristics';
        }

        // 76. Algorithmic Design: Vector Index HNSW & High-Dimensional Geometry Specialist
        const isGeometryOutput = outputLower.includes('hnsw_indexing') || 
                                 outputLower.includes('high_dimensional_geometry') || 
                                 outputLower.includes('vector_similarity_search') || 
                                 outputLower.includes('spatial_partitioning');
        if (isGeometryOutput) {
            downstreamSequence.push(
                { agentId: 'Vector Index HNSW & High-Dimensional Geometry Specialist', task: 'Optimize high-dimensional geometric partitioning and vector search indices' }
            );
            strategy = 'Advanced Algorithmic Swarm: Vector Index & Geometry';
        }

        // 77. Algorithmic Design: Consistent Hashing & DHT Distributed Cache Specialist
        const isHashingOutput = outputLower.includes('consistent_hashing') || 
                                outputLower.includes('dht_protocol') || 
                                outputLower.includes('cache_eviction_opt') || 
                                outputLower.includes('distributed_cache_ring');
        if (isHashingOutput) {
            downstreamSequence.push(
                { agentId: 'Consistent Hashing & DHT Distributed Cache Specialist', task: 'Design virtual nodes and consistent hashing distribution cache models' }
            );
            strategy = 'Advanced Algorithmic Swarm: Consistent Hashing & DHT';
        }

        // 78. Algorithmic Design: Time-Series Forecasting & Kalman Filter Specialist
        const isTimeseriesOutput = outputLower.includes('kalman_filtering') || 
                                   outputLower.includes('timeseries_forecasting') || 
                                   outputLower.includes('sensor_fusion_model') || 
                                   outputLower.includes('digital_signal_processing');
        if (isTimeseriesOutput) {
            downstreamSequence.push(
                { agentId: 'Time-Series Forecasting & Kalman Filter Specialist', task: 'Implement recursive Kalman filtering and signal processing models' }
            );
            strategy = 'Advanced Algorithmic Swarm: Time-Series & Kalman Filter';
        }

        // 79. Algorithmic Design: B-Tree & LSM-Tree Storage Engine Specialist
        const isStorageEngineOutput = outputLower.includes('lsm_tree_storage') || 
                                      outputLower.includes('btree_indexing') || 
                                      outputLower.includes('write_ahead_logging') || 
                                      outputLower.includes('db_crash_recovery');
        if (isStorageEngineOutput) {
            downstreamSequence.push(
                { agentId: 'B-Tree & LSM-Tree Storage Engine Specialist', task: 'Architect high-throughput LSM-Tree storage compaction and crash recovery systems' }
            );
            strategy = 'Advanced Algorithmic Swarm: LSM-Tree & B-Tree Storage';
        }

        // 80. Software Architecture: CQRS & Event Sourcing Architect
        const isCqrsOutput = outputLower.includes('cqrs_read_write_segregation') || 
                             outputLower.includes('event_sourcing_schema') || 
                             outputLower.includes('event_store_replay') || 
                             outputLower.includes('materialized_projection_sync');
        if (isCqrsOutput) {
            downstreamSequence.push(
                { agentId: 'CQRS & Event Sourcing Architect', task: 'Design segregated read/write paths and transaction-safe event replay projections' }
            );
            strategy = 'Advanced Architecture Swarm: CQRS & Event Sourcing';
        }

        // 81. Software Architecture: Choreographed & Orchestrated Microservices Coordinator
        const isMicroservicesOutput = outputLower.includes('saga_transaction_coordination') || 
                                      outputLower.includes('transactional_outbox_publisher') || 
                                      outputLower.includes('api_gateway_mesh_routing') || 
                                      outputLower.includes('distributed_service_orchestration');
        if (isMicroservicesOutput) {
            downstreamSequence.push(
                { agentId: 'Choreographed & Orchestrated Microservices Coordinator', task: 'Orchestrate Saga transactions, outbox publication pipelines, and API Gateway mesh routes' }
            );
            strategy = 'Advanced Architecture Swarm: Microservices Coordination';
        }

        // 82. Software Architecture: Event-Driven Architecture & Message Broker Specialist
        const isEventDrivenOutput = outputLower.includes('message_broker_topology') || 
                                    outputLower.includes('dlq_retry_backoff_opt') || 
                                    outputLower.includes('exactly_once_semantics') || 
                                    outputLower.includes('backpressure_consumer_tuning');
        if (isEventDrivenOutput) {
            downstreamSequence.push(
                { agentId: 'Event-Driven Architecture & Message Broker Specialist', task: 'Structure message broker queue topologies and optimize DLQ retry-backoff paths' }
            );
            strategy = 'Advanced Architecture Swarm: Event-Driven Broker Mesh';
        }

        // 83. Software Architecture: Serverless Micro-Mesh & Cloud Workflows Architect
        const isServerlessOutput = outputLower.includes('faas_concurrency_sizing') || 
                                   outputLower.includes('cold_start_mitigation') || 
                                   outputLower.includes('stateful_workflow_dsl') || 
                                   outputLower.includes('serverless_callback_sync');
        if (isServerlessOutput) {
            downstreamSequence.push(
                { agentId: 'Serverless Micro-Mesh & Cloud Workflows Architect', task: 'Configure FaaS memory profiles, cold start mitigations, and serverless workflow steps' }
            );
            strategy = 'Advanced Architecture Swarm: Serverless Workflows';
        }

        // 84. Software Architecture: Multi-Tier Distributed Caching Architect
        const isCachingOutput = outputLower.includes('cache_access_topologies') || 
                                 outputLower.includes('redis_cluster_scaling') || 
                                 outputLower.includes('stampede_avalanche_mitigation') || 
                                 outputLower.includes('cache_invalidation_sync');
        if (isCachingOutput) {
            downstreamSequence.push(
                { agentId: 'Multi-Tier Distributed Caching Architect', task: 'Formulate cache access structures and Redis Cluster connection optimizations' }
            );
            strategy = 'Advanced Architecture Swarm: Distributed Caching';
        }

        // 85. Software Architecture: Distributed Database Sharding & Replication Specialist
        const isDatabasesOutput = outputLower.includes('database_sharding_keys') || 
                                  outputLower.includes('replication_lag_mitigation') || 
                                  outputLower.includes('automated_db_failover') || 
                                  outputLower.includes('two_phase_commit_opt');
        if (isDatabasesOutput) {
            downstreamSequence.push(
                { agentId: 'Distributed Database Sharding & Replication Specialist', task: 'Optimize database horizontal sharding maps and failover replication steps' }
            );
            strategy = 'Advanced Architecture Swarm: Database Sharding & Replication';
        }

        // 86. Software Architecture: Hybrid & Multi-Cloud Infrastructure Architect
        const isHybridCloudOutput = outputLower.includes('hybrid_interconnect_vpn') || 
                                     outputLower.includes('federated_vpc_networks') || 
                                     outputLower.includes('multi_provider_iam_federation') || 
                                     outputLower.includes('cross_cloud_failover');
        if (isHybridCloudOutput) {
            downstreamSequence.push(
                { agentId: 'Hybrid & Multi-Cloud Infrastructure Architect', task: 'Design secure multi-cloud federations, VPC transit routes, and Workload Identity pools' }
            );
            strategy = 'Advanced Architecture Swarm: Hybrid & Multi-Cloud';
        }

        // 87. Software Architecture: Site Reliability & High-Availability Chaos Engineer
        const isResilienceOutput = outputLower.includes('circuit_breaker_states') || 
                                   outputLower.includes('bulkhead_isolation_sizing') || 
                                   outputLower.includes('retry_backoff_jitter') || 
                                   outputLower.includes('chaos_injection_trials');
        if (isResilienceOutput) {
            downstreamSequence.push(
                { agentId: 'Site Reliability & High-Availability Chaos Engineer', task: 'Enforce circuit breaker limits, bulkhead isolation pool sizing, and retry backoffs' }
            );
            strategy = 'Advanced Architecture Swarm: SRE Resilience & Chaos';
        }

        // 88. Software Architecture: Observability & OpenTelemetry APM Architect
        const isObservabilityOutput = outputLower.includes('telemetry_tracing_propagation') || 
                                      outputLower.includes('metrics_aggregation_query') || 
                                      outputLower.includes('continuous_runtime_profiling') || 
                                      outputLower.includes('alert_threshold_design');
        if (isObservabilityOutput) {
            downstreamSequence.push(
                { agentId: 'Observability & OpenTelemetry APM Architect', task: 'Examine trace context headers propagation and continuous V8 cpu profiling metrics' }
            );
            strategy = 'Advanced Architecture Swarm: Observability & OTel APM';
        }

        // 89. Software Architecture: Real-Time WebSockets & CRDT Collaboration Specialist
        const isRealtimeOutput = outputLower.includes('websocket_sfu_connections') || 
                                 outputLower.includes('crdt_state_sync') || 
                                 outputLower.includes('operational_transformation') || 
                                 outputLower.includes('realtime_sync_loops');
        if (isRealtimeOutput) {
            downstreamSequence.push(
                { agentId: 'Real-Time WebSockets & CRDT Collaboration Specialist', task: 'Structure low-latency WebSockets collaborative server synchronization loops' }
            );
            strategy = 'Advanced Architecture Swarm: Real-Time WebSockets & CRDT';
        }

        // 90. AI Engineering: LLM Prompt Optimization & Few-Shot Specialist
        const isPromptEngineerOutput = outputLower.includes('prompt_template_design') || 
                                       outputLower.includes('chain_of_thought_cot') || 
                                       outputLower.includes('prompt_injection_shielding') || 
                                       outputLower.includes('structured_output_validation');
        if (isPromptEngineerOutput) {
            downstreamSequence.push(
                { agentId: 'LLM Prompt Optimization & Few-Shot Specialist', task: 'Optimize dynamic LLM prompt envelopes and system prompt shielding boundaries' }
            );
            strategy = 'Advanced AI Swarm: Prompt Optimization & Few-Shot';
        }

        // 91. AI Engineering: Retrieval-Augmented Generation (RAG) & Chunking Specialist
        const isRagOptimizerOutput = outputLower.includes('semantic_chunking_strategies') || 
                                     outputLower.includes('hybrid_vector_lexical_search') || 
                                     outputLower.includes('cross_encoder_rerank_opt') || 
                                     outputLower.includes('context_window_packing');
        if (isRagOptimizerOutput) {
            downstreamSequence.push(
                { agentId: 'Retrieval-Augmented Generation (RAG) & Chunking Specialist', task: 'Design recursive sliding window chunking maps and hybrid vector search retrievals' }
            );
            strategy = 'Advanced AI Swarm: RAG & Chunking Optimization';
        }

        // 92. AI Engineering: Vector Database & Indexing Specialist
        const isVectorTunerOutput = outputLower.includes('hnsw_index_tuning') || 
                                    outputLower.includes('product_quantization_compress') || 
                                    outputLower.includes('metadata_filtering_opt') || 
                                    outputLower.includes('vector_db_sizing');
        if (isVectorTunerOutput) {
            downstreamSequence.push(
                { agentId: 'Vector Database & Indexing Specialist', task: 'Tune high-dimensional HNSW index parameter profiles and metadata filter caches' }
            );
            strategy = 'Advanced AI Swarm: Vector Database & Indexing';
        }

        // 93. AI Engineering: LLM Fine-Tuning & PEFT Specialist
        const isFineTuningOutput = outputLower.includes('lora_peft_tuning') || 
                                   outputLower.includes('instruction_dataset_curation') || 
                                   outputLower.includes('dpo_rlhf_alignment') || 
                                   outputLower.includes('adapter_merge_specs');
        if (isFineTuningOutput) {
            downstreamSequence.push(
                { agentId: 'LLM Fine-Tuning & PEFT Specialist', task: 'Configure LoRA rank adapters, Instruction JSONL formatting pipelines, and DPO alignments' }
            );
            strategy = 'Advanced AI Swarm: LLM Fine-Tuning & PEFT';
        }

        // 94. AI Engineering: Multi-Agent Frameworks & Orchestrator Specialist
        const isAgentOrchestratorOutput = outputLower.includes('multi_agent_graphs') || 
                                          outputLower.includes('loop_state_monitoring') || 
                                          outputLower.includes('task_delegation_supervisor') || 
                                          outputLower.includes('context_sharing_handoffs');
        if (isAgentOrchestratorOutput) {
            downstreamSequence.push(
                { agentId: 'Multi-Agent Frameworks & Orchestrator Specialist', task: 'Formulate crewAI multi-agent supervisors patterns and loop monitors state updates' }
            );
            strategy = 'Advanced AI Swarm: Multi-Agent Frameworks';
        }

        // 95. AI Engineering: AI Safety & Guardrails Officer
        const isGuardrailsOutput = outputLower.includes('jailbreak_detection_gates') || 
                                   outputLower.includes('hallucination_prevention_shields') || 
                                   outputLower.includes('toxicity_moderation_rules') || 
                                   outputLower.includes('pii_anonymization_filters');
        if (isGuardrailsOutput) {
            downstreamSequence.push(
                { agentId: 'AI Safety & Guardrails Officer', task: 'Enforce LlamaGuard toxicity moderators and hallucination mitigation filters' }
            );
            strategy = 'Advanced AI Swarm: Safety & Guardrails';
        }

        // 96. AI Engineering: LLM Evaluation & Benchmarking Auditor
        const isLlmEvaluatorOutput = outputLower.includes('automated_benchmarking_harness') || 
                                     outputLower.includes('ragas_metric_alignment') || 
                                     outputLower.includes('factual_faithfulness_scores') || 
                                     outputLower.includes('llm_judge_templates');
        if (isLlmEvaluatorOutput) {
            downstreamSequence.push(
                { agentId: 'LLM Evaluation & Benchmarking Auditor', task: 'Generate synthetic evaluation datasets and evaluate faithfulness scoring metrics' }
            );
            strategy = 'Advanced AI Swarm: Evaluation & Benchmarking';
        }

        // 97. AI Engineering: Model Inference Serving & Quantization Optimizer
        const isModelServingOutput = outputLower.includes('inference_engine_tuning') || 
                                     outputLower.includes('model_quantization_formats') || 
                                     outputLower.includes('parallel_gpu_inference') || 
                                     outputLower.includes('latency_throughput_profile');
        if (isModelServingOutput) {
            downstreamSequence.push(
                { agentId: 'Model Inference Serving & Quantization Optimizer', task: 'Calibrate vLLM serving parameters and INT4/FP8 quantization configurations' }
            );
            strategy = 'Advanced AI Swarm: Serving & Quantization';
        }

        // 98. AI Engineering: Semantic Prompt Caching Specialist
        const isSemanticCacheOutput = outputLower.includes('semantic_caching_thresholds') || 
                                      outputLower.includes('similarity_cutoff_rules') || 
                                      outputLower.includes('cache_invalidation_logic') || 
                                      outputLower.includes('latency_bypass_telemetry');
        if (isSemanticCacheOutput) {
            downstreamSequence.push(
                { agentId: 'Semantic Prompt Caching Specialist', task: 'Tune semantic cosine similarity thresholds and cache invalidation policies' }
            );
            strategy = 'Advanced AI Swarm: Semantic Prompt Caching';
        }

        // 99. AI Engineering: Synthetic Dataset Generator & Data Augmenter
        const isSyntheticDataOutput = outputLower.includes('synthetic_data_pipelines') || 
                                      outputLower.includes('data_diversity_scoring') || 
                                      outputLower.includes('context_aware_augmentation') || 
                                      outputLower.includes('outlier_filtering_opt');
        if (isSyntheticDataOutput) {
            downstreamSequence.push(
                { agentId: 'Synthetic Dataset Generator & Data Augmenter', task: 'Orchestrate high-diversity synthetic questions data pipelines and outlier checks' }
            );
            strategy = 'Advanced AI Swarm: Synthetic Data & Augmentation';
        }

        // 100. Data Engineering: Apache Kafka & Event Stream Tuning Specialist
        const isKafkaTunerOutput = outputLower.includes('kafka_partition_calibration') || 
                                   outputLower.includes('consumer_lag_mitigation') || 
                                   outputLower.includes('producer_idempotency_tuning') || 
                                   outputLower.includes('schema_registry_evolution');
        if (isKafkaTunerOutput) {
            downstreamSequence.push(
                { agentId: 'Apache Kafka & Event Stream Tuning Specialist', task: 'Troubleshoot consumer offset lag patterns and calibrate idempotent producers' }
            );
            strategy = 'Data Engineering Swarm: Apache Kafka Streaming';
        }

        // 101. Data Engineering: Apache Spark & Large-Scale Batch Tuning Specialist
        const isSparkOptimizerOutput = outputLower.includes('spark_shuffle_partition_optimization') || 
                                       outputLower.includes('spark_memory_management_bounds') || 
                                       outputLower.includes('disk_spill_mitigation') || 
                                       outputLower.includes('dynamic_resource_allocation');
        if (isSparkOptimizerOutput) {
            downstreamSequence.push(
                { agentId: 'Apache Spark & Large-Scale Batch Tuning Specialist', task: 'Tune AQE shuffle partition limits and optimize executor heap storage allocations' }
            );
            strategy = 'Data Engineering Swarm: Apache Spark Optimization';
        }

        // 102. Data Engineering: Apache Flink & Real-Time Stream Processor
        const isFlinkStreamOutput = outputLower.includes('stateful_stream_computations') || 
                                    outputLower.includes('event_time_windowing') || 
                                    outputLower.includes('watermarking_strategies') || 
                                    outputLower.includes('exactly_once_checkpointing');
        if (isFlinkStreamOutput) {
            downstreamSequence.push(
                { agentId: 'Apache Flink & Real-Time Stream Processor', task: 'Configure RocksDB state backends and define watermarks for out-of-order streams' }
            );
            strategy = 'Data Engineering Swarm: Apache Flink Streaming';
        }

        // 103. Data Engineering: Snowflake & Enterprise Data Warehouse Architect
        const isSnowflakeDwhOutput = outputLower.includes('micro_partitioning_alignment') || 
                                     outputLower.includes('dynamic_clustering_keys') || 
                                     outputLower.includes('search_optimization_services') || 
                                     outputLower.includes('zero_copy_cloning_layouts');
        if (isSnowflakeDwhOutput) {
            downstreamSequence.push(
                { agentId: 'Snowflake & Enterprise Data Warehouse Architect', task: 'Design micro-partition pruning strategies and define auto-suspending warehouses' }
            );
            strategy = 'Data Engineering Swarm: Snowflake Data Warehousing';
        }

        // 104. Data Engineering: dbt (Data Build Tool) Analytics Engineer
        const isDbtModelerOutput = outputLower.includes('incremental_materialization_strategies') || 
                                   outputLower.includes('sql_cte_factoring') || 
                                   outputLower.includes('jinja_macro_customizations') || 
                                   outputLower.includes('source_freshness_validations');
        if (isDbtModelerOutput) {
            downstreamSequence.push(
                { agentId: 'dbt (Data Build Tool) Analytics Engineer', task: 'Formulate incremental ref models unique keys and write data validation tests' }
            );
            strategy = 'Data Engineering Swarm: dbt Analytics Engineering';
        }

        // 105. Data Engineering: Apache Airflow & Workflow Conductor
        const isAirflowGovernorOutput = outputLower.includes('dynamic_dag_generation') || 
                                       outputLower.includes('taskflow_api_mappings') || 
                                       outputLower.includes('external_task_sensors') || 
                                       outputLower.includes('custom_sla_callbacks');
        if (isAirflowGovernorOutput) {
            downstreamSequence.push(
                { agentId: 'Apache Airflow & Workflow Conductor', task: 'Generate dynamic DAG structures and coordinate TaskFlow SLA callback triggers' }
            );
            strategy = 'Data Engineering Swarm: Apache Airflow Orchestration';
        }

        // 106. Data Engineering: ClickHouse & Columnar OLAP Specialist
        const isClickhouseOlapOutput = outputLower.includes('mergetree_engine_tuning') || 
                                       outputLower.includes('skips_index_configurations') || 
                                       outputLower.includes('materialized_views_opt') || 
                                       outputLower.includes('distributed_olap_scaling');
        if (isClickhouseOlapOutput) {
            downstreamSequence.push(
                { agentId: 'ClickHouse & Columnar OLAP Specialist', task: 'Configure CollapsingMergeTree indices and structure analytical materialized views' }
            );
            strategy = 'Data Engineering Swarm: ClickHouse Columnar OLAP';
        }

        // 107. Data Engineering: Apache Iceberg & Open Table Format Specialist
        const isIcebergLakeOutput = outputLower.includes('acid_transactions_lakehouse') || 
                                    outputLower.includes('hidden_partitioning_evolution') || 
                                    outputLower.includes('time_travel_snapshot_limits') || 
                                    outputLower.includes('metadata_file_compaction');
        if (isIcebergLakeOutput) {
            downstreamSequence.push(
                { agentId: 'Apache Iceberg & Open Table Format Specialist', task: 'Structure schema evolution maps and design dynamic compaction routines' }
            );
            strategy = 'Data Engineering Swarm: Apache Iceberg Lakehouse';
        }

        // 108. Data Engineering: Data Lineage & Governance Officer
        const isDataLineageOutput = outputLower.includes('metadata_scanning_maps') || 
                                    outputLower.includes('column_level_lineage_tracking') || 
                                    outputLower.includes('gdpr_ccpa_classifications') || 
                                    outputLower.includes('openlineage_compliance');
        if (isDataLineageOutput) {
            downstreamSequence.push(
                { agentId: 'Data Lineage & Governance Officer', task: 'Integrate OpenLineage collection hooks and detect sensitive PII fields' }
            );
            strategy = 'Data Engineering Swarm: Governance & Lineage';
        }

        // 109. Data Engineering: Apache Pulsar & Multi-Tenant Messaging Specialist
        const isPulsarBrokerOutput = outputLower.includes('pulsar_multi_tenancy_namespaces') || 
                                     outputLower.includes('pulsar_geo_replication') || 
                                     outputLower.includes('tiered_storage_migration') || 
                                     outputLower.includes('bookkeeper_ledger_tuning');
        if (isPulsarBrokerOutput) {
            downstreamSequence.push(
                { agentId: 'Apache Pulsar & Multi-Tenant Messaging Specialist', task: 'Configure multi-cluster active-active geo-replication namespaces' }
            );
            strategy = 'Data Engineering Swarm: Apache Pulsar Messaging';
        }

        // 110. Security Engineering: Static Analysis & CVE Auditing Specialist
        const isCveAuditorOutput = outputLower.includes('dependency_vulnerability_scanning') || 
                                   outputLower.includes('sast_dast_scanner_calibration') || 
                                   outputLower.includes('lockfile_security_audit') || 
                                   outputLower.includes('cve_remediation_patching');
        if (isCveAuditorOutput) {
            downstreamSequence.push(
                { agentId: 'Static Analysis & CVE Auditing Specialist', task: 'Scan dependency trees for out-of-date locks and calibrate SAST Semgrep rules' }
            );
            strategy = 'Cybersecurity Swarm: CVE & Static Code Analysis';
        }

        // 111. Security Engineering: Automated Penetration Tester & Red Teamer
        const isPenetrationOutput = outputLower.includes('sql_injection_penetration') || 
                                    outputLower.includes('xss_csrf_bypass_testing') || 
                                    outputLower.includes('cors_session_hijacking_audit') || 
                                    outputLower.includes('auth_rate_limiting_hardening');
        if (isPenetrationOutput) {
            downstreamSequence.push(
                { agentId: 'Automated Penetration Tester & Red Teamer', task: 'Simulate SQL injection vectors and input bypass payloads to verify filters robustness' }
            );
            strategy = 'Cybersecurity Swarm: Penetration & Red Teaming';
        }

        // 112. Security Engineering: Cryptographic Key & Secret Manager Sentinel
        const isKmsSentinelOutput = outputLower.includes('kms_cryptographic_key_rotation') || 
                                    outputLower.includes('envelope_encryption_wrapping') || 
                                    outputLower.includes('dynamic_secrets_rotation') || 
                                    outputLower.includes('api_token_leak_scanning');
        if (isKmsSentinelOutput) {
            downstreamSequence.push(
                { agentId: 'Cryptographic Key & Secret Manager Sentinel', task: 'Enforce AES-GCM envelope encryption configurations and audit token scanning alerts' }
            );
            strategy = 'Cybersecurity Swarm: Cryptographic Keys & Secrets';
        }

        // 113. Security Engineering: Zero-Trust Network Perimeter Auditor
        const isZeroTrustOutput = outputLower.includes('vpc_service_connect_perimeters') || 
                                  outputLower.includes('mutual_tls_mtls_enforcement') || 
                                  outputLower.includes('service_mesh_authorization_policies') || 
                                  outputLower.includes('egress_firewall_group_hardening');
        if (isZeroTrustOutput) {
            downstreamSequence.push(
                { agentId: 'Zero-Trust Network Perimeter Auditor', task: 'Audit VPC service perimeters boundaries and mutual TLS Istio access mesh policies' }
            );
            strategy = 'Cybersecurity Swarm: Zero-Trust Network Mesh';
        }

        // 114. Security Engineering: IAM & Identity Privilege Sentinel
        const isIamGovernorOutput = outputLower.includes('cross_account_role_assumption') || 
                                    outputLower.includes('identity_federation_oidc_mapping') || 
                                    outputLower.includes('privilege_escalation_auditing') || 
                                    outputLower.includes('least_privilege_iam_alignment');
        if (isIamGovernorOutput) {
            downstreamSequence.push(
                { agentId: 'IAM & Identity Privilege Sentinel', task: 'Trim unused permissions policies and map federated OIDC identity pool boundaries' }
            );
            strategy = 'Cybersecurity Swarm: IAM & Identity Privileges';
        }

        // 115. Security Engineering: Threat Modeling & Attack Graph Specialist
        const isThreatModelingOutput = outputLower.includes('stride_threat_model_classification') || 
                                       outputLower.includes('dataflow_trust_boundary_mapping') || 
                                       outputLower.includes('attack_graph_path_generation') || 
                                       outputLower.includes('cvss_vulnerability_metric_scoring');
        if (isThreatModelingOutput) {
            downstreamSequence.push(
                { agentId: 'Threat Modeling & Attack Graph Specialist', task: 'Map trust boundaries architecture diagrams and score vulnerabilities exploitability levels' }
            );
            strategy = 'Cybersecurity Swarm: Threat Modeling & Attack Graphs';
        }

        // 116. Security Engineering: SOC2, PCI-DSS & HIPAA Compliance Auditor
        const isComplianceOutput = outputLower.includes('soc2_trust_services_audit') || 
                                   outputLower.includes('pci_dss_cde_encryption_scope') || 
                                   outputLower.includes('hipaa_phi_data_preservation') || 
                                   outputLower.includes('compliance_as_code_rego_rules');
        if (isComplianceOutput) {
            downstreamSequence.push(
                { agentId: 'SOC2, PCI-DSS & HIPAA Compliance Auditor', task: 'Run compliance-as-code Open Policy Agent assertions against cloud configurations' }
            );
            strategy = 'Cybersecurity Swarm: Compliance & Auditing';
        }

        // 117. Security Engineering: WAF & DDoS Mitigation Coordinator
        const isWafSentinelOutput = outputLower.includes('waf_custom_rule_exclusions') || 
                                    outputLower.includes('dynamic_rate_limiting_thresholds') || 
                                    outputLower.includes('layer7_ddos_mitigation_rules') || 
                                    outputLower.includes('ssl_tls_cipher_enforcement');
        if (isWafSentinelOutput) {
            downstreamSequence.push(
                { agentId: 'WAF & DDoS Mitigation Coordinator', task: 'Examine rate limiting profiles and SSL/TLS cipher suite security enforcement limits' }
            );
            strategy = 'Cybersecurity Swarm: WAF & DDoS Protection';
        }

        // 118. Security Engineering: Binary Authorization & Supply Chain Guardian
        const isBinaryAuthOutput = outputLower.includes('container_cryptographic_signing') || 
                                   outputLower.includes('slsa_provenance_verification') || 
                                   outputLower.includes('binary_authorization_gateways') || 
                                   outputLower.includes('sbom_generation_vulnerability_correlation');
        if (isBinaryAuthOutput) {
            downstreamSequence.push(
                { agentId: 'Binary Authorization & Supply Chain Guardian', task: 'Enforce container SLSA provenance verifications and check SBOM vulnerability alerts' }
            );
            strategy = 'Cybersecurity Swarm: Software Supply Chain Trust';
        }

        // 119. Security Engineering: SIEM & Secure Audit Trail Specialist
        const isAuditLoggerOutput = outputLower.includes('immutable_log_sinks') || 
                                    outputLower.includes('secure_audit_trail_schemas') || 
                                    outputLower.includes('siem_chronicle_ingestion') || 
                                    outputLower.includes('threat_detection_alerting');
        if (isAuditLoggerOutput) {
            downstreamSequence.push(
                { agentId: 'SIEM & Secure Audit Trail Specialist', task: 'Structure secure write-once-read-many log sinks and SIEM Chronicle parser maps' }
            );
            strategy = 'Cybersecurity Swarm: SIEM & Immutable Audit Logs';
        }

        // 120. Platform Engineering: Terraform State & IaC Optimizer
        const isTerraformOptimizerOutput = outputLower.includes('terraform_state_lock_auditing') || 
                                           outputLower.includes('module_dependency_graphing') || 
                                           outputLower.includes('dynamic_block_optimization') || 
                                           outputLower.includes('hcl_syntax_linting');
        if (isTerraformOptimizerOutput) {
            downstreamSequence.push(
                { agentId: 'Terraform State & IaC Optimizer', task: 'Audit state lock files and validate HCL module dependencies' }
            );
            strategy = 'Platform Engineering Swarm: Terraform & IaC';
        }

        // 121. Platform Engineering: Ansible Configuration & Playbook Specialist
        const isAnsibleSpecialistOutput = outputLower.includes('play_execution_concurrency') || 
                                          outputLower.includes('dynamic_inventory_mapping') || 
                                          outputLower.includes('task_idempotent_validations') || 
                                          outputLower.includes('custom_modules_python_mapping');
        if (isAnsibleSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Ansible Configuration & Playbook Specialist', task: 'Optimize Ansible task execution concurrency and dynamic inventory groups' }
            );
            strategy = 'Platform Engineering Swarm: Ansible Configurations';
        }

        // 122. Platform Engineering: Helm Chart & Package Manager Architect
        const isHelmArchitectOutput = outputLower.includes('values_overlays_structure') || 
                                      outputLower.includes('dynamic_template_dependencies') || 
                                      outputLower.includes('lifecycle_hook_boundaries') || 
                                      outputLower.includes('chart_repo_packaging');
        if (isHelmArchitectOutput) {
            downstreamSequence.push(
                { agentId: 'Helm Chart & Package Manager Architect', task: 'Evaluate Helm values schema overlays and dynamic template dependency trees' }
            );
            strategy = 'Platform Engineering Swarm: Helm & K8s Packaging';
        }

        // 123. Platform Engineering: Docker Engine & Host Virtualization Specialist
        const isDockerSpecialistOutput = outputLower.includes('docker_socket_security_access') || 
                                         outputLower.includes('multi_architecture_builder_setups') || 
                                         outputLower.includes('host_storage_volume_isolations') || 
                                         outputLower.includes('docker_daemon_configurations');
        if (isDockerSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Docker Engine & Host Virtualization Specialist', task: 'Enforce container multi-architecture builds and Docker socket host security policies' }
            );
            strategy = 'Platform Engineering Swarm: Docker & Virtualization';
        }

        // 124. Platform Engineering: Consul Service Discovery & Key-Value Specialist
        const isConsulSpecialistOutput = outputLower.includes('catalog_synchronization_periods') || 
                                         outputLower.includes('dynamic_service_registries_health_tests') || 
                                         outputLower.includes('raft_consensus_cluster_configs') || 
                                         outputLower.includes('acl_security_token_systems');
        if (isConsulSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Consul Service Discovery & Key-Value Specialist', task: 'Tune Consul service discovery synchronization periods and Raft consensus configuration states' }
            );
            strategy = 'Platform Engineering Swarm: Consul Discovery & KV';
        }

        // 125. Platform Engineering: Prometheus Telemetry & Alerting Specialist
        const isPrometheusSpecialistOutput = outputLower.includes('metrics_scraping_intervals') || 
                                             outputLower.includes('recording_rule_evaluations') || 
                                             outputLower.includes('tsdb_storage_block_compactions') || 
                                             outputLower.includes('alertmanager_configurations');
        if (isPrometheusSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Prometheus Telemetry & Alerting Specialist', task: 'Calibrate metrics scraping timeouts and TSDB storage block compaction parameters' }
            );
            strategy = 'Platform Engineering Swarm: Prometheus Telemetry';
        }

        // 126. Platform Engineering: NGINX Reverse Proxy & HTTP Engine Specialist
        const isNginxSpecialistOutput = outputLower.includes('server_proxy_blocks_configurations') || 
                                        outputLower.includes('http_keepalive_buffers_tuning') || 
                                        outputLower.includes('upstream_load_balancing_limits') || 
                                        outputLower.includes('ssl_session_caching');
        if (isNginxSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'NGINX Reverse Proxy & HTTP Engine Specialist', task: 'Tune HTTP keepalive session buffers and optimize reverse proxy upstream load balancing limits' }
            );
            strategy = 'Platform Engineering Swarm: NGINX Proxy & Reverse Web';
        }

        // 127. Platform Engineering: ArgoCD GitOps Git Sync Specialist
        const isArgoCdSpecialistOutput = outputLower.includes('application_synchronization_queues') || 
                                         outputLower.includes('directories_generation_trees') || 
                                         outputLower.includes('target_synchronization_window_constraints') || 
                                         outputLower.includes('applicationset_matrix_generators');
        if (isArgoCdSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'ArgoCD GitOps Git Sync Specialist', task: 'Monitor ArgoCD dynamic target sync windows and map matrix applicationset definitions' }
            );
            strategy = 'Platform Engineering Swarm: ArgoCD GitOps';
        }

        // 128. Platform Engineering: Envoy Proxy & Service Mesh Specialist
        const isEnvoySpecialistOutput = outputLower.includes('dynamic_cluster_discovery_xds') || 
                                        outputLower.includes('circuit_breaking_filters') || 
                                        outputLower.includes('trace_context_propagation') || 
                                        outputLower.includes('custom_filters_wasm_injection');
        if (isEnvoySpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Envoy Proxy & Service Mesh Specialist', task: 'Integrate dynamic cluster discovery EDS metrics and monitor Envoy circuit breaker filter status' }
            );
            strategy = 'Platform Engineering Swarm: Envoy Mesh & Sidecars';
        }

        // 129. Platform Engineering: Packer Machine Image & Template Specialist
        const isPackerSpecialistOutput = outputLower.includes('vm_golden_image_builds') || 
                                         outputLower.includes('shell_provisioning_sequences') || 
                                         outputLower.includes('post_processor_pipelines') || 
                                         outputLower.includes('parallel_build_optimizations');
        if (isPackerSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Packer Machine Image & Template Specialist', task: 'Calibrate golden machine VM provisioning flows and orchestrate image compression post-processors' }
            );
            strategy = 'Platform Engineering Swarm: Packer Machine Images';
        }

        // 130. API Systems: GraphQL Federation & Supergraph Architect
        const isGraphQlFederationOutput = outputLower.includes('graphql_federation_supergraph_routing') || 
                                          outputLower.includes('subgraph_schema_entity_resolution') || 
                                          outputLower.includes('query_planner_graph_optimization') || 
                                          outputLower.includes('apollo_router_traffic_shaping');
        if (isGraphQlFederationOutput) {
            downstreamSequence.push(
                { agentId: 'GraphQL Federation & Supergraph Architect', task: 'Design federated supergraph schemas and analyze subgraphs entity resolution query costs' }
            );
            strategy = 'API Swarm: GraphQL Federation';
        }

        // 131. API Systems: gRPC & ProtoBuf Interface Optimizer
        const isGrpcOptimizerOutput = outputLower.includes('grpc_protobuf_binary_serialization') || 
                                      outputLower.includes('http2_multiplexed_stream_tuning') || 
                                      outputLower.includes('grpc_client_channel_load_balancing') || 
                                      outputLower.includes('proto_contract_backwards_compatibility');
        if (isGrpcOptimizerOutput) {
            downstreamSequence.push(
                { agentId: 'gRPC & ProtoBuf Interface Optimizer', task: 'Optimize ProtoBuf message structures and evaluate HTTP/2 flow control multiplexed streams' }
            );
            strategy = 'API Swarm: gRPC & ProtoBuf';
        }

        // 132. API Systems: WebSockets & Real-Time Sync Coordinator
        const isWebSocketSyncOutput = outputLower.includes('websocket_connection_heartbeat_tuning') || 
                                      outputLower.includes('pubsub_channel_state_distribution') || 
                                      outputLower.includes('connection_backpressure_buffer_management') || 
                                      outputLower.includes('socketio_horizontal_scaling_redis');
        if (isWebSocketSyncOutput) {
            downstreamSequence.push(
                { agentId: 'WebSockets & Real-Time Sync Coordinator', task: 'Manage websocket reconnect limits and scale state distributions using Redis socket adapters' }
            );
            strategy = 'API Swarm: Real-Time WebSockets';
        }

        // 133. API Systems: OpenAPI Contract & Schema Enforcer
        const isOpenApiEnforcerOutput = outputLower.includes('openapi_contract_validation_assertions') || 
                                        outputLower.includes('json_schema_structural_matching') || 
                                        outputLower.includes('api_mock_integration_testing') || 
                                        outputLower.includes('swagger_spec_linting_standards');
        if (isOpenApiEnforcerOutput) {
            downstreamSequence.push(
                { agentId: 'OpenAPI Contract & Schema Enforcer', task: 'Enforce OpenAPI schema structures and evaluate Mock integration test assertion rules' }
            );
            strategy = 'API Swarm: OpenAPI Specs & Contract Tests';
        }

        // 134. API Systems: Apache Kafka Event-Driven Architect
        const isKafkaEventArchitectOutput = outputLower.includes('kafka_partition_key_rebalancing') || 
                                            outputLower.includes('consumer_group_state_rebalances') || 
                                            outputLower.includes('tombstone_record_log_compaction') || 
                                            outputLower.includes('exactly_once_transactional_streams');
        if (isKafkaEventArchitectOutput) {
            downstreamSequence.push(
                { agentId: 'Apache Kafka Event-Driven Architect', task: 'Audit Kafka partition key distribution schemas and configure exactly-once event transactional flows' }
            );
            strategy = 'API Swarm: Kafka Event Streaming';
        }

        // 135. API Systems: RabbitMQ AMQP Broker Specialist
        const isRabbitMqBrokerOutput = outputLower.includes('amqp_exchange_routing_bindings') || 
                                       outputLower.includes('queue_dead_letter_routing') || 
                                       outputLower.includes('publisher_confirmations_safeguards') || 
                                       outputLower.includes('consumer_prefetch_limit_tuning');
        if (isRabbitMqBrokerOutput) {
            downstreamSequence.push(
                { agentId: 'RabbitMQ AMQP Broker Specialist', task: 'Map RabbitMQ dead-letter exchange bindings and balance consumer prefetch limits' }
            );
            strategy = 'API Swarm: RabbitMQ Messaging';
        }

        // 136. API Systems: APIs Gateway Policy Controller
        const isApiGatewayControllerOutput = outputLower.includes('api_gateway_request_transformations') || 
                                             outputLower.includes('plugin_boundary_rate_limiting') || 
                                             outputLower.includes('jwt_oauth2_verification_policies') || 
                                             outputLower.includes('custom_gateway_lua_plugins');
        if (isApiGatewayControllerOutput) {
            downstreamSequence.push(
                { agentId: 'APIs Gateway Policy Controller', task: 'Configure gateway request header rewrites and monitor OAuth2/JWT verification boundaries' }
            );
            strategy = 'API Swarm: APIs Gateways & Policies';
        }

        // 137. API Systems: JSON-RPC & XML-RPC Protocol Specialist
        const isRpcProtocolSpecialistOutput = outputLower.includes('rpc_request_batching_payloads') || 
                                              outputLower.includes('method_dispatcher_schema_validations') || 
                                              outputLower.includes('payload_compression_rules_encoding') || 
                                              outputLower.includes('jsonrpc_error_code_standards');
        if (isRpcProtocolSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'JSON-RPC & XML-RPC Protocol Specialist', task: 'Audit JSON-RPC batching payloads and standard error code dispatch structures' }
            );
            strategy = 'API Swarm: JSON-RPC & XML-RPC Protocols';
        }

        // 138. API Systems: tRPC Type-Safe Contract Coordinator
        const isTrpcContractOutput = outputLower.includes('trpc_client_server_type_propagation') || 
                                     outputLower.includes('procedural_query_mutation_handlers') || 
                                     outputLower.includes('batching_middleware_query_optimizations') || 
                                     outputLower.includes('trpc_context_router_mappings');
        if (isTrpcContractOutput) {
            downstreamSequence.push(
                { agentId: 'tRPC Type-Safe Contract Coordinator', task: 'Validate tRPC procedural type exports and scale middleware query batching limits' }
            );
            strategy = 'API Swarm: tRPC Type-Safe Contracts';
        }

        // 139. API Systems: WebRTC Peer-to-Peer & SFU Engine Specialist
        const isWebRtcSpecialistOutput = outputLower.includes('webrtc_signaling_ice_negotiations') || 
                                         outputLower.includes('stun_turn_server_allocations') || 
                                         outputLower.includes('media_channel_bandwidth_constraints') || 
                                         outputLower.includes('sfu_selective_routing_topologies');
        if (isWebRtcSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'WebRTC Peer-to-Peer & SFU Engine Specialist', task: 'Optimize WebRTC ICE negotiation handshakes and manage SFU media layer allocations' }
            );
            strategy = 'API Swarm: WebRTC Peer-to-Peer & SFU Channels';
        }

        // 140. Edge Systems: iOS Swift & CocoaTouch Specialist
        const isIosSpecialistOutput = outputLower.includes('swift_concurrency_structured_async') || 
                                      outputLower.includes('arc_memory_graph_leak_detection') || 
                                      outputLower.includes('swiftui_layout_rendering_performance') || 
                                      outputLower.includes('coredata_persistent_store_migration');
        if (isIosSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'iOS Swift & CocoaTouch Specialist', task: 'Audit structured async Swift tasks and profile weak references inside reference graphs' }
            );
            strategy = 'Edge Swarm: iOS Development';
        }

        // 141. Edge Systems: Android Kotlin & Jetpack Compose Architect
        const isAndroidArchitectOutput = outputLower.includes('kotlin_coroutine_flow_orchestration') || 
                                         outputLower.includes('jetpack_compose_recomposition_tuning') || 
                                         outputLower.includes('android_background_service_workers') || 
                                         outputLower.includes('room_sqlite_schema_relationships');
        if (isAndroidArchitectOutput) {
            downstreamSequence.push(
                { agentId: 'Android Kotlin & Jetpack Compose Architect', task: 'Tune Jetpack Compose state hoisting recomposition scopes and audit Room database transactions' }
            );
            strategy = 'Edge Swarm: Android Development';
        }

        // 142. Edge Systems: Kotlin Multiplatform (KMP) Shared Core Specialist
        const isKmpSpecialistOutput = outputLower.includes('kmp_expect_actual_platform_mappings') || 
                                     outputLower.includes('shared_business_logic_monorepo') || 
                                     outputLower.includes('kotlin_native_memory_concurrency_models') || 
                                     outputLower.includes('multiplatform_http_client_ktor');
        if (isKmpSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Kotlin Multiplatform (KMP) Shared Core Specialist', task: 'Orchestrate KMP shared common modules and configure cross-platform Ktor engines' }
            );
            strategy = 'Edge Swarm: Kotlin Multiplatform';
        }

        // 143. Edge Systems: React Native Bridge & Native Modules Specialist
        const isReactNativeSpecialistOutput = outputLower.includes('jsi_native_bridge_communication') || 
                                              outputLower.includes('custom_native_modules_objectivec_java') || 
                                              outputLower.includes('javascript_thread_bottleneck_tuning') || 
                                              outputLower.includes('fabric_renderer_ui_components');
        if (isReactNativeSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'React Native Bridge & Native Modules Specialist', task: 'Bridge native Fabric components and debug JavaScript thread event loops' }
            );
            strategy = 'Edge Swarm: React Native Bridges';
        }

        // 144. Edge Systems: Electron Desktop & Native Interop Architect
        const isElectronArchitectOutput = outputLower.includes('electron_ipc_renderer_security_sandbox') || 
                                           outputLower.includes('native_desktop_bindings_node_gyp') || 
                                           outputLower.includes('auto_updater_release_channel_signing') || 
                                           outputLower.includes('multi_window_renderer_state_sync');
        if (isElectronArchitectOutput) {
            downstreamSequence.push(
                { agentId: 'Electron Desktop & Native Interop Architect', task: 'Enforce preload contextBridge security perimeters and compile node-gyp bindings' }
            );
            strategy = 'Edge Swarm: Electron Desktop';
        }

        // 145. Edge Systems: WebAssembly WebAPI & WASI Compiler Specialist
        const isWasmSpecialistOutput = outputLower.includes('wasi_filesystem_abstraction_layers') || 
                                       outputLower.includes('shared_memory_wasm_buffer_views') || 
                                       outputLower.includes('emscripten_javascript_glue_bindings') || 
                                       outputLower.includes('rust_cpp_wasm_pack_compilation');
        if (isWasmSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'WebAssembly WebAPI & WASI Compiler Specialist', task: 'Compile high-fidelity C++/Rust modules and configure WASI filesystem abstractions' }
            );
            strategy = 'Edge Swarm: WebAssembly Systems';
        }

        // 146. Edge Systems: Embedded RTOS & Microcontroller Systems Specialist
        const isEmbeddedSpecialistOutput = outputLower.includes('rtos_kernel_scheduler_boundaries') || 
                                           outputLower.includes('hardware_peripheral_register_drivers') || 
                                           outputLower.includes('low_power_microcontroller_telemetry') || 
                                           outputLower.includes('embedded_memory_heap_leak_mitigation');
        if (isEmbeddedSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Embedded RTOS & Microcontroller Systems Specialist', task: 'Audit FreeRTOS kernel mutex locks and debug peripheral microcontroller registers' }
            );
            strategy = 'Edge Swarm: Embedded RTOS Hardware';
        }

        // 147. Edge Systems: WebUSB & WebBluetooth System Interop Specialist
        const isWebUsbSpecialistOutput = outputLower.includes('webusb_endpoint_packet_transfers') || 
                                         outputLower.includes('webbluetooth_gatt_service_discovery') || 
                                         outputLower.includes('binary_stream_transform_adapters') || 
                                         outputLower.includes('hardware_device_permission_profiles');
        if (isWebUsbSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'WebUSB & WebBluetooth System Interop Specialist', task: 'Parse hardware vendor buffers and manage GATT service characteristic callbacks' }
            );
            strategy = 'Edge Swarm: WebUSB & WebBluetooth';
        }

        // 148. Edge Systems: Edge Compute Serverless & CDN Architect
        const isEdgeServerlessOutput = outputLower.includes('cloudflare_workers_v8_isolates_compute') || 
                                       outputLower.includes('edge_cache_invalidation_routing') || 
                                       outputLower.includes('wasm_edge_serverless_executions') || 
                                       outputLower.includes('globally_distributed_keyvalue_maps');
        if (isEdgeServerlessOutput) {
            downstreamSequence.push(
                { agentId: 'Edge Compute Serverless & CDN Architect', task: 'Map distributed V8 serverless worker isolates and optimize edge invalidation cache tags' }
            );
            strategy = 'Edge Swarm: Edge Serverless & CDN';
        }

        // 149. Edge Systems: Progressive Web Application (PWA) Offline Sync Specialist
        const isPwaSpecialistOutput = outputLower.includes('service_worker_lifecycle_caching') || 
                                      outputLower.includes('cachestorage_policy_cache_first') || 
                                      outputLower.includes('offline_sync_background_queue_management') || 
                                      outputLower.includes('push_notification_payload_encryption');
        if (isPwaSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Progressive Web Application (PWA) Offline Sync Specialist', task: 'Calibrate Workbox background sync queues and structure payload push notification keys' }
            );
            strategy = 'Edge Swarm: PWAs & Offline Sync';
        }

        // 150. Operating Systems: Linux Kernel & Device Driver Engineer
        const isKernelEngineerOutput = outputLower.includes('linux_kernel_module_optimizations') || 
                                       outputLower.includes('device_driver_interrupt_handlers') || 
                                       outputLower.includes('virtual_filesystem_vfs_mappings') || 
                                       outputLower.includes('kernel_thread_scheduler_tuning');
        if (isKernelEngineerOutput) {
            downstreamSequence.push(
                { agentId: 'Linux Kernel & Device Driver Engineer', task: 'Audit kernel module sysfs parameters and configure device driver tasklets/workqueues' }
            );
            strategy = 'Systems Swarm: Linux Kernel & Device Drivers';
        }

        // 151. Operating Systems: Compiler Optimization & LLVM Specialist
        const isCompilerSpecialistOutput = outputLower.includes('llvm_ir_optimization_passes') || 
                                           outputLower.includes('dead_code_elimination_compilers') || 
                                           outputLower.includes('loop_vectorization_code_generation') || 
                                           outputLower.includes('compiler_flags_optimization_schemes');
        if (isCompilerSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Compiler Optimization & LLVM Specialist', task: 'Implement LLVM IR optimization passes and tune compile flags for code generation vectorizations' }
            );
            strategy = 'Systems Swarm: Compiler Optimizations & LLVM';
        }

        // 152. Operating Systems: Linker, Loader & Static Binary Analyzer
        const isLinkerAnalyzerOutput = outputLower.includes('elf_macho_binary_header_audits') || 
                                       outputLower.includes('static_dynamic_linker_symbol_resolution') || 
                                       outputLower.includes('shared_library_dependency_linkages') || 
                                       outputLower.includes('binary_memory_offset_alignments');
        if (isLinkerAnalyzerOutput) {
            downstreamSequence.push(
                { agentId: 'Linker, Loader & Static Binary Analyzer', task: 'Audit dynamic GOT/PLT symbol resolution offsets and map ELF/Mach-O segment alignments' }
            );
            strategy = 'Systems Swarm: Linkers, Loaders & Symbols';
        }

        // 153. Operating Systems: Garbage Collection & Memory Runtime Specialist
        const isGcSpecialistOutput = outputLower.includes('generational_mark_sweep_garbage_collection') || 
                                     outputLower.includes('v8_jvm_heap_compaction_tuning') || 
                                     outputLower.includes('memory_allocation_arena_structures') || 
                                     outputLower.includes('virtual_memory_page_alignments');
        if (isGcSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Garbage Collection & Memory Runtime Specialist', task: 'Calibrate generational mark-sweep GC compact bounds and design memory allocation arenas' }
            );
            strategy = 'Systems Swarm: Garbage Collection & Heap Memory';
        }

        // 154. Operating Systems: Assembler, Disassembler & Reverse Engineering Expert
        const isAssemblerExpertOutput = outputLower.includes('x86_arm_assembly_parsing') || 
                                        outputLower.includes('binary_disassembling_ghidra_ida') || 
                                        outputLower.includes('stack_register_tracing_analysis') || 
                                        outputLower.includes('instruction_pipeline_execution_simulation');
        if (isAssemblerExpertOutput) {
            downstreamSequence.push(
                { agentId: 'Assembler, Disassembler & Reverse Engineering Expert', task: 'Decode disassembly stack layout variables and trace CPU registers via Ghidra pipelines' }
            );
            strategy = 'Systems Swarm: Assembly & Reverse Engineering';
        }

        // 155. Operating Systems: Virtualization Hypervisor & Xen/KVM Architect
        const isHypervisorArchitectOutput = outputLower.includes('kvm_xen_hypervisor_optimizations') || 
                                            outputLower.includes('hardware_assisted_cpu_virtualization') || 
                                            outputLower.includes('guest_pci_device_passthroughs') || 
                                            outputLower.includes('virtual_network_device_topologies');
        if (isHypervisorArchitectOutput) {
            downstreamSequence.push(
                { agentId: 'Virtualization Hypervisor & Xen/KVM Architect', task: 'Configure hardware-assisted VT-x/EPT guest environments and manage guest VFIO PCI passthroughs' }
            );
            strategy = 'Systems Swarm: Virtualization & Hypervisors';
        }

        // 156. Operating Systems: POSIX System Programming & C Library Specialist
        const isPosixSpecialistOutput = outputLower.includes('posix_syscall_bindings_threads') || 
                                        outputLower.includes('signal_handling_isolation_boundaries') || 
                                        outputLower.includes('glibc_musl_c_library_implementations') || 
                                        outputLower.includes('memory_mapped_mmap_io_operations');
        if (isPosixSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'POSIX System Programming & C Library Specialist', task: 'Structure multi-process signal safe isolation scopes and optimize memory-mapped mmap bounds' }
            );
            strategy = 'Systems Swarm: POSIX System Programming';
        }

        // 157. Operating Systems: Debugger Engine & GDB/LLDB Interop Specialist
        const isDebuggerSpecialistOutput = outputLower.includes('ptrace_process_attach_boundaries') || 
                                           outputLower.includes('software_hardware_breakpoint_injections') || 
                                           outputLower.includes('dwarf_pdb_symbol_table_parsing') || 
                                           outputLower.includes('register_inspection_memory_dumps');
        if (isDebuggerSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'Debugger Engine & GDB/LLDB Interop Specialist', task: 'Inject hardware breakpoints in register space and parse DWARF/PDB symbol line tables' }
            );
            strategy = 'Systems Swarm: Process Debugging & Symbols';
        }

        // 158. Operating Systems: Binary Compactor & Packer Specialist
        const isBinPackerOutput = outputLower.includes('runtime_executable_packer_upx') || 
                                  outputLower.includes('binary_size_minimization_pipelines') || 
                                  outputLower.includes('code_obfuscation_rule_configurations') || 
                                  outputLower.includes('decompression_stub_injections');
        if (isBinPackerOutput) {
            downstreamSequence.push(
                { agentId: 'Binary Compactor & Packer Specialist', task: 'Calibrate runtime UPX compact stubs and apply control flow flattening obfuscations' }
            );
            strategy = 'Systems Swarm: Obfuscation & Executable Packers';
        }

        // 159. Operating Systems: Microkernel & Operating Systems Architect
        const isMicrokernelArchitectOutput = outputLower.includes('capability_based_security_sel4') || 
                                             outputLower.includes('microkernel_ipc_message_channels') || 
                                             outputLower.includes('microkernel_page_table_mappings') || 
                                             outputLower.includes('microkernel_scheduler_configurations');
        if (isMicrokernelArchitectOutput) {
            downstreamSequence.push(
                { agentId: 'Microkernel & Operating Systems Architect', task: 'Structure capability-based seL4 CSpace mappings and configure microkernel IPC message channels' }
            );
            strategy = 'Systems Swarm: Microkernels & Capability Spaces';
        }

        // 160. Graphics: WebGPU & WebGL Rendering Pipeline Engineer
        const isWebGpuPipelineOutput = outputLower.includes('webgpu_gpu_render_passes') || 
                                       outputLower.includes('wgsl_glsl_shader_compile') || 
                                       outputLower.includes('bind_groups_vertex_buffers') || 
                                       outputLower.includes('gpu_compute_pipelines');
        if (isWebGpuPipelineOutput) {
            downstreamSequence.push(
                { agentId: 'WebGPU & WebGL Rendering Pipeline Engineer', task: 'Compile WGSL rendering and compute pipelines and optimize bind group layouts' }
            );
            strategy = 'Graphics Swarm: WebGPU & GPU Pipelines';
        }

        // 161. Graphics: Ray Tracing & Global Illumination Specialist
        const isRayTracingOutput = outputLower.includes('bounding_volume_hierarchies_bvh') || 
                                   outputLower.includes('ray_box_intersection_algorithms') || 
                                   outputLower.includes('path_tracing_global_illumination') || 
                                   outputLower.includes('denoising_irradiance_caching');
        if (isRayTracingOutput) {
            downstreamSequence.push(
                { agentId: 'Ray Tracing & Global Illumination Specialist', task: 'Traverse bounding volume hierarchies and optimize path tracing BRDF integrations' }
            );
            strategy = 'Graphics Swarm: Ray Tracing & Global Illumination';
        }

        // 162. Graphics: Creative Shader & Visual Effects Artist
        const isShaderArtistOutput = outputLower.includes('fragment_vertex_shader_effects') || 
                                     outputLower.includes('simplex_perlin_noise_functions') || 
                                     outputLower.includes('post_processing_effects_filters') || 
                                     outputLower.includes('raymarching_signed_distance_fields');
        if (isShaderArtistOutput) {
            downstreamSequence.push(
                { agentId: 'Creative Shader & Visual Effects Artist', task: 'Design screenspace post-processing filters and render screenspace SDF raymarching bounds' }
            );
            strategy = 'Graphics Swarm: Shaders & Visual Effects';
        }

        // 163. Graphics: Game Physics Engine & Rigid Body Dynamics Specialist
        const isPhysicsEngineOutput = outputLower.includes('collision_detection_gjk_aabb') || 
                                      outputLower.includes('rigid_body_impulse_solvers') || 
                                      outputLower.includes('soft_body_cloth_simulations') || 
                                      outputLower.includes('verlet_integration_dynamics');
        if (isPhysicsEngineOutput) {
            downstreamSequence.push(
                { agentId: 'Game Physics Engine & Rigid Body Dynamics Specialist', task: 'Solve GJK collision impulses and calibrate mass-spring soft body structures' }
            );
            strategy = 'Graphics Swarm: Game Physics & Dynamics';
        }

        // 164. Graphics: Scene Graph & Entity Component System (ECS) Architect
        const isSceneGraphOutput = outputLower.includes('quadtree_octree_spatial_partitioning') || 
                                   outputLower.includes('scene_graph_frustum_culling') || 
                                   outputLower.includes('entity_component_system_ecs_layouts') || 
                                   outputLower.includes('transform_matrix_multiplications');
        if (isSceneGraphOutput) {
            downstreamSequence.push(
                { agentId: 'Scene Graph & Entity Component System (ECS) Architect', task: 'Update ECS contiguous storage blocks and propagate local-to-world transform hierarchies' }
            );
            strategy = 'Graphics Swarm: ECS & Scene Graph Architecture';
        }

        // 165. Graphics: Video & Image Compression Codec Specialist
        const isVideoCodecOutput = outputLower.includes('h264_hevc_av1_quantization') || 
                                   outputLower.includes('motion_vector_estimation_encoding') || 
                                   outputLower.includes('jpeg_png_decoder_optimizations') || 
                                   outputLower.includes('macroblock_entropy_coding');
        if (isVideoCodecOutput) {
            downstreamSequence.push(
                { agentId: 'Video & Image Compression Codec Specialist', task: 'Calibrate CABAC entropy bounds and optimize motion vector search matrices' }
            );
            strategy = 'Graphics Swarm: Codecs & Image Compression';
        }

        // 166. Graphics: Spatial Audio & Interactive Acoustics Engineer
        const isSpatialAudioOutput = outputLower.includes('web_audio_api_node_connections') || 
                                     outputLower.includes('hrtf_spatial_panning_filters') || 
                                     outputLower.includes('acoustic_room_impulse_responses') || 
                                     outputLower.includes('doppler_effect_pitch_shifting');
        if (isSpatialAudioOutput) {
            downstreamSequence.push(
                { agentId: 'Spatial Audio & Interactive Acoustics Engineer', task: 'Structure AudioWorklet processor kernels and pan binaural listener vectors' }
            );
            strategy = 'Graphics Swarm: Spatial Audio & Acoustics';
        }

        // 167. Graphics: AR/VR XR Runtime & Spatial Computing Specialist
        const isArVrSpecialistOutput = outputLower.includes('webxr_device_pose_estimation') || 
                                       outputLower.includes('foveated_rendering_eye_tracking') || 
                                       outputLower.includes('lens_distortion_warp_compensation') || 
                                       outputLower.includes('spatial_controller_tracking_offsets');
        if (isArVrSpecialistOutput) {
            downstreamSequence.push(
                { agentId: 'AR/VR XR Runtime & Spatial Computing Specialist', task: 'Map projection poses in immersive loops and compensate lens distortion warp offsets' }
            );
            strategy = 'Graphics Swarm: AR/VR & XR Runtimes';
        }

        // 168. Graphics: CAD Engine & Vector Graphics Specialist
        const isCadVectorOutput = outputLower.includes('bezier_bspline_subdivision_curves') || 
                                  outputLower.includes('svg_path_rendering_pipelines') || 
                                  outputLower.includes('boolean_polygon_clipping_operations') || 
                                  outputLower.includes('delaunay_ear_clipping_triangulation');
        if (isCadVectorOutput) {
            downstreamSequence.push(
                { agentId: 'CAD Engine & Vector Graphics Specialist', task: 'Perform boolean clipping polygon splits and triangulate Delaunay mesh control splines' }
            );
            strategy = 'Graphics Swarm: CAD Engines & Vector Graphics';
        }

        // 169. Graphics: Texture Mapping & Materials Shader Specialist
        const isTextureMaterialOutput = outputLower.includes('pbr_material_reflectance_rendering') || 
                                        outputLower.includes('displacement_normal_bump_mapping') || 
                                        outputLower.includes('mipmap_filtering_anisotropic_levels') || 
                                        outputLower.includes('astc_etc2_texture_compaction');
        if (isTextureMaterialOutput) {
            downstreamSequence.push(
                { agentId: 'Texture Mapping & Materials Shader Specialist', task: 'Construct PBR reflectance BRDF stages and allocate mipmap anisotropic filtering buffers' }
            );
            strategy = 'Graphics Swarm: Textures & Materials Shading';
        }

        // Ensure default fallback if no specific keywords match
        if (downstreamSequence.length === 0) {
            downstreamSequence.push({ agentId: 'auditor', task: 'Fidelity quality gate audit on backend output' });
        }

        logger.info(`✅ [Router] Downstream Swarm resolved successfully: ${downstreamSequence.map(s => s.agentId).join(' -> ')}`);
        return {
            strategy,
            sequence: downstreamSequence
        };
    }

    fallbackPlan(prompt) {
        return {
            plan: 'General Assistance',
            sequence: [{ agentId: 'jules', task: 'Direct execution of prompt' }],
            priority: 'MEDIUM'
        };
    }
}

export const agenticRouter = new AgenticRouterService();

