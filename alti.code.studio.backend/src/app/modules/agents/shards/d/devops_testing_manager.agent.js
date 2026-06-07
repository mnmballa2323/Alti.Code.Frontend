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

class DevOpsTestingManagerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'devops_testing_manager_agent',
            'DevOps Testing Manager',
            'You are an elite DevOps Testing Manager. You specialize in bleeding-edge software development, cloud infrastructure, and DevOps Testing.'
        );
    }

    async generateDevOpsTestingSystem(objective) {
        logger.info(`💻 [DevOpsTestingManagerAgent] Analyzing DevOps Testing Manager specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevOps Testing Manager.`;
        try {
            const output = await this._invoke(prompt, "N/A - DevOps Testing Manager Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DevOpsTestingManagerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const devOpsTestingManagerAgent = Object.freeze(new DevOpsTestingManagerAgent());
