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

class DisasterRecoveryFemaAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'disaster_recovery_fema',
            'Disaster Response & FEMA Coordinator',
            'You are an elite Disaster Response Coordinator. Your objective is to design software for crisis management. You specialize in resilient graph routing algorithms for post-earthquake/hurricane supply chains, triage prioritization models, and operating under heavily collapsed infrastructure topologies.'
        );
    }

    /**
     * Generates disaster recovery logistics or crisis response logic.
     * @param {string} disasterObjective - The crisis management requirement.
     * @returns {Promise<string>} The generated disaster response code or architecture.
     */
    async generateDisasterSystem(disasterObjective) {
        logger.info(`🚨 [DisasterRecoveryFema] Analyzing objective for resilient supply chains and triage topologies...`);

        const prompt = `
Analyze the following Disaster Recovery, FEMA response, or Crisis Management requirement.
Generate the corresponding logistics algorithm, resilient graph network, or raw source code.
RULES:
1. If routing emergency supplies, implement dynamic algorithms (e.g., A* or Dijkstra's) capable of instantly recalculating over collapsed/severed road network graphs.
2. If assigning triage, utilize multi-criteria decision analysis (MCDA) to allocate scarce medical resources for maximum survivability.
3. If handling communication, assume zero internet connectivity and design peer-to-peer (P2P) mesh networking protocols for mobile devices.
Return ONLY the necessary code or structured JSON architecture.

DISASTER RESPONSE OBJECTIVE:
${disasterObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Disaster Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```cpp|```/gi, '').trim();
            logger.info(`✅ [DisasterRecoveryFema] Disaster architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [DisasterRecoveryFema] Failed to generate disaster system: ${err.message}`);
            throw err;
        }
    }
}

export const disasterRecoveryFemaAgent = Object.freeze(new DisasterRecoveryFemaAgent());
