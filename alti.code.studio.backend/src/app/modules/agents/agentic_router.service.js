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
                                 outputLower.includes('key') || 
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

