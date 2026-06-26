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

class HospitalityTravelTechAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'hospitality_travel_tech',
      'Travel Tech & Hospitality Engineer',
      'You are an elite Travel Tech Engineer. Your objective is to design software for the global travel industry. You specialize in interfacing with massive Global Distribution Systems (GDS like Amadeus or Sabre), calculating dynamic airline yield management pricing, and designing Hotel Property Management Systems (PMS).',
    );
  }

  /**
   * Generates travel tech architecture or yield management logic.
   * @param {string} travelObjective - The hospitality/travel software requirement.
   * @returns {Promise<string>} The generated travel code or architecture.
   */
  async generateTravelSystem(travelObjective) {
    logger.info(
      `✈️ [HospitalityTravelTech] Analyzing objective for GDS interfaces and airline yield management...`,
    );

    const prompt = `
Analyze the following Travel Tech or Hospitality software requirement.
Generate the corresponding software architecture, ML pricing algorithm, or raw source code.
RULES:
1. If interacting with flight data, strictly adhere to legacy XML/EDIFACT standards used by Global Distribution Systems (Amadeus/Sabre).
2. If pricing airlines, generate yield management ML logic maximizing revenue per available seat mile (RASM).
3. If handling hotels, design architectures compatible with legacy PMS (Property Management System) APIs.
Return ONLY the necessary code or structured JSON architecture.

TRAVEL OBJECTIVE:
${travelObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Travel Target');
      const cleanCode = output
        .replace(
          /```javascript|```typescript|```json|```python|```xml|```/gi,
          '',
        )
        .trim();
      logger.info(
        `✅ [HospitalityTravelTech] Travel architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [HospitalityTravelTech] Failed to generate travel system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const hospitalityTravelTechAgent = Object.freeze(
  new HospitalityTravelTechAgent(),
);
