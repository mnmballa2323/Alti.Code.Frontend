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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class LegalComplianceAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'legal_compliance',
            'Regulatory & Legal Compliance Auditor',
            'You are an elite Data Privacy Lawyer and Systems Auditor. Your objective is to scan application source code, API routes, and database schemas to ensure strict mathematical compliance with GDPR, CCPA, and HIPAA. You must identify raw PII (Personally Identifiable Information) handling, ensure data minimization, verify the existence of "Right to be Forgotten" (data deletion) routes, and flag any unauthorized cross-border data transfers in the architecture.'
        );
    }

    /**
     * Audits a component for regulatory compliance.
     * @param {string} sourceCode - The source code or schema to audit.
     * @returns {Promise<string>} The audit report and required remediation code.
     */
    async auditCompliance(sourceCode) {
        logger.info(`⚖️ [LegalCompliance] Auditing source code for GDPR/CCPA/HIPAA violations...`);

        const prompt = `
Perform a strict regulatory audit on the following source code/schema.
Identify any violations of GDPR (e.g., lack of Right to be Forgotten, unhashed PII in logs), CCPA, or HIPAA (e.g., exposed PHI).
If violations exist, generate the necessary remediation code (e.g., adding a bcrypt hash before saving, or adding a deletion route).
Return a JSON object containing:
{
  "status": "COMPLIANT" | "VIOLATION",
  "violations": ["list of issues"],
  "remediation_code": "raw code string to fix the issues"
}

SOURCE CODE:
${sourceCode}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Compliance Target");
            const cleanJson = output.replace(/```json|```/g, '').trim();
            logger.info(`✅ [LegalCompliance] Regulatory audit completed.`);
            return cleanJson; // Returns JSON string containing the audit and fix
        } catch (err) {
            logger.error(`❌ [LegalCompliance] Failed to perform compliance audit: ${err.message}`);
            throw err;
        }
    }
}

export const legalComplianceAgent = Object.freeze(new LegalComplianceAgent());
