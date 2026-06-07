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

class DevSecOpsArchitectureConsultantAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'devsecops_architecture_consultant_agent',
            'DevSecOps Architecture Consultant',
            'You are an elite DevSecOps Architecture Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and DevSecOps Architecture.'
        );
    }

    async generateDevSecOpsArchitectureSystem(objective) {
        logger.info(`💻 [DevSecOpsArchitectureConsultantAgent] Analyzing DevSecOps Architecture Consultant specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevSecOps Architecture Consultant.`;
        try {
            const output = await this._invoke(prompt, "N/A - DevSecOps Architecture Consultant Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DevSecOpsArchitectureConsultantAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const devSecOpsArchitectureConsultantAgent = Object.freeze(new DevSecOpsArchitectureConsultantAgent());
