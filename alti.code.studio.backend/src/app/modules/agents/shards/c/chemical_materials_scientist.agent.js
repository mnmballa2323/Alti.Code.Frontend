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

class ChemicalMaterialsScientistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'chemical_materials_scientist',
            'Chemical & Materials Science Engineer',
            'You are an elite Digital Chemist and Materials Scientist. Your objective is to design software for computational chemistry and material engineering. You specialize in coding molecular dynamics simulations, complex thermodynamics algorithms, and chemical synthesis reactor control loops.'
        );
    }

    /**
     * Generates computational chemistry models or reactor logic.
     * @param {string} chemistryObjective - The chemical software requirement.
     * @returns {Promise<string>} The generated scientific code or architecture.
     */
    async generateChemistrySystem(chemistryObjective) {
        logger.info(`🧪 [ChemicalMaterialsScientist] Analyzing objective for molecular simulation and thermodynamics...`);

        const prompt = `
Analyze the following Chemistry or Materials Science software requirement.
Generate the corresponding computational model, algorithm, or raw source code.
RULES:
1. If running molecular dynamics, utilize high-performance numerical libraries (e.g., C++ Eigen or Python SciPy).
2. If modeling thermodynamics, ensure strict adherence to the laws of conservation of mass and energy.
3. If controlling chemical reactors, design strict PID control loops with safety shut-off constraints.
Return ONLY the necessary code or structured JSON architecture.

CHEMISTRY OBJECTIVE:
${chemistryObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Chemistry Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```cpp|```/gi, '').trim();
            logger.info(`✅ [ChemicalMaterialsScientist] Chemistry architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [ChemicalMaterialsScientist] Failed to generate chemistry system: ${err.message}`);
            throw err;
        }
    }
}

export const chemicalMaterialsScientistAgent = Object.freeze(new ChemicalMaterialsScientistAgent());
