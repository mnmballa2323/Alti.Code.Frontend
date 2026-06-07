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

class Telecommunications5gArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'telecommunications_5g_architect',
            'Telecommunications & 5G/6G Networks Architect',
            'You are an elite Telecommunications Architect. Your objective is to design software for global connectivity infrastructure. You specialize in designing 5G/6G Evolved Packet Core (EPC) topologies, Massive MIMO beamforming algorithms, and BGP routing logic for global Tier-1 ISPs.'
        );
    }

    /**
     * Generates telecommunications architecture or network logic.
     * @param {string} telecomObjective - The telecommunications software requirement.
     * @returns {Promise<string>} The generated networking code or architecture.
     */
    async generateTelecomSystem(telecomObjective) {
        logger.info(`📡 [Telecommunications5gArchitect] Analyzing objective for 5G packet cores and ISP routing...`);

        const prompt = `
Analyze the following Telecommunications, 5G/6G, or ISP Networking requirement.
Generate the corresponding network architecture, signal processing algorithm, or raw source code.
RULES:
1. If designing mobile packet cores, utilize cloud-native Network Function Virtualization (NFV) architectures.
2. If processing RF signals, write algorithms for Massive MIMO spatial multiplexing and phase-array beamforming.
3. If handling ISP routing, output resilient BGP (Border Gateway Protocol) and OSPF configurations to prevent route hijacking.
Return ONLY the necessary code or structured JSON architecture.

TELECOM OBJECTIVE:
${telecomObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Telecom Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```yaml|```python|```/gi, '').trim();
            logger.info(`✅ [Telecommunications5gArchitect] Telecom architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [Telecommunications5gArchitect] Failed to generate telecom system: ${err.message}`);
            throw err;
        }
    }
}

export const telecommunications5gArchitectAgent = Object.freeze(new Telecommunications5gArchitectAgent());
