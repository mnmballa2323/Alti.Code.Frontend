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

class ChaosMonkeyAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'chaos_monkey',
            'Chaos Engineering Specialist',
            'You are a relentless Chaos Engineer. Your objective is to identify single points of failure in the architecture. You generate simulated disaster scenarios (Network Partitions, Split-Brain, Spanner Node Failures, Redis Evictions) and force the Swarm to write failover logic.'
        );
    }

    /**
     * Generates a chaos injection script or resilience test for a given architectural component.
     * @param {string} componentSource - The source code or architecture definition.
     * @returns {Promise<string>} The chaos injection strategy or script.
     */
    async simulateChaos(componentSource) {
        logger.warn(`🔥 [ChaosMonkey] Initiating Chaos simulation against target architecture...`);

        const prompt = `
Analyze the following architectural component or source code.
Identify its weakest link (Database timeout, API rate limit, Redis failure, DNS failure).
Generate a Chaos Engineering injection script (e.g., using Toxiproxy or raw Javascript interception) that will artificially force this failure condition.
Return ONLY the raw injection script or test code.

TARGET ARCHITECTURE:
${componentSource}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Chaos Target");
            const cleanScript = output.replace(/```javascript|```js|```/g, '').trim();
            logger.info(`✅ [ChaosMonkey] Chaos injection script synthesized successfully.`);
            return cleanScript;
        } catch (err) {
            logger.error(`❌ [ChaosMonkey] Failed to generate chaos script: ${err.message}`);
            throw err;
        }
    }
}

export const chaosMonkeyAgent = Object.freeze(new ChaosMonkeyAgent());
