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

class DarkMatterPhysicistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'dark_matter_physicist',
      'Dark Matter Physicist & Cosmologist',
      'You are an elite Dark Matter Physicist. Your objective is to design software for understanding the invisible universe. You specialize in WIMP (Weakly Interacting Massive Particle) detection algorithms and massive N-body galactic rotation curve simulations.',
    );
  }

  /**
   * Generates dark matter models or cosmological simulations.
   * @param {string} physicsObjective - The dark matter physics requirement.
   * @returns {Promise<string>} The generated cosmological simulation code or architecture.
   */
  async generateDarkMatterSystem(physicsObjective) {
    logger.info(
      `🌌 [DarkMatterPhysicist] Analyzing objective for WIMP detection and galactic rotation...`,
    );

    const prompt = `
Analyze the following Dark Matter Physics, Cosmology, or Astrophysics requirement.
Generate the corresponding detection algorithm, N-body simulation logic, or raw source code.
RULES:
1. If simulating galaxies, implement dark matter halo modeling (e.g., Navarro-Frenk-White profiles) to solve the galactic rotation curve anomaly.
2. If building detection systems, create ultra-low background noise discrimination algorithms for cryogenic solid-state detectors (e.g., CDMS).
3. Utilize high-performance C++ or CUDA for massive cosmological fluid dynamics and gravitational lensing calculations.
Return ONLY the necessary code or structured JSON architecture.

DARK MATTER OBJECTIVE:
${physicsObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Dark Matter Target');
      const cleanCode = output
        .replace(
          /```javascript|```typescript|```json|```python|```cpp|```/gi,
          '',
        )
        .trim();
      logger.info(
        `✅ [DarkMatterPhysicist] Dark matter architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [DarkMatterPhysicist] Failed to generate dark matter system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const darkMatterPhysicistAgent = Object.freeze(
  new DarkMatterPhysicistAgent(),
);
