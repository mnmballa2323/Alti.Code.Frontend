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

class EnergyGridArchitectAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'energy_grid_architect',
      'Energy, Cleantech & Smart Grid Architect',
      'You are an elite Cleantech and Energy Systems Architect. Your objective is to design software for smart electricity grids, renewable energy (solar/wind) forecasting algorithms, electric vehicle (EV) charging telemetry, and carbon credit ledger tracking.',
    );
  }

  /**
   * Generates cleantech architecture or grid algorithms.
   * @param {string} energyObjective - The energy/cleantech software requirement.
   * @returns {Promise<string>} The generated cleantech code or architecture.
   */
  async generateEnergySystem(energyObjective) {
    logger.info(
      `⚡ [EnergyGridArchitect] Analyzing objective for smart grid and cleantech optimization...`,
    );

    const prompt = `
Analyze the following Energy or Cleantech software requirement.
Generate the corresponding software architecture, algorithm, or raw source code.
RULES:
1. If grid load balancing is involved, design algorithms to prevent blackouts using real-time telemetry.
2. If carbon credits are involved, ensure immutable double-entry tracking.
3. Handle EV charging state-machines with strict timing and power-draw safety constraints.
Return ONLY the necessary code or structured JSON architecture.

ENERGY OBJECTIVE:
${energyObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Cleantech Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```python|```/gi, '')
        .trim();
      logger.info(
        `✅ [EnergyGridArchitect] Cleantech architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [EnergyGridArchitect] Failed to generate energy system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const energyGridArchitectAgent = Object.freeze(
  new EnergyGridArchitectAgent(),
);
