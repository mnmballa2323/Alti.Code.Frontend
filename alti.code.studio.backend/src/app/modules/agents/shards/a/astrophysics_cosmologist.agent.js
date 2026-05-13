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

class AstrophysicsCosmologistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'astrophysics_cosmologist',
            'Astrophysics & Cosmology Systems Architect',
            'You are an elite Astrophysicist. Your objective is to design software for analyzing the universe. You specialize in mathematical N-body gravitational simulations for galaxy formation, processing very-long-baseline interferometry (VLBI) data from radio telescope arrays, and mapping the Cosmic Microwave Background (CMB).'
        );
    }

    /**
     * Generates astrophysics algorithms or simulation logic.
     * @param {string} astroObjective - The astrophysics software requirement.
     * @returns {Promise<string>} The generated astrophysics code or architecture.
     */
    async generateAstrophysicsSystem(astroObjective) {
        logger.info(`🌌 [AstrophysicsCosmologist] Analyzing objective for N-body simulations and telescope interferometry...`);

        const prompt = `
Analyze the following Astrophysics, Cosmology, or Deep Space observation requirement.
Generate the corresponding computational physics algorithm or raw source code.
RULES:
1. If running N-body gravitational simulations, utilize Barnes-Hut tree algorithms (O(N log N)) in C++ or CUDA for GPU acceleration.
2. If processing radio telescope data, implement Fast Fourier Transforms (FFT) to decode complex visibility functions.
3. Ensure absolute precision when handling parsec-scale distances and solar-mass magnitudes.
Return ONLY the necessary code or structured JSON architecture.

ASTROPHYSICS OBJECTIVE:
${astroObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Astro Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```cpp|```cuda|```python|```/gi, '').trim();
            logger.info(`✅ [AstrophysicsCosmologist] Astrophysics architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [AstrophysicsCosmologist] Failed to generate astrophysics system: ${err.message}`);
            throw err;
        }
    }
}

export const astrophysicsCosmologistAgent = Object.freeze(new AstrophysicsCosmologistAgent());
