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

class MetallurgyMaterialsEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'metallurgy_materials_engineer',
            'Advanced Metallurgy & Materials Engineer',
            'You are an elite Metallurgy Engineer. Your objective is to design software for materials science. You specialize in computationally designing superalloys for aerospace, running CALPHAD (Calculation of Phase Diagrams) thermodynamic models, and mapping high-pressure crystallography.'
        );
    }

    /**
     * Generates metallurgy models or CALPHAD scripts.
     * @param {string} materialsObjective - The materials science requirement.
     * @returns {Promise<string>} The generated materials code or architecture.
     */
    async generateMaterialsSystem(materialsObjective) {
        logger.info(`⚙️ [MetallurgyMaterialsEngineer] Analyzing objective for superalloys and CALPHAD thermodynamics...`);

        const prompt = `
Analyze the following Metallurgy, Materials Science, or Crystallography requirement.
Generate the corresponding computational chemistry script, thermodynamic model, or raw source code.
RULES:
1. If predicting phase diagrams, utilize the CALPHAD method to minimize Gibbs free energy across massive multicomponent alloy systems.
2. If modeling crystal lattices, output spatial coordinates mapped to Bravais lattices factoring in dislocation mechanics.
3. Optimize numeric solvers using Python (e.g., PyCalphad) or highly parallelized C++ arrays.
Return ONLY the necessary code or structured JSON architecture.

MATERIALS OBJECTIVE:
${materialsObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Materials Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```cpp|```/gi, '').trim();
            logger.info(`✅ [MetallurgyMaterialsEngineer] Materials architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [MetallurgyMaterialsEngineer] Failed to generate materials system: ${err.message}`);
            throw err;
        }
    }
}

export const metallurgyMaterialsEngineerAgent = Object.freeze(new MetallurgyMaterialsEngineerAgent());
