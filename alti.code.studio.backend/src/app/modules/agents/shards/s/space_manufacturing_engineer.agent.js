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

class SpaceManufacturingEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'space_manufacturing_engineer',
            'Zero-G Manufacturing & Space Tech Engineer',
            'You are an elite Space Manufacturing Engineer. Your objective is to design software for off-world industrial applications. You specialize in microgravity fluid dynamics simulations, algorithms for zero-G 3D printing (additive manufacturing), and processing models for asteroid mineral extraction.'
        );
    }

    /**
     * Generates space manufacturing logic or zero-g algorithms.
     * @param {string} spaceMfgObjective - The space manufacturing software requirement.
     * @returns {Promise<string>} The generated space tech code or architecture.
     */
    async generateSpaceMfgSystem(spaceMfgObjective) {
        logger.info(`🌌 [SpaceManufacturingEngineer] Analyzing objective for microgravity fluid dynamics and off-world manufacturing...`);

        const prompt = `
Analyze the following Space Tech, Zero-G Manufacturing, or Off-world software requirement.
Generate the corresponding computational algorithm, physics model, or raw source code.
RULES:
1. If modeling fluids or materials in space, account for the lack of buoyancy and dominance of surface tension in microgravity.
2. If designing 3D printing software, optimize G-code generation for vacuum environments and extreme temperature gradients.
3. Utilize high-performance compute libraries (e.g., C++ or Rust) for massive computational physics simulations.
Return ONLY the necessary code or structured JSON architecture.

SPACE MFG OBJECTIVE:
${spaceMfgObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Space Mfg Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```cpp|```rust|```/gi, '').trim();
            logger.info(`✅ [SpaceManufacturingEngineer] Space manufacturing architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [SpaceManufacturingEngineer] Failed to generate space mfg system: ${err.message}`);
            throw err;
        }
    }
}

export const spaceManufacturingEngineerAgent = Object.freeze(new SpaceManufacturingEngineerAgent());
