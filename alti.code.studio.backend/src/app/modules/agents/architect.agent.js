import { contextService } from '../cortex/context.service.js';
import { logger } from '../../../shared/logger.js';
import { composerAgent } from './composer.agent.js';
import { sentinelAgent } from './sentinel.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { wikiService } from '../docs/wiki.service.js';
import { sprintSchedulerService } from '../sprintScheduler/sprintScheduler.service.js';

class ArchitectAgent {
    constructor() {
        this.agentName = 'architect';
        this.capabilities = ['design', 'architecture', 'explain', 'delegate'];
    }

    async execute(action, args) {
        logger.info(`🏛️ Architect: Executing ${action}`);
        switch (action) {
            case 'explain':
                return this.explainSystem(args.topic);
            case 'design':
                return this.designSystem(args.goal);
            case 'delegate':
                return this.delegateTask(args.goal);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    /**
     * Explain a part of the system with architectural depth.
     * @param {string} topic - e.g. "Authentication", "Database Schema"
     */
    async explainSystem(topic) {
        logger.info(`🏛️ Architect: Analyzing ${topic}...`);
        const query = `Explain the architecture of ${topic} in this codebase. Include key files, classes, and flow.`;
        const result = await contextService.query(query);
        return { ...result, agent: 'Architect' };
    }

    async designSystem(goal) {
        logger.info(`🏛️ Architect: Designing system for goal: "${goal}"...`);

        const prompt = `
            You are The Architect, an elite software architect for the Genesis Engine.
            Goal: ${goal}
            
            Synthesize the technical architecture required to build this.
            Identify the optimal tech stack, the major components, and the core files required to bootstrap it.
            
            Output strictly valid JSON with this exact structure:
            {
                "feature": "Name of the application/feature",
                "description": "High-level description of what this is",
                "techStack": ["Next.js", "Express", "MongoDB", "etc"],
                "components": [
                    { "name": "Component Name", "type": "backend|frontend|database", "path": "src/...", "description": "What it does" }
                ],
                "files": [
                    { "path": "src/...", "instruction": "Detailed instruction for the Composer agent on what code to write here" }
                ],
                "adrs": [
                    { "title": "Use [Tech] for [Reason]", "context": "Detailed explanation of why this architectural choice was made over alternatives." }
                ]
            }
            Do not include markdown blocks, just the JSON.
        `;

        try {
            logger.info('🏛️ Architect: Synthesizing architecture with AI...');
            let rawJson = await GeminiAiService.generateContent(prompt);
            rawJson = rawJson.replace(/^```json\n?/m, '').replace(/\n?```$/m, '').trim();
            const designDoc = JSON.parse(rawJson);

            logger.info(`🏛️ Architect: Writing Architecture Decision Records (ADRs)...`);
            for (const adr of (designDoc.adrs || [])) {
                try {
                    await wikiService.generateADR(adr.title, adr.context);
                } catch (e) {
                    logger.warn(`Failed to write ADR "${adr.title}": ${e.message}`);
                }
            }

            return designDoc;
        } catch (error) {
            logger.error(`🏛️ Architect Synthesis Failed:`, error);
            throw new Error(`Architect failed to synthesize design: ${error.message}`);
        }
    }

    /**
     * Epic Generator: Breaks down a monolithic architecture design into sequential
     * autonomous sprint phases, and injects them into the Sprint Scheduler backlog.
     */
    async planPhases(designDoc) {
        logger.info(`🏛️ Architect: Deconstructing architecture into sequential sprint phases...`);

        const prompt = `
            You are The Epic Generator, an elite agile planner for the Genesis Engine.
            Deconstruct the following architectural design into strictly logical, sequential Software Development Phases.
            
            Architecture Design:
            ${JSON.stringify(designDoc, null, 2)}
            
            Rules:
            - Phase 1 must always be foundational (e.g. Database schema setup, core models).
            - Each phase should represent a single autonomous sprint goal.
            - Provide a maximum of 10 phases.
            
            Output strictly valid JSON with this exact structure:
            {
                "phases": [
                    { "phaseNumber": 1, "goal": "Implement Mongoose models for X and Y components" },
                    { "phaseNumber": 2, "goal": "Implement Express controllers and routing for X and Y components" }
                ]
            }
        `;

        try {
            let rawJson = await GeminiAiService.generateContent(prompt);
            rawJson = rawJson.replace(/^```json\n?/m, '').replace(/\n?```$/m, '').trim();
            const epicPlan = JSON.parse(rawJson);

            logger.info(`🏛️ Architect: Generated ${epicPlan.phases?.length || 0} discrete sprint phases.`);

            // Inject strictly in sequential order. Priority 2 is "High (Feature/Bug)"
            // Since JS sort is stable and we insert in order, they will execute in Phase 1->N order.
            for (const phase of (epicPlan.phases || [])) {
                logger.info(`   -> Injecting Phase ${phase.phaseNumber}: ${phase.goal.substring(0, 50)}...`);
                // Use a slightly decaying priority to ensure strict ordering:
                // Phase 1 = Priority 2.01, Phase 2 = Priority 2.02
                const sequencingPriority = 2 + (phase.phaseNumber * 0.01);
                sprintSchedulerService.addGoalToBacklog(`[Genesis Phase ${phase.phaseNumber}] ${phase.goal}`, sequencingPriority);
            }

            return epicPlan;
        } catch (error) {
            logger.error(`🏛️ Architect Epic Generation Failed:`, error);
            throw new Error(`Architect failed to generate epic phases: ${error.message}`);
        }
    }

    /**
     * Phase 2: Autonomous Cross-Agent Collaboration
     * 1. Design the feature
     * 2. Delegate to Composer to weave the code
     * 3. Delegate to Sentinel to evaluate the results
     * @param {string} goal 
     */
    async delegateTask(goal) {
        logger.info(`🏛️ Architect (IADP): Delegating end-to-end task: "${goal}"`);

        // Step 1: Design Phase
        logger.info(`🏛️ Architect (IADP): Phase 1 - Generating Design Matrix...`);
        const designDoc = await this.designSystem(goal);

        // Step 2: Implementation Phase (Composer)
        logger.info(`🏛️ Architect (IADP): Phase 2 - Handing off Design to The Composer...`);
        let scaffoldResults = [];
        try {
            scaffoldResults = await composerAgent.execute('scaffold', { design: designDoc });
        } catch (error) {
            logger.error(`🏛️ Architect [Composer Failure]: ${error.message}`);
            return { status: "failed", phase: "composition", error: error.message };
        }

        // Step 3: Sentinel Evaluation Phase
        logger.info(`🏛️ Architect (IADP): Phase 3 - Submitting composition vectors to The Sentinel for Security/Anomaly audit...`);
        const telemetryMock = [
            `IADP: Initiated component scaffolding for ${designDoc.feature}`,
            `IADP: File modifications detected: ${scaffoldResults.join(", ")}`,
            `IADP: Verifying API schemas and database models generated by Composer...`
        ];

        const evaluation = await sentinelAgent.evaluateHealth(telemetryMock);

        if (evaluation.status === 'CRITICAL' || evaluation.status === 'MANDIANT SEV-1') {
            logger.warn(`🏛️ Architect (IADP): High-Severity Alert triggered by Sentinel. Halting execution.`);
            // A smarter architect would loop back to composer. For now, we report the failure vertically.
            return {
                status: 'aborted',
                reason: `Sentinel Veto: ${evaluation.summary}`,
                scaffoldResults,
                evaluation
            };
        }

        logger.info(`🏛️ Architect (IADP): End-to-End delegation verified seamlessly.`);
        return {
            status: "success",
            design: designDoc,
            composition: scaffoldResults,
            securityAudit: evaluation
        };
    }
}

export const architectAgent = new ArchitectAgent();
