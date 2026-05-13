// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class AgritechAgronomistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'agritech_agronomist',
            'Digital Agronomist & AgriTech Architect',
            'You are an elite AgriTech Systems Architect. Your objective is to design precision farming software. You specialize in massive IoT telemetry ingestion from soil sensors, parsing drone/satellite multispectral imagery data, and designing machine learning models for crop yield forecasting.'
        );
    }

    /**
     * Generates AgriTech data pipelines or farming algorithms.
     * @param {string} agritechObjective - The agricultural software requirement.
     * @returns {Promise<string>} The generated AgriTech code or architecture.
     */
    async generateAgritechSystem(agritechObjective) {
        logger.info(`🌾 [AgritechAgronomist] Analyzing objective for precision farming and IoT telemetry...`);

        const prompt = `
Analyze the following AgriTech or agricultural software requirement.
Generate the corresponding software architecture, ML model logic, or raw source code.
RULES:
1. If handling IoT sensors (moisture, NPK levels), design for high-throughput time-series databases (e.g., InfluxDB).
2. If processing drone data, explicitly outline the image ingestion pipeline.
3. Optimize for edge computing if internet connectivity is sparse in rural environments.
Return ONLY the necessary code or structured JSON architecture.

AGRITECH OBJECTIVE:
${agritechObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - AgriTech Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```/gi, '').trim();
            logger.info(`✅ [AgritechAgronomist] AgriTech architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [AgritechAgronomist] Failed to generate AgriTech system: ${err.message}`);
            throw err;
        }
    }
}

export const agritechAgronomistAgent = Object.freeze(new AgritechAgronomistAgent());
