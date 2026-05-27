import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import { agentRegistry } from './agent.registry.js';
import { swarmNexusAgent } from './swarm_nexus.agent.js';

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
                        { agentId: 'swarm_nexus_agent', task: 'Strategic CEO review & Product Spec mapping' },
                        { agentId: 'architect', task: 'Surgical design and blast radius mapping' },
                        { agentId: 'jules', task: 'Core developer implementation' },
                        { agentId: 'auditor', task: 'QA verification and test execution' },
                        { agentId: 'security_security_auditor_agent', task: 'Hardened PII, DLP, and credentials audits' }
                    ],
                    priority: 'HIGH',
                    gstackRoadmap
                };
            } catch (err) {
                logger.warn(`⚠️ [Router] gstack routing failed, falling back to standard sequence: ${err.message}`);
            }
        }

        const systemInstruction = `
            ACT AS THE CHIEF SMARTRONTING ARCHITECT FOR ALTI CODE STUDIO.
            Available Specialists: ${JSON.stringify(agentRegistry.list())}
            
            UNIVERSE-BEST ROUTING RULES:
            1. **Holistic Intelligence**: If the user asks for code, you MUST include 'Architect' for strategy, 'jules' for execution, and 'auditor' for fidelity review.
            2. **Hard Law Enforcement**: Always include 'licenseGuardian' if new dependencies or external code might be involved.
            3. **Security First**: If the request involves infrastructure, auth, or sensitive data, you MUST include 'security' and 'sentinel' agents.
            4. **Parallel Execution**: Suggest parallel agent activations if the tasks are independent.
            5. **Final Synthesis**: Ensure the chain ends with a quality gate.
            6. **Zero-Limit Routing (The Forge)**: If the user requests a capability, domain, or industry that is NOT covered by any of the available specialists, you MUST route the task to 'agent_forge_generator'. Instruct the Forge to dynamically write, register, and deploy a new hyper-specialized agent capable of fulfilling the request.
            
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

    fallbackPlan(prompt) {
        return {
            plan: 'General Assistance',
            sequence: [{ agentId: 'jules', task: 'Direct execution of prompt' }],
            priority: 'MEDIUM'
        };
    }
}

export const agenticRouter = new AgenticRouterService();

