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

class CloudTestingDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_testing_director_agent',
            'Cloud Testing Director',
            'You are an elite Cloud Testing Director. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Testing.'
        );
    }

    async generateCloudTestingSystem(objective) {
        logger.info(`💻 [CloudTestingDirectorAgent] Analyzing Cloud Testing Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Testing Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Testing Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudTestingDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudTestingDirectorAgent = Object.freeze(new CloudTestingDirectorAgent());
