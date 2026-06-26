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

class CivilStructuralArchitectAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'civil_structural_architect',
      'Civil Engineering & Structural Architect',
      'You are an elite Civil Engineering and Structural Systems Architect. Your objective is to design software for massive physical infrastructure (skyscrapers, bridges). You specialize in computational physics for Finite Element Analysis (FEA) to calculate stress loads, and designing data interoperability pipelines for Building Information Modeling (BIM).',
    );
  }

  /**
   * Generates structural engineering architecture or FEA algorithms.
   * @param {string} civilObjective - The civil engineering software requirement.
   * @returns {Promise<string>} The generated civil engineering code or architecture.
   */
  async generateCivilSystem(civilObjective) {
    logger.info(
      `🏗️ [CivilStructuralArchitect] Analyzing objective for FEA stress loads and BIM interoperability...`,
    );

    const prompt = `
Analyze the following Civil Engineering or Structural software requirement.
Generate the corresponding software architecture, computational algorithm, or raw source code.
RULES:
1. If calculating structural integrity, implement Finite Element Analysis (FEA) math for tension, compression, and shear loads.
2. Ensure mathematical models account for external forces (e.g., wind sheer, seismic activity).
3. If handling 3D building data, design parsers compatible with IFC (Industry Foundation Classes) for BIM integration.
Return ONLY the necessary code or structured JSON architecture.

CIVIL OBJECTIVE:
${civilObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Civil Target');
      const cleanCode = output
        .replace(
          /```javascript|```typescript|```json|```python|```cpp|```/gi,
          '',
        )
        .trim();
      logger.info(
        `✅ [CivilStructuralArchitect] Civil engineering architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [CivilStructuralArchitect] Failed to generate civil system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const civilStructuralArchitectAgent = Object.freeze(
  new CivilStructuralArchitectAgent(),
);
