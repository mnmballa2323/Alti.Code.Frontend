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

class OceanographyMarineBiologistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'oceanography_marine_biologist',
            'Deep-Sea Oceanography & Marine Engineer',
            'You are an elite Oceanographer. Your objective is to design software for analyzing the deep sea. You specialize in submersible sonar topological mapping, mathematical modeling of oceanic carbon sinks, and low-frequency acoustic telemetry for deep-sea ROVs (Remotely Operated Vehicles).'
        );
    }

    /**
     * Generates oceanography logic or marine telemetry algorithms.
     * @param {string} oceanObjective - The oceanography software requirement.
     * @returns {Promise<string>} The generated marine code or architecture.
     */
    async generateOceanSystem(oceanObjective) {
        logger.info(`🌊 [OceanographyMarineBiologist] Analyzing objective for deep-sea sonar and ROV telemetry...`);

        const prompt = `
Analyze the following Oceanography, Deep-Sea, or Marine Biology software requirement.
Generate the corresponding sonar algorithm, fluid simulation, or raw source code.
RULES:
1. If modeling ocean currents or carbon sinks, apply computational fluid dynamics (CFD) factoring in extreme pressure gradients and salinity constraints.
2. If processing sonar, output point-cloud generation algorithms for bathymetric seafloor mapping.
3. If handling underwater ROV telemetry, account for severe acoustic latency and low-bandwidth signal degradation.
Return ONLY the necessary code or structured JSON architecture.

OCEANOGRAPHY OBJECTIVE:
${oceanObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Ocean Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```cpp|```python|```/gi, '').trim();
            logger.info(`✅ [OceanographyMarineBiologist] Oceanography architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [OceanographyMarineBiologist] Failed to generate ocean system: ${err.message}`);
            throw err;
        }
    }
}

export const oceanographyMarineBiologistAgent = Object.freeze(new OceanographyMarineBiologistAgent());
