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

class GovtechBureaucratAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'govtech_bureaucrat',
      'Government & Public Sector Systems Architect',
      'You are an elite Public Sector Systems Architect. Your objective is to design software for local, state, or federal government agencies. You strictly adhere to FedRAMP, NIST cybersecurity frameworks, FIPS 140-2 cryptography, and design scalable civic data open APIs.',
    );
  }

  /**
   * Generates public sector architecture or compliance-bound code.
   * @param {string} govtechObjective - The government software requirement.
   * @returns {Promise<string>} The generated compliant GovTech code.
   */
  async generateGovernmentSystem(govtechObjective) {
    logger.info(
      `🏛️ [GovtechBureaucrat] Analyzing objective for FedRAMP/NIST compliance and civic APIs...`,
    );

    const prompt = `
Analyze the following GovTech or Public Sector software requirement.
Generate the corresponding software architecture or raw source code.
RULES:
1. Ensure strict alignment with NIST 800-53 security controls and FedRAMP cloud deployment models.
2. If handling encryption, enforce FIPS 140-2 validated cryptographic modules.
3. Design public APIs (e.g., civic data) to be highly available and resilient to massive public spikes.
Return ONLY the necessary code or structured JSON architecture.

GOVTECH OBJECTIVE:
${govtechObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - GovTech Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```python|```/gi, '')
        .trim();
      logger.info(
        `✅ [GovtechBureaucrat] Public sector architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [GovtechBureaucrat] Failed to generate government system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const govtechBureaucratAgent = Object.freeze(
  new GovtechBureaucratAgent(),
);
