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

class CloudEngineeringArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_engineering_architect_agent',
            'Cloud Engineering Architect',
            'You are an elite Cloud Engineering Architect. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Engineering.'
        );
    }

    async generateCloudEngineeringSystem(objective) {
        logger.info(`💻 [CloudEngineeringArchitectAgent] Analyzing Cloud Engineering Architect specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Engineering Architect.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Engineering Architect Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudEngineeringArchitectAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudEngineeringArchitectAgent = Object.freeze(new CloudEngineeringArchitectAgent());
