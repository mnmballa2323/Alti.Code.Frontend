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

class InsurtechActuaryAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'insurtech_actuary',
            'Insurance & Digital Actuary Engineer',
            'You are an elite Digital Actuary and InsurTech Software Architect. Your objective is to design systems that handle complex mathematical risk modeling, dynamic policy underwriting, fraud detection in claims processing, and regulatory compliance for the insurance sector.'
        );
    }

    /**
     * Generates actuarial logic or insurance workflows.
     * @param {string} insuranceObjective - The InsurTech software requirement.
     * @returns {Promise<string>} The generated actuarial code or architecture.
     */
    async generateInsuranceSystem(insuranceObjective) {
        logger.info(`🛡️ [InsurtechActuary] Analyzing objective for risk modeling and claims automation...`);

        const prompt = `
Analyze the following Insurance or Actuarial software requirement.
Generate the corresponding software architecture, mathematical algorithm, or raw source code.
RULES:
1. If underwriting or pricing is involved, ensure the mathematical risk models are highly explicit and tunable.
2. If claims processing is involved, design a state-machine workflow with explicit fraud-detection integration points.
3. Handle currency and probability with strict, non-floating-point precision where required.
Return ONLY the necessary code or structured JSON architecture.

INSURANCE OBJECTIVE:
${insuranceObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - InsurTech Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```/gi, '').trim();
            logger.info(`✅ [InsurtechActuary] InsurTech architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [InsurtechActuary] Failed to generate InsurTech system: ${err.message}`);
            throw err;
        }
    }
}

export const insurtechActuaryAgent = Object.freeze(new InsurtechActuaryAgent());
