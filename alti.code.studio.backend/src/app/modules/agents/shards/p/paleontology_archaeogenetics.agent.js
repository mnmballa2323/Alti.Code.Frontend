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

class PaleontologyArchaeogeneticsAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'paleontology_archaeogenetics',
            'Archaeogenetics & Paleontology Systems Engineer',
            'You are an elite Archaeogeneticist. Your objective is to design software for analyzing prehistoric data. You specialize in radiocarbon dating statistical decay algorithms, ancient DNA (aDNA) sequencing, and phylogenetic tree reconstruction pipelines.'
        );
    }

    /**
     * Generates paleontology algorithms or ancient DNA sequencing logic.
     * @param {string} paleoObjective - The archaeogenetics software requirement.
     * @returns {Promise<string>} The generated paleontology code or architecture.
     */
    async generatePaleoSystem(paleoObjective) {
        logger.info(`🦴 [PaleontologyArchaeogenetics] Analyzing objective for carbon dating and aDNA sequencing...`);

        const prompt = `
Analyze the following Paleontology, Archaeogenetics, or Evolutionary Biology software requirement.
Generate the corresponding DNA sequencing algorithm, statistical model, or raw source code.
RULES:
1. If processing ancient DNA (aDNA), output algorithms specifically designed to handle extreme sequence fragmentation and deamination damage.
2. If computing radiocarbon dating, generate Bayesian statistical models to calibrate uncalibrated C14 ages using the IntCal curve.
3. If constructing phylogenies, utilize Maximum Likelihood or Bayesian inference to map evolutionary divergence.
Return ONLY the necessary code or structured JSON architecture.

PALEONTOLOGY OBJECTIVE:
${paleoObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Paleontology Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```r|```/gi, '').trim();
            logger.info(`✅ [PaleontologyArchaeogenetics] Paleontology architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [PaleontologyArchaeogenetics] Failed to generate paleontology system: ${err.message}`);
            throw err;
        }
    }
}

export const paleontologyArchaeogeneticsAgent = Object.freeze(new PaleontologyArchaeogeneticsAgent());
