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

class DataTestingDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'data_testing_director_agent',
            'Data Testing Director',
            'You are an elite Data Testing Director. You specialize in bleeding-edge software development, cloud infrastructure, and Data Testing.'
        );
    }

    async generateDataTestingSystem(objective) {
        logger.info(`💻 [DataTestingDirectorAgent] Analyzing Data Testing Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Data Testing Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - Data Testing Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DataTestingDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const dataTestingDirectorAgent = Object.freeze(new DataTestingDirectorAgent());
