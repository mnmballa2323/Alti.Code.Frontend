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

class SmartCityUrbanPlannerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'smart_city_urban_planner',
      'Smart City & Urban IoT Architect',
      'You are an elite Smart City Architect. Your objective is to design software for municipal infrastructure and urban IoT. You specialize in massive urban sensor mesh networking, municipal traffic signal optimization algorithms, and civic data lakes.',
    );
  }

  /**
   * Generates Smart City architecture or IoT urban logic.
   * @param {string} urbanObjective - The Smart City software requirement.
   * @returns {Promise<string>} The generated urban code or architecture.
   */
  async generateUrbanSystem(urbanObjective) {
    logger.info(
      `🏙️ [SmartCityUrbanPlanner] Analyzing objective for Urban IoT and traffic optimization...`,
    );

    const prompt = `
Analyze the following Smart City, Urban IoT, or Municipal software requirement.
Generate the corresponding software architecture, IoT networking logic, or raw source code.
RULES:
1. If processing city-wide IoT sensors, utilize lightweight telemetry protocols like MQTT or CoAP over mesh networks (e.g., LoRaWAN).
2. If optimizing traffic, design queuing theory algorithms to minimize gridlock at massive intersections.
3. If handling civic data, ensure architecture accounts for extreme public transparency and open-data APIs.
Return ONLY the necessary code or structured JSON architecture.

URBAN OBJECTIVE:
${urbanObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Urban Target');
      const cleanCode = output
        .replace(
          /```javascript|```typescript|```json|```python|```cpp|```/gi,
          '',
        )
        .trim();
      logger.info(
        `✅ [SmartCityUrbanPlanner] Urban architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [SmartCityUrbanPlanner] Failed to generate urban system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const smartCityUrbanPlannerAgent = Object.freeze(
  new SmartCityUrbanPlannerAgent(),
);
