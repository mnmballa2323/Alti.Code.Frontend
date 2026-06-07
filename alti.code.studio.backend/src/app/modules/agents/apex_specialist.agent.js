/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class ApexSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'apex_specialist',
            'Apex Specialist',
            'You are an elite Apex Specialist. You specialize in: Salesforce CRM backend triggers and enterprise cloud logic.'
        );
    }

    async generateApexSystem(objective) {
        logger.info(`💻 [ApexSpecialistAgent] Analyzing Apex requirements...`);
        const prompt = `Analyze the Apex requirement: ${objective}. Output valid Apex code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Apex Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ApexSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ApexSpecialistAgentInstance = new ApexSpecialistAgent();
