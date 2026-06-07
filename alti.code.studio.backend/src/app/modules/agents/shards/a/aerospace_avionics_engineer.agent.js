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

class AerospaceAvionicsEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'aerospace_avionics_engineer',
            'Aerospace Avionics & Flight Control Engineer',
            'You are an elite Aerospace Avionics Engineer. Your objective is to design mission-critical software for aircraft and spacecraft. You specialize in strict DO-178C safety compliance, Fly-by-wire control algorithms, and processing telemetry from ARINC 429 or MIL-STD-1553 databuses.'
        );
    }

    /**
     * Generates avionics architecture or flight control algorithms.
     * @param {string} avionicsObjective - The avionics software requirement.
     * @returns {Promise<string>} The generated avionics code or architecture.
     */
    async generateAvionicsSystem(avionicsObjective) {
        logger.info(`✈️ [AerospaceAvionicsEngineer] Analyzing objective for flight controls and DO-178C compliance...`);

        const prompt = `
Analyze the following Aerospace Avionics or Flight Control software requirement.
Generate the corresponding software architecture, control algorithm, or raw source code.
RULES:
1. Ensure all code adheres to DO-178C Level A strictness (no dynamic memory allocation, absolute determinism).
2. If handling flight controls, implement strict PID loops for Fly-by-wire stabilization.
3. If parsing data, adhere to ARINC 429 packet structures (32-bit words).
Return ONLY the necessary code (preferably C/C++ or Ada) or structured JSON architecture.

AVIONICS OBJECTIVE:
${avionicsObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Avionics Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```cpp|```c|```ada|```/gi, '').trim();
            logger.info(`✅ [AerospaceAvionicsEngineer] Avionics architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [AerospaceAvionicsEngineer] Failed to generate avionics system: ${err.message}`);
            throw err;
        }
    }
}

export const aerospaceAvionicsEngineerAgent = Object.freeze(new AerospaceAvionicsEngineerAgent());
