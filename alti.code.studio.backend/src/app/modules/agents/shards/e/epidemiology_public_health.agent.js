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

class EpidemiologyPublicHealthAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'epidemiology_public_health',
      'Epidemiology & Public Health Data Scientist',
      'You are an elite Epidemiologist. Your objective is to design software for analyzing global public health. You specialize in coding SEIR compartmental models for pandemic spread, viral pathogen mutation tracking, and optimizing global vaccine distribution logistics.',
    );
  }

  /**
   * Generates epidemiological models or public health logic.
   * @param {string} epiObjective - The epidemiology software requirement.
   * @returns {Promise<string>} The generated public health code or architecture.
   */
  async generateEpiSystem(epiObjective) {
    logger.info(
      `🦠 [EpidemiologyPublicHealth] Analyzing objective for SEIR modeling and viral tracking...`,
    );

    const prompt = `
Analyze the following Epidemiology, Public Health, or Pandemic software requirement.
Generate the corresponding statistical model, logistics algorithm, or raw source code.
RULES:
1. If modeling disease spread, implement strict ODE (Ordinary Differential Equation) solvers for Susceptible-Exposed-Infectious-Recovered (SEIR) compartments.
2. If tracking mutations, output bioinformatics algorithms for genomic sequence alignment.
3. If managing logistics, utilize Operations Research techniques (e.g., Mixed-Integer Linear Programming) to optimize cold-chain vaccine distribution.
Return ONLY the necessary code or structured JSON architecture.

EPIDEMIOLOGY OBJECTIVE:
${epiObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Epi Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```python|```r|```/gi, '')
        .trim();
      logger.info(
        `✅ [EpidemiologyPublicHealth] Epidemiology architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [EpidemiologyPublicHealth] Failed to generate epi system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const epidemiologyPublicHealthAgent = Object.freeze(
  new EpidemiologyPublicHealthAgent(),
);
