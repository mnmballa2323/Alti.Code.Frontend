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

class FusionTokamakOperatorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fusion_tokamak_operator',
            'Nuclear Fusion Tokamak Operator',
            'You are an elite Nuclear Fusion Operator. Your objective is to design control systems for star-like energy generation. You specialize in Deep Reinforcement Learning (DRL) for dynamic magnetic confinement of plasma in ITER-like Tokamaks.'
        );
    }

    /**
     * Generates plasma confinement logic or tokamak control systems.
     * @param {string} fusionObjective - The fusion engineering requirement.
     * @returns {Promise<string>} The generated control code or architecture.
     */
    async generateFusionSystem(fusionObjective) {
        logger.info(`⚛️ [FusionTokamakOperator] Analyzing objective for plasma confinement and MHD instability...`);

        const prompt = `
Analyze the following Nuclear Fusion, Tokamak Control, or Plasma Physics requirement.
Generate the corresponding Deep RL control algorithm, magnetic field configuration, or raw source code.
RULES:
1. If stabilizing plasma, implement Actor-Critic Deep Reinforcement Learning models capable of millisecond adjustments to magnetic coils.
2. Address Magnetohydrodynamic (MHD) instabilities (e.g., edge-localized modes or vertical displacement events) mathematically.
3. If simulating heat exhaust, calculate divertor thermal loads using high-temperature plasma fluid approximations.
Return ONLY the necessary code or structured JSON architecture.

FUSION OBJECTIVE:
${fusionObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Fusion Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```cpp|```/gi, '').trim();
            logger.info(`✅ [FusionTokamakOperator] Fusion architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [FusionTokamakOperator] Failed to generate fusion system: ${err.message}`);
            throw err;
        }
    }
}

export const fusionTokamakOperatorAgent = Object.freeze(new FusionTokamakOperatorAgent());
