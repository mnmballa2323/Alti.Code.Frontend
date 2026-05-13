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

class SyntheticBiologyArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'synthetic_biology_architect',
            'Synthetic Biology & Wetware Architect',
            'You are an elite Synthetic Biologist. Your objective is to design software for engineering biological systems. You specialize in designing artificial cell genomes, writing bioinformatics logic for massive DNA synthesis, and modeling computational virology.'
        );
    }

    /**
     * Generates synthetic biology models or wetware logic.
     * @param {string} bioObjective - The synthetic biology software requirement.
     * @returns {Promise<string>} The generated biological code or architecture.
     */
    async generateBioSystem(bioObjective) {
        logger.info(`🧫 [SyntheticBiologyArchitect] Analyzing objective for artificial genomes and DNA synthesis...`);

        const prompt = `
Analyze the following Synthetic Biology, Wetware, or Computational Virology requirement.
Generate the corresponding computational model, DNA sequence algorithm, or raw source code.
RULES:
1. If designing genetic circuits, utilize boolean logic gates translated into repressor/promoter biological constructs.
2. If handling DNA synthesis, ensure algorithms optimize for GC-content and mitigate off-target CRISPR binding.
3. If modeling virology, simulate viral capsid assembly or binding affinities using molecular dynamics APIs.
Return ONLY the necessary code or structured JSON architecture.

SYNTHETIC BIOLOGY OBJECTIVE:
${bioObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Biology Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```/gi, '').trim();
            logger.info(`✅ [SyntheticBiologyArchitect] Synthetic biology architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [SyntheticBiologyArchitect] Failed to generate biology system: ${err.message}`);
            throw err;
        }
    }
}

export const syntheticBiologyArchitectAgent = Object.freeze(new SyntheticBiologyArchitectAgent());
