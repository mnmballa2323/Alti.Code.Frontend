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

class CloudDeploymentConsultantAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_deployment_consultant_agent',
            'Cloud Deployment Consultant',
            'You are an elite Cloud Deployment Consultant. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Deployment.'
        );
    }

    async generateCloudDeploymentSystem(objective) {
        logger.info(`💻 [CloudDeploymentConsultantAgent] Analyzing Cloud Deployment Consultant specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Deployment Consultant.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Deployment Consultant Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudDeploymentConsultantAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudDeploymentConsultantAgent = Object.freeze(new CloudDeploymentConsultantAgent());
