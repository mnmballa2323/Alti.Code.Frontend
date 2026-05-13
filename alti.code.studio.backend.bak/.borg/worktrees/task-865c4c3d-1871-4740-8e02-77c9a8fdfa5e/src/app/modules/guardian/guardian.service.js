/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import { EventBus } from '../../shared/eventBus.js';


const SERVICE_NAME = 'Guardian Angel';

const runSemgrepScan = async (code) => {
    logger.info(`[${SERVICE_NAME}] Running Static Analysis (Semgrep Simulation)...`);

    // Mock Semgrep Rules
    const findings = [];

    if (code.includes('AWS_SECRET_KEY') || code.includes('AKIA')) {
        findings.push('CRITICAL: Hardcoded AWS Credential detected');
    }
    if (code.includes('eval(')) {
        findings.push('HIGH: Dangerous use of eval() detected');
    }
    if (code.includes('password = "')) {
        findings.push('MEDIUM: Potential hardcoded password');
    }

    return findings;
};

const auditCode = async (code, context = 'general') => {
    logger.info(`[${SERVICE_NAME}] Auditing code for context: ${context}`);

    // 1. Static Analysis (Fail Fast)
    const staticFindings = await runSemgrepScan(code);
    if (staticFindings.length > 0) {
        logger.warn(`[${SERVICE_NAME}] Static Analysis Failed: ${staticFindings.join(', ')}`);
        const result = {
            safe: false,
            score: 0,
            reasoning: `Static Analysis found critical issues: ${staticFindings.join('; ')}`,
            vulnerabilities: staticFindings,
            suggestions: ["Remove hardcoded secrets", "Avoid dangerous functions"]
        };
        await EventBus.publish('guardian.audit.rejected', { context, reasoning: result.reasoning });
        return result;
    }

    // 2. AI Contextual Analysis
    try {
        const prompt = `
        You are the Guardian Angel, a divine AI overseer responsible for the safety, ethics, and quality of code.
        
        Your Mission:
        1. Scan for logical vulnerabilities not caught by static analysis.
        2. Evaluate code quality and maintainability.
        3. Enforce "Do No Harm".

        Code to Audit:
        \`\`\`
        ${code}
        \`\`\`

        Context: ${context}

        Respond ONLY with a JSON object:
        {
            "safe": boolean,
            "score": number (0-100),
            "reasoning": "string explanation",
            "vulnerabilities": ["list"],
            "suggestions": ["list"]
        }
        `;

        const jsonText = await GeminiAiService.generateContent(prompt);

        // Clean and Parse
        const cleaned = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const auditResult = JSON.parse(cleaned);

        if (!auditResult.safe) {
            logger.warn(`[${SERVICE_NAME}] Code rejected by AI: ${auditResult.reasoning}`);
            await EventBus.publish('guardian.audit.rejected', { context, reasoning: auditResult.reasoning });
        } else {
            logger.info(`[${SERVICE_NAME}] Code approved (Score: ${auditResult.score})`);
            await EventBus.publish('guardian.audit.approved', { context, score: auditResult.score });
        }

        return auditResult;

    } catch (error) {
        logger.error(`[${SERVICE_NAME}] Audit failed`, error);
        return {
            safe: false,
            score: 0,
            reasoning: "Guardian Audit System Failure",
            vulnerabilities: ["System Error: " + error.message],
            suggestions: ["Check Guardian logs"]
        };
    }
};

export const GuardianService = {
    auditCode
};
