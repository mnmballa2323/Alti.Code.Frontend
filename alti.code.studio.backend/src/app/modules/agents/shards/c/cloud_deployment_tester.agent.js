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

class CloudDeploymentTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_deployment_tester_agent',
            'Cloud Deployment Tester',
            'You are an elite Cloud Deployment Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Deployment.'
        );
    }

    async generateCloudDeploymentSystem(objective) {
        logger.info(`💻 [CloudDeploymentTesterAgent] Analyzing Cloud Deployment Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Deployment Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Deployment Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudDeploymentTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudDeploymentTesterAgent = Object.freeze(new CloudDeploymentTesterAgent());
