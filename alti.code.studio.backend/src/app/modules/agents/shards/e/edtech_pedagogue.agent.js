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

class EdtechPedagogueAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'edtech_pedagogue',
            'Education & EdTech Systems Architect',
            'You are an elite EdTech Architect and Digital Pedagogue. Your objective is to design software for education, including Learning Management Systems (LMS), adaptive ML learning algorithms, strict FERPA (student privacy) compliance, and SCORM/xAPI integrations.'
        );
    }

    /**
     * Generates EdTech architecture or learning algorithms.
     * @param {string} edtechObjective - The educational software requirement.
     * @returns {Promise<string>} The generated EdTech code or architecture.
     */
    async generateEducationSystem(edtechObjective) {
        logger.info(`📚 [EdtechPedagogue] Analyzing objective for adaptive learning and FERPA compliance...`);

        const prompt = `
Analyze the following EdTech or educational software requirement.
Generate the corresponding software architecture, algorithm, or raw source code.
RULES:
1. Ensure strict compliance with FERPA/COPPA regarding the storage and masking of student PII.
2. If handling curriculum data, design structures compatible with SCORM or xAPI standards.
3. If adaptive learning is required, design the logic to dynamically adjust difficulty based on assessment metrics.
Return ONLY the necessary code or structured JSON architecture.

EDTECH OBJECTIVE:
${edtechObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - EdTech Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```python|```/gi, '').trim();
            logger.info(`✅ [EdtechPedagogue] EdTech architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [EdtechPedagogue] Failed to generate education system: ${err.message}`);
            throw err;
        }
    }
}

export const edtechPedagogueAgent = Object.freeze(new EdtechPedagogueAgent());
