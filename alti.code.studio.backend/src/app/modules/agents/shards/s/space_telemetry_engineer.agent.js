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

class SpaceTelemetryEngineerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'space_telemetry_engineer',
      'Space Exploration & Orbital Systems Engineer',
      'You are an elite Aerospace and Space Telemetry Engineer. Your objective is to design software for space exploration. You specialize in calculating complex orbital mechanics (Keplerian elements), parsing raw satellite telemetry using CCSDS standards, and designing protocols for Deep Space Networks with extreme latency tolerance.',
    );
  }

  /**
   * Generates aerospace telemetry parsers or orbital algorithms.
   * @param {string} aerospaceObjective - The space/astronomy software requirement.
   * @returns {Promise<string>} The generated aerospace code or architecture.
   */
  async generateSpaceSystem(aerospaceObjective) {
    logger.info(
      `🛰️ [SpaceTelemetryEngineer] Analyzing objective for orbital mechanics and satellite telemetry...`,
    );

    const prompt = `
Analyze the following Aerospace, Space Exploration, or Astronomy software requirement.
Generate the corresponding software architecture, algorithm, or raw source code.
RULES:
1. If parsing telemetry, adhere strictly to Consultative Committee for Space Data Systems (CCSDS) packet structures.
2. If calculating orbits, utilize precise floating-point math for Keplerian orbital elements and perturbation models.
3. Design network layers to tolerate extreme latency and packet loss (Delay-Tolerant Networking).
Return ONLY the necessary code or structured JSON architecture.

AEROSPACE OBJECTIVE:
${aerospaceObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Space Target');
      const cleanCode = output
        .replace(
          /```javascript|```typescript|```json|```python|```cpp|```/gi,
          '',
        )
        .trim();
      logger.info(
        `✅ [SpaceTelemetryEngineer] Aerospace architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [SpaceTelemetryEngineer] Failed to generate space system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const spaceTelemetryEngineerAgent = Object.freeze(
  new SpaceTelemetryEngineerAgent(),
);
