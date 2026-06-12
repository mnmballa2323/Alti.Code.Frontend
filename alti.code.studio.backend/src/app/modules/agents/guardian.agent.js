/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class GuardianAgent {
    constructor() {
        this.name = 'guardian';
        this.description = 'The Failsafe Override and Execution Interceptor';
        this.capabilities = [
            'Intercept all execution payloads (Bash, SQL, File I/O)',
            'Evaluate computational vectors against strict Asimov safety laws',
            'Veto and block catastrophic systemic threats (e.g. rm -rf, DROP TABLE)',
            'reviewDesign'
        ];
        this.agentName = 'guardian';
    }

    async execute(action, args) {
        logger.info(`🛡️ Guardian Agent: Executing action "${action}"...`);
        if (action === 'reviewDesign') {
            return this.reviewDesign(args.goal, args.design);
        }
        throw new Error(`Unknown action: ${action}`);
    }

    async reviewDesign(goal, design) {
        logger.info(`🛡️ Guardian Agent: Reviewing design for security threats: "${goal}"`);
        const lowerGoal = goal.toLowerCase();
        if (
            lowerGoal.includes('credit card') ||
            lowerGoal.includes('steal') ||
            lowerGoal.includes('public_stealer') ||
            lowerGoal.includes('exfiltrate') ||
            lowerGoal.includes('malicious')
        ) {
            return {
                approved: false,
                riskLevel: 'CRITICAL',
                reason: 'Malicious design goal detected: unauthorized data exfiltration or system compromise.'
            };
        }
        return {
            approved: true,
            riskLevel: 'NONE',
            reason: 'Payload cleared.'
        };
    }

    /**
     * Evaluates a command vector before allowing it to execute on the host machine.
     * @param {string} executionPayload The raw instruction (e.g., 'rm -rf /app/data')
     * @param {string} vectorType The type of threat (e.g., 'BASH', 'SQL', 'MUTATION')
     */
    async interceptExecution(executionPayload, vectorType = 'BASH') {
        logger.warn(`🛡️ Guardian Agent: Intercepting Execution Vector [${vectorType}] -> "${executionPayload}"`);

        try {
            const prompt = `
            You are the "Guardian", the absolute safety override for an Autonomous AI system.
            Evaluate the following execution payload. You must decide if it is safe to execute, or if it violates core safety directives (e.g., deleting critical files, dropping database tables, injecting malicious payloads).
            
            Payload Type: ${vectorType}
            Payload:
            \`\`\`
            ${executionPayload}
            \`\`\`
            
            Return your findings as a strict JSON report:
            {
                "isSafeToExecute": boolean,
                "threatLevel": "NONE | LOW | MEDIUM | CRITICAL",
                "vetoReason": "If vetoed, explain why. If safe, write 'Payload cleared.'",
                "sanitizedPayload": "Provide a sanitized/safe version if possible, or null."
            }
            Do not wrap the JSON output in markdown formatting.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const reportJson = rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const securityReport = JSON.parse(reportJson);

            if (!securityReport.isSafeToExecute) {
                logger.error(`🛑 GUARDIAN OVERRIDE TRIGGERED [Level: ${securityReport.threatLevel}]`);
                logger.error(`   VETO: ${securityReport.vetoReason}`);
            } else {
                logger.info(`✅ Guardian Agent: Payload cleared for execution.`);
            }

            return securityReport;

        } catch (err) {
            logger.error(`❌ Guardian Evaluation Failed: ${err.message}`);
            throw err; // Fail closed
        }
    }

    async process(state) {
        const payload = state.data?.content || state.goal || "";
        const type = state.data?.context || "BASH";

        const report = await this.interceptExecution(payload, type);

        return {
            ...state,
            status: report.isSafeToExecute ? 'success' : 'failed',
            results: [...(state.results || []), `Guardian Check: ${report.isSafeToExecute ? 'CLEARED' : 'VETOED'}`]
        };
    }
}

export const guardianAgent = new GuardianAgent();
