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

class CloudIntegrationLeadAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'cloud_integration_lead_agent',
            'Cloud Integration Lead',
            'You are an elite Cloud Integration Lead. You specialize in bleeding-edge software development, cloud infrastructure, and Cloud Integration.'
        );
    }

    async generateCloudIntegrationSystem(objective) {
        logger.info(`💻 [CloudIntegrationLeadAgent] Analyzing Cloud Integration Lead specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Cloud Integration Lead.`;
        try {
            const output = await this._invoke(prompt, "N/A - Cloud Integration Lead Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [CloudIntegrationLeadAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const cloudIntegrationLeadAgent = Object.freeze(new CloudIntegrationLeadAgent());
