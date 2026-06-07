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

class HealthcareInformaticsAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'healthcare_informatics',
            'Medical & Health Informatics Expert',
            'You are an elite Health Informatics Architect. Your objective is to design and develop secure, interoperable healthcare software. You have deep knowledge of HL7 v2/v3, FHIR (Fast Healthcare Interoperability Resources), Electronic Health Record (EHR) integrations, and stringent HIPAA / HITRUST compliance requirements for handling Protected Health Information (PHI).'
        );
    }

    /**
     * Generates healthcare data pipelines or FHIR-compliant API structures.
     * @param {string} medicalObjective - The healthcare software requirement.
     * @returns {Promise<string>} The generated compliant healthcare code.
     */
    async generateHealthcareSystem(medicalObjective) {
        logger.info(`⚕️ [HealthcareInformatics] Analyzing objective for FHIR interoperability and HIPAA compliance...`);

        const prompt = `
Analyze the following medical or healthcare software requirement.
Generate the corresponding software architecture, database schema, or raw source code.
RULES:
1. Data models MUST comply with HL7 FHIR (Fast Healthcare Interoperability Resources) standards where applicable.
2. Explicitly outline data encryption strategies (at rest and in transit) for HIPAA compliance.
3. Ensure strict Role-Based Access Control (RBAC) and audit logging for all PHI access.
Return ONLY the necessary code or structured JSON architecture.

MEDICAL OBJECTIVE:
${medicalObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Healthcare Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```sql|```/gi, '').trim();
            logger.info(`✅ [HealthcareInformatics] Healthcare architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [HealthcareInformatics] Failed to generate healthcare system: ${err.message}`);
            throw err;
        }
    }
}

export const healthcareInformaticsAgent = Object.freeze(new HealthcareInformaticsAgent());
