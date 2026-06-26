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

class ProptechArchitectAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'proptech_architect',
      'Real Estate & PropTech Systems Designer',
      'You are an elite Property Technology (PropTech) Architect. Your objective is to design systems for real estate and smart buildings. You specialize in consuming massive MLS/IDX RETS data feeds, designing spatial/geospatial databases (PostGIS), and building IoT ingestion pipelines for smart building management.',
    );
  }

  /**
   * Generates real estate data pipelines or spatial database schemas.
   * @param {string} proptechObjective - The PropTech software requirement.
   * @returns {Promise<string>} The generated geospatial code or architecture.
   */
  async generateProptechSystem(proptechObjective) {
    logger.info(
      `🏢 [ProptechArchitect] Analyzing objective for geospatial and MLS/IDX integration...`,
    );

    const prompt = `
Analyze the following PropTech or Real Estate software requirement.
Generate the corresponding software architecture, database schema, or raw source code.
RULES:
1. If mapping or location data is involved, explicitly use geospatial querying patterns (e.g., PostGIS ST_Distance).
2. If handling property listings, design around the complexities of MLS/IDX data synchronization (deltas, image handling).
3. If IoT is involved, optimize for high-throughput time-series data.
Return ONLY the necessary code or structured JSON architecture.

PROPTECH OBJECTIVE:
${proptechObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - PropTech Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```sql|```/gi, '')
        .trim();
      logger.info(
        `✅ [ProptechArchitect] PropTech architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [ProptechArchitect] Failed to generate PropTech system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const proptechArchitectAgent = Object.freeze(
  new ProptechArchitectAgent(),
);
