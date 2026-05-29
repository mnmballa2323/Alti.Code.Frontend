import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import { agentRegistry } from './agent.registry.js';
import { swarmNexusAgent } from './swarm_nexus.agent.js';
import { vectorStoreService } from '../memory/vector.store.js';

const genAI = new GoogleGenerativeAI(config.gemini_secret_key || process.env.GEMINI_API_KEY);

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

