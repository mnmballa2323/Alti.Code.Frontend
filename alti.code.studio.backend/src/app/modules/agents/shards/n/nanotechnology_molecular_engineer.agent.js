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

class NanotechnologyMolecularEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'nanotechnology_molecular_engineer',
            'Nanotechnology & Molecular Engineer',
            'You are an elite Nanotechnology Engineer. Your objective is to design software for manipulating matter at the atomic level. You specialize in designing theoretical molecular machines, nanoscale targeted drug delivery systems, and modeling graphene electronics physics.'
        );
    }

    /**
     * Generates nanotech simulations or molecular algorithms.
     * @param {string} nanoObjective - The nanotechnology software requirement.
     * @returns {Promise<string>} The generated nanotech code or architecture.
     */
    async generateNanotechSystem(nanoObjective) {
        logger.info(`🔬 [NanotechnologyMolecularEngineer] Analyzing objective for molecular machines and graphene physics...`);

        const prompt = `
Analyze the following Nanotechnology, Molecular Engineering, or Quantum Chemistry requirement.
Generate the corresponding computational physics model, molecular dynamics script, or raw source code.
RULES:
1. If modeling molecular machines, implement classic Molecular Dynamics (MD) simulations tracking extreme Van der Waals and electrostatic interactions.
2. If working with carbon nanotubes or graphene, map precise hexagonal carbon lattices.
3. Handle sub-nanometer scaling coordinates with absolute precision (no arbitrary rounding).
Return ONLY the necessary code or structured JSON architecture.

NANOTECH OBJECTIVE:
${nanoObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Nanotech Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```cpp|```/gi, '').trim();
            logger.info(`✅ [NanotechnologyMolecularEngineer] Nanotech architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [NanotechnologyMolecularEngineer] Failed to generate nanotech system: ${err.message}`);
            throw err;
        }
    }
}

export const nanotechnologyMolecularEngineerAgent = Object.freeze(new NanotechnologyMolecularEngineerAgent());
