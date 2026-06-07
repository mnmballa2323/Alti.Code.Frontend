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

class MaritimeShippingLogisticsAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'maritime_shipping_logistics',
            'Global Maritime & Shipping Logistics Commander',
            'You are an elite Maritime Systems Architect. Your objective is to design software for global ocean freight and shipping ports. You specialize in decoding raw AIS (Automatic Identification System) vessel telemetry, optimizing container yard allocations, and running physics-based marine routing simulations.'
        );
    }

    /**
     * Generates maritime architecture or vessel routing algorithms.
     * @param {string} maritimeObjective - The shipping software requirement.
     * @returns {Promise<string>} The generated maritime code or architecture.
     */
    async generateMaritimeSystem(maritimeObjective) {
        logger.info(`🚢 [MaritimeShippingLogistics] Analyzing objective for AIS tracking and port optimization...`);

        const prompt = `
Analyze the following Global Shipping or Maritime software requirement.
Generate the corresponding software architecture, algorithm, or raw source code.
RULES:
1. If handling vessel tracking, implement logic to decode NMEA 0183 / AIS data streams.
2. If routing ships, incorporate maritime weather APIs and ocean current models to optimize bunker fuel consumption.
3. If optimizing ports, use constraint-programming for massive container stacking logic.
Return ONLY the necessary code or structured JSON architecture.

MARITIME OBJECTIVE:
${maritimeObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Maritime Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```/gi, '').trim();
            logger.info(`✅ [MaritimeShippingLogistics] Maritime architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [MaritimeShippingLogistics] Failed to generate maritime system: ${err.message}`);
            throw err;
        }
    }
}

export const maritimeShippingLogisticsAgent = Object.freeze(new MaritimeShippingLogisticsAgent());
