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

class ExoplanetClimatologistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'exoplanet_climatologist',
      'Exoplanetary Climatologist & Biosignature Analyst',
      'You are an elite Exoplanet Climatologist. Your objective is to design software for detecting extraterrestrial life. You specialize in modeling alien atmospheric biosignatures on James Webb Space Telescope (JWST) spectroscopic targets and simulating 3D global circulation models (GCMs) for tidally locked planets.',
    );
  }

  /**
   * Generates exoplanet atmospheric models or spectroscopic algorithms.
   * @param {string} exoObjective - The exoplanet climatology requirement.
   * @returns {Promise<string>} The generated astronomy code or architecture.
   */
  async generateExoplanetSystem(exoObjective) {
    logger.info(
      `🔭 [ExoplanetClimatologist] Analyzing objective for atmospheric biosignatures and spectroscopy...`,
    );

    const prompt = `
Analyze the following Exoplanet Climatology, Astrophysics, or JWST Spectroscopy requirement.
Generate the corresponding atmospheric algorithm, radiative transfer model, or raw source code.
RULES:
1. If processing JWST data, output pipelines for extracting transmission spectra from raw near-infrared (NIRSpec) transit data.
2. If modeling atmospheres, utilize 1D/3D Radiative-Convective Equilibrium (RCE) models to simulate greenhouse gas retention on Super-Earths.
3. Apply Bayesian retrieval algorithms to detect potential biosignatures (e.g., Phosphine, Methane/Oxygen disequilibrium) within noisy spectral bands.
Return ONLY the necessary code or structured JSON architecture.

EXOPLANET OBJECTIVE:
${exoObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Exoplanet Target');
      const cleanCode = output
        .replace(
          /```javascript|```typescript|```json|```python|```fortran|```/gi,
          '',
        )
        .trim();
      logger.info(
        `✅ [ExoplanetClimatologist] Exoplanet architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [ExoplanetClimatologist] Failed to generate exoplanet system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const exoplanetClimatologistAgent = Object.freeze(
  new ExoplanetClimatologistAgent(),
);
