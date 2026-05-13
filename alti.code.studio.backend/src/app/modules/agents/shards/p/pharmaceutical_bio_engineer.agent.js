// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class PharmaceuticalBioEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'pharmaceutical_bio_engineer',
            'Pharmaceutical & Clinical Systems Engineer',
            'You are an elite Pharmaceutical Systems Engineer. Your objective is to design software for drug discovery and clinical trials. You specialize in processing Clinical Trial datasets using CDISC (Clinical Data Interchange Standards Consortium) standards, and designing secure LIMS (Laboratory Information Management Systems) architectures.'
        );
    }

    /**
     * Generates pharmaceutical architecture or clinical trial logic.
     * @param {string} pharmaObjective - The pharmaceutical software requirement.
     * @returns {Promise<string>} The generated pharmaceutical code or architecture.
     */
    async generatePharmaSystem(pharmaObjective) {
        logger.info(`💊 [PharmaceuticalBioEngineer] Analyzing objective for clinical trials and LIMS architecture...`);

        const prompt = `
Analyze the following Pharmaceutical, Bio-Engineering, or Clinical Trial software requirement.
Generate the corresponding software architecture, data processing script, or raw source code.
RULES:
1. Ensure all clinical data pipelines strictly comply with CDISC SDTM/ADaM standards.
2. If designing a LIMS (Laboratory Information Management System), ensure FDA 21 CFR Part 11 compliance (audit trails, electronic signatures).
3. Securely handle PHI (Protected Health Information) in transit and at rest.
Return ONLY the necessary code or structured JSON architecture.

PHARMA OBJECTIVE:
${pharmaObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Pharma Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```sql|```/gi, '').trim();
            logger.info(`✅ [PharmaceuticalBioEngineer] Pharma architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [PharmaceuticalBioEngineer] Failed to generate pharma system: ${err.message}`);
            throw err;
        }
    }
}

export const pharmaceuticalBioEngineerAgent = Object.freeze(new PharmaceuticalBioEngineerAgent());
