/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class ABAPSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'abap_specialist',
            'ABAP Specialist',
            'You are an elite ABAP Specialist. You specialize in: SAP ERP business logic, internal tables, and reporting.'
        );
    }

    async generateABAPSystem(objective) {
        logger.info(`💻 [ABAPSpecialistAgent] Analyzing ABAP requirements...`);
        const prompt = `Analyze the ABAP requirement: ${objective}. Output valid ABAP code.`;
        try {
            const output = await this._invoke(prompt, "N/A - ABAP Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ABAPSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ABAPSpecialistAgentInstance = new ABAPSpecialistAgent();
