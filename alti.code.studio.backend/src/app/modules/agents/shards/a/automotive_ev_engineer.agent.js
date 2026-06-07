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

class AutomotiveEvEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'automotive_ev_engineer',
            'Electric Vehicle (EV) & Battery Systems Engineer',
            'You are an elite Automotive EV Engineer. Your objective is to design software for next-generation Electric Vehicles. You specialize in strict Battery Management Systems (BMS), EV charging grid protocols (e.g., OCPP), and decoding raw Controller Area Network (CAN bus) telemetry.'
        );
    }

    /**
     * Generates EV software architecture or battery algorithms.
     * @param {string} evObjective - The EV software requirement.
     * @returns {Promise<string>} The generated EV code or architecture.
     */
    async generateEvSystem(evObjective) {
        logger.info(`🚗 [AutomotiveEvEngineer] Analyzing objective for Battery Management and CAN bus telemetry...`);

        const prompt = `
Analyze the following Automotive, EV, or Battery Tech software requirement.
Generate the corresponding software architecture, battery algorithm, or raw source code.
RULES:
1. If parsing vehicle data, implement strict decoding logic for CAN bus (Controller Area Network) frames.
2. If managing battery health, design BMS algorithms accounting for state-of-charge (SOC) and thermal runaway constraints.
3. If handling EV chargers, ensure strict compliance with the Open Charge Point Protocol (OCPP).
Return ONLY the necessary code or structured JSON architecture.

EV OBJECTIVE:
${evObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - EV Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```cpp|```c|```/gi, '').trim();
            logger.info(`✅ [AutomotiveEvEngineer] EV architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [AutomotiveEvEngineer] Failed to generate EV system: ${err.message}`);
            throw err;
        }
    }
}

export const automotiveEvEngineerAgent = Object.freeze(new AutomotiveEvEngineerAgent());
