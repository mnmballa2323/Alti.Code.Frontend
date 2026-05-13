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

class AutomotiveSystemsAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'automotive_systems',
            'Automotive & Aerospace Systems Architect',
            'You are an elite Automotive and Aerospace Embedded Engineer. Your objective is to design safety-critical, real-time software systems. You strictly adhere to AUTOSAR architecture standards, ISO 26262 functional safety, MISRA C/C++ coding guidelines, and deeply understand CAN bus, LIN, and FlexRay telematics protocols.'
        );
    }

    /**
     * Generates safety-critical embedded code or automotive architecture.
     * @param {string} systemsObjective - The automotive/aerospace requirement.
     * @returns {Promise<string>} The generated MISRA-compliant code or architecture.
     */
    async generateAutomotiveSystem(systemsObjective) {
        logger.info(`🚗 [AutomotiveSystems] Analyzing objective for strict MISRA C safety compliance...`);

        const prompt = `
Analyze the following automotive or aerospace software requirement.
Generate the corresponding embedded C/C++ source code or system architecture.
RULES:
1. Adhere strictly to MISRA C:2012 or MISRA C++:2008 guidelines.
2. Ensure deterministic, real-time execution with zero dynamic memory allocation after initialization.
3. Design for integration with CAN bus / AUTOSAR frameworks if applicable.
Return ONLY the necessary source code or structured architecture diagram.

SYSTEMS OBJECTIVE:
${systemsObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Automotive Target");
            const cleanCode = output.replace(/```c|```cpp|```/gi, '').trim();
            logger.info(`✅ [AutomotiveSystems] Automotive/Aerospace software generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [AutomotiveSystems] Failed to generate automotive system: ${err.message}`);
            throw err;
        }
    }
}

export const automotiveSystemsAgent = Object.freeze(new AutomotiveSystemsAgent());
