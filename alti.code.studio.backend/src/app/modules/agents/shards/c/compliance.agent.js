// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class ComplianceAgent {
    constructor() {
        this.name = 'compliance';
        this.description = 'Autonomous Regulatory Auditor (SOC2, GDPR, HIPAA)';
        this.capabilities = [
            'Audit source code streams for regulatory transgressions',
            'Detect PII log leakage (e.g. passwords, SSNs, credit cards)',
            'Generate formal Internal Audit compliance reports'
        ];
    }

    /**
     * Inspects a provided code snippet specifically for compliance liabilities.
     * @param {string} sourceCode Code to audit
     * @param {string} framework The target regulatory framework (e.g., 'GDPR', 'SOC2')
     */
    async auditCode(sourceCode, framework = 'SOC2') {
        logger.info(`📋 Compliance Agent: Initiating internal [${framework.toUpperCase()}] audit protocol on provided logic...`);

        try {
            const prompt = `
            You are a strict, uncompromising Senior Compliance Auditor specializing in ${framework}.
            Your task is to review the following source code for explicit compliance violations (e.g., logging PII, missing encryption at rest, improper data retention).

            Code to Audit:
            \`\`\`
            ${sourceCode}
            \`\`\`

            Analyze the code strictly through the lens of ${framework}.

            Return a pure JSON validation report:
            {
                "compliant": boolean,
                "framework": "${framework}",
                "violationDetails": "Describe the violation strictly (or 'None' if compliant)",
                "remediation": "How a developer must fix this to pass audit",
                "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "NONE"
            }
            Do not include markdown code block formatting in your output.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const reportJson = rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const auditReport = JSON.parse(reportJson);

            if (!auditReport.compliant) {
                logger.warn(`🚨 Compliance Audit Failed! Framework: ${framework} | Severity: ${auditReport.severity}`);
                logger.warn(`   Violation: ${auditReport.violationDetails}`);
            } else {
                logger.info(`✅ Compliance Agent: Code complies with ${framework} requirements.`);
            }

            return auditReport;

        } catch (err) {
            logger.error(`❌ Compliance Agent Audit Failed: ${err.message}`);
            throw err;
        }
    }

    async process(state) {
        const code = state.data?.content || state.goal || "";
        const framework = state.data?.context || "SOC2";

        const auditReport = await this.auditCode(code, framework);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `Compliance [${framework}]: ${auditReport.compliant ? 'PASS' : 'FAIL'}`]
        };
    }
}

export const complianceAgent = Object.freeze(new ComplianceAgent());
