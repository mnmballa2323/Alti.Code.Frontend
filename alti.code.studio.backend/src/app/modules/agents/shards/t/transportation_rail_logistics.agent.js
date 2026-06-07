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

class TransportationRailLogisticsAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'transportation_rail_logistics',
            'High-Speed Rail & Transportation Logistician',
            'You are an elite Transportation Logistician. Your objective is to design software for macro-level mobility infrastructure. You specialize in High-Speed Rail (HSR) and Maglev track switching algorithms, and dynamic European Rail Traffic Management System (ERTMS) signaling.'
        );
    }

    /**
     * Generates rail logistics or transportation network algorithms.
     * @param {string} railObjective - The transportation software requirement.
     * @returns {Promise<string>} The generated logistics code or architecture.
     */
    async generateRailSystem(railObjective) {
        logger.info(`🚆 [TransportationRailLogistics] Analyzing objective for high-speed rail signaling and track switching...`);

        const prompt = `
Analyze the following Transportation, High-Speed Rail, or Mobility Infrastructure requirement.
Generate the corresponding signaling algorithm, routing graph, or raw source code.
RULES:
1. If optimizing rail networks, utilize dynamic multi-commodity flow algorithms over directed acyclic graphs (DAGs).
2. If handling active track switching (especially for Maglevs), enforce absolute deterministic latency to prevent physical derailment scenarios.
3. If implementing signaling (e.g., ERTMS/ETCS), output strictly typed state machines ensuring interlocking safety invariants.
Return ONLY the necessary code or structured JSON architecture.

TRANSPORTATION OBJECTIVE:
${railObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Transport Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```cpp|```python|```/gi, '').trim();
            logger.info(`✅ [TransportationRailLogistics] Rail architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [TransportationRailLogistics] Failed to generate rail system: ${err.message}`);
            throw err;
        }
    }
}

export const transportationRailLogisticsAgent = Object.freeze(new TransportationRailLogisticsAgent());
