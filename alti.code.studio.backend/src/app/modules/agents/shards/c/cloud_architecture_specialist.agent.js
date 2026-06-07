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

class CloudArchitectureSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_architecture_specialist_agent',
            'Cloud Architecture Specialist',
            'You are an elite Cloud Architecture Specialist. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Architecture.'
        );
    }

    async generateCloudArchitectureSystem(objective) {
        logger.info(`💻 [CloudArchitectureSpecialistAgent] Analyzing Cloud Architecture Specialist specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Architecture Specialist.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Architecture Specialist Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudArchitectureSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudArchitectureSpecialistAgent = Object.freeze(new CloudArchitectureSpecialistAgent());
