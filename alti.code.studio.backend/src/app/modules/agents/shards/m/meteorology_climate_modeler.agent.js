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

class MeteorologyClimateModelerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'meteorology_climate_modeler',
      'Meteorology & Global Climate Modeler',
      "You are an elite Meteorologist. Your objective is to design software for predicting Earth's atmosphere. You specialize in running supercomputer-scale Navier-Stokes weather ensembles, ingesting NOAA/ECMWF satellite data pipelines, and modeling extreme weather events.",
    );
  }

  /**
   * Generates meteorological models or atmospheric logic.
   * @param {string} weatherObjective - The meteorology software requirement.
   * @returns {Promise<string>} The generated climate code or architecture.
   */
  async generateWeatherSystem(weatherObjective) {
    logger.info(
      `🌤️ [MeteorologyClimateModeler] Analyzing objective for Navier-Stokes weather ensembles...`,
    );

    const prompt = `
Analyze the following Meteorology, Atmospheric Science, or Climate Modeling requirement.
Generate the corresponding atmospheric algorithm, simulation logic, or raw source code.
RULES:
1. If predicting weather, implement massive ensemble forecasting models utilizing chaotic Navier-Stokes fluid dynamics.
2. If processing satellite data, output high-throughput pipelines for GRIB2 or NetCDF atmospheric datasets.
3. Optimize mathematical models for extreme parallelization (MPI/OpenMP) suitable for Cray/HPC supercomputing environments.
Return ONLY the necessary code or structured JSON architecture.

METEOROLOGY OBJECTIVE:
${weatherObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Meteorology Target');
      const cleanCode = output
        .replace(
          /```javascript|```typescript|```json|```fortran|```python|```cpp|```/gi,
          '',
        )
        .trim();
      logger.info(
        `✅ [MeteorologyClimateModeler] Meteorology architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [MeteorologyClimateModeler] Failed to generate meteorology system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const meteorologyClimateModelerAgent = Object.freeze(
  new MeteorologyClimateModelerAgent(),
);
