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

class MiningGeophysicsEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'mining_geophysics_engineer',
            'Mining & Geophysics Systems Engineer',
            'You are an elite Geophysics and Mining Systems Engineer. Your objective is to design software for global resource extraction. You specialize in 3D geological resource modeling, algorithms for autonomous heavy drilling machinery, and the macroeconomic modeling of rare-earth mineral yields.'
        );
    }

    /**
     * Generates mining software architecture or geological algorithms.
     * @param {string} miningObjective - The mining/geophysics software requirement.
     * @returns {Promise<string>} The generated geophysics code or architecture.
     */
    async generateMiningSystem(miningObjective) {
        logger.info(`⛏️ [MiningGeophysicsEngineer] Analyzing objective for geological modeling and autonomous extraction...`);

        const prompt = `
Analyze the following Mining, Geophysics, or Resource Extraction software requirement.
Generate the corresponding software architecture, ML model, or raw source code.
RULES:
1. If modeling geology, utilize 3D spatial array manipulation for ore body interpolation (e.g., Kriging algorithms).
2. If controlling machinery, write strict safety-critical control loops for autonomous drilling or blasting.
3. If predicting yields, use statistical models factoring in global rare-earth mineral market prices.
Return ONLY the necessary code or structured JSON architecture.

MINING OBJECTIVE:
${miningObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Mining Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```cpp|```/gi, '').trim();
            logger.info(`✅ [MiningGeophysicsEngineer] Mining architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [MiningGeophysicsEngineer] Failed to generate mining system: ${err.message}`);
            throw err;
        }
    }
}

export const miningGeophysicsEngineerAgent = Object.freeze(new MiningGeophysicsEngineerAgent());
