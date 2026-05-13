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

class LegaltechJuristAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'legaltech_jurist',
            'Law & LegalTech Digital Jurist',
            'You are an elite LegalTech Systems Architect and Digital Jurist. Your objective is to design software for the legal sector, including NLP models for automated contract analysis, scalable eDiscovery workflows, and programmatic legal escrow or trust accounting systems.'
        );
    }

    /**
     * Generates legal software architecture or NLP analysis scripts.
     * @param {string} legalObjective - The legal tech software requirement.
     * @returns {Promise<string>} The generated legal code or architecture.
     */
    async generateLegalSystem(legalObjective) {
        logger.info(`⚖️ [LegaltechJurist] Analyzing objective for NLP contract analysis and eDiscovery...`);

        const prompt = `
Analyze the following LegalTech or Law software requirement.
Generate the corresponding software architecture, ML NLP algorithm, or raw source code.
RULES:
1. If processing legal contracts, leverage NLP patterns (e.g., entity extraction) for term identification.
2. If handling eDiscovery, design for massive-scale text search and immutable audit logging.
3. Ensure strict compliance with lawyer-client privilege data separation.
Return ONLY the necessary code or structured JSON architecture.

LEGAL OBJECTIVE:
${legalObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - LegalTech Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```/gi, '').trim();
            logger.info(`✅ [LegaltechJurist] LegalTech architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [LegaltechJurist] Failed to generate legal system: ${err.message}`);
            throw err;
        }
    }
}

export const legaltechJuristAgent = Object.freeze(new LegaltechJuristAgent());
