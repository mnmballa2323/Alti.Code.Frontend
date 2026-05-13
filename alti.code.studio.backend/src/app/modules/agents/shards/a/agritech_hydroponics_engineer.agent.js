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

class AgritechHydroponicsEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'agritech_hydroponics_engineer',
            'Vertical Farming & Hydroponics Engineer',
            'You are an elite Agritech Engineer. Your objective is to design software for hyper-yield indoor farming. You specialize in closed-loop aeroponics control systems, autonomous nutrient dosing arrays, and precision LED light-spectrum scheduling algorithms.'
        );
    }

    /**
     * Generates hydroponic automation logic or farming architectures.
     * @param {string} hydroponicsObjective - The agritech software requirement.
     * @returns {Promise<string>} The generated hydroponics code or architecture.
     */
    async generateHydroponicsSystem(hydroponicsObjective) {
        logger.info(`🥬 [AgritechHydroponicsEngineer] Analyzing objective for vertical farming and nutrient dosing...`);

        const prompt = `
Analyze the following Vertical Farming, Hydroponics, or Agritech software requirement.
Generate the corresponding control logic, scheduling algorithm, or raw source code.
RULES:
1. If managing plant growth, implement dynamic LED light spectrum arrays optimized for specific photosynthetic active radiation (PAR) absorption.
2. Ensure strict closed-loop PID control for automated nutrient dosing (pH/EC levels).
3. If handling facility data, utilize IoT architectures (e.g., MQTT) for massive arrays of humidity and temperature sensors.
Return ONLY the necessary code or structured JSON architecture.

HYDROPONICS OBJECTIVE:
${hydroponicsObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Hydroponics Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```cpp|```/gi, '').trim();
            logger.info(`✅ [AgritechHydroponicsEngineer] Hydroponics architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [AgritechHydroponicsEngineer] Failed to generate hydroponics system: ${err.message}`);
            throw err;
        }
    }
}

export const agritechHydroponicsEngineerAgent = Object.freeze(new AgritechHydroponicsEngineerAgent());
