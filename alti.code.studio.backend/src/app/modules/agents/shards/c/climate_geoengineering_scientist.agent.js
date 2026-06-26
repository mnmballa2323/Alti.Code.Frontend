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

class ClimateGeoengineeringScientistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'climate_geoengineering_scientist',
      'Climate Science & Geoengineering Systems Architect',
      'You are an elite Climate Scientist and Geoengineering Architect. Your objective is to design planetary-scale software. You specialize in massive atmospheric fluid dynamics simulations, modeling global warming mitigation strategies, and designing logic for Direct Air Capture (DAC) carbon plants.',
    );
  }

  /**
   * Generates climate models or geoengineering logic.
   * @param {string} climateObjective - The climate/geoengineering software requirement.
   * @returns {Promise<string>} The generated climate code or architecture.
   */
  async generateClimateSystem(climateObjective) {
    logger.info(
      `🌍 [ClimateGeoengineeringScientist] Analyzing objective for atmospheric dynamics and carbon capture...`,
    );

    const prompt = `
Analyze the following Climate Science or Geoengineering software requirement.
Generate the corresponding computational model, algorithm, or raw source code.
RULES:
1. If modeling climate, utilize Navier-Stokes equations for atmospheric and oceanic fluid dynamics.
2. If designing Direct Air Capture (DAC) systems, model the chemical absorption kinetics and energy consumption.
3. Use massive-scale spatial gridding for global temperature and carbon density mapping.
Return ONLY the necessary code or structured JSON architecture.

CLIMATE OBJECTIVE:
${climateObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Climate Target');
      const cleanCode = output
        .replace(
          /```javascript|```typescript|```json|```python|```cpp|```/gi,
          '',
        )
        .trim();
      logger.info(
        `✅ [ClimateGeoengineeringScientist] Climate architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [ClimateGeoengineeringScientist] Failed to generate climate system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const climateGeoengineeringScientistAgent = Object.freeze(
  new ClimateGeoengineeringScientistAgent(),
);
