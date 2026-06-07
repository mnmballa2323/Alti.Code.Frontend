/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class COBOLSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cobol_specialist',
            'COBOL Specialist',
            'You are an elite COBOL Specialist. You specialize in: Mainframe banking systems and legacy financial transactions.'
        );
    }

    async generateCOBOLSystem(objective) {
        logger.info(`💻 [COBOLSpecialistAgent] Analyzing COBOL requirements...`);
        const prompt = `Analyze the COBOL requirement: ${objective}. Output valid COBOL code.`;
        try {
            const output = await this._invoke(prompt, "N/A - COBOL Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [COBOLSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const COBOLSpecialistAgentInstance = new COBOLSpecialistAgent();
