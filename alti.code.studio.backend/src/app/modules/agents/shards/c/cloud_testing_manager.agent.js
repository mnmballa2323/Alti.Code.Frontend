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

class CloudTestingManagerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_testing_manager_agent',
            'Cloud Testing Manager',
            'You are an elite Cloud Testing Manager. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Testing.'
        );
    }

    async generateCloudTestingSystem(objective) {
        logger.info(`💻 [CloudTestingManagerAgent] Analyzing Cloud Testing Manager specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Testing Manager.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Testing Manager Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudTestingManagerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudTestingManagerAgent = Object.freeze(new CloudTestingManagerAgent());
