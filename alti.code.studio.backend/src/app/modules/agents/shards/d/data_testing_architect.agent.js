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

class DataTestingArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'data_testing_architect_agent',
            'Data Testing Architect',
            'You are an elite Data Testing Architect. You specialize in bleeding-edge software development, cloud infrastructure, and Data Testing.'
        );
    }

    async generateDataTestingSystem(objective) {
        logger.info(`💻 [DataTestingArchitectAgent] Analyzing Data Testing Architect specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Data Testing Architect.`;
        try {
            const output = await this._invoke(prompt, "N/A - Data Testing Architect Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DataTestingArchitectAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const dataTestingArchitectAgent = Object.freeze(new DataTestingArchitectAgent());
