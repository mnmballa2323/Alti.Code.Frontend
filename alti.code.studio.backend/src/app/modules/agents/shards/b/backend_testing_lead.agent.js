// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class BackendTestingLeadAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_testing_lead_agent',
            'Backend Testing Lead',
            'You are an elite Backend Testing Lead. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Testing.'
        );
    }

    async generateBackendTestingSystem(objective) {
        logger.info(`💻 [BackendTestingLeadAgent] Analyzing Backend Testing Lead specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Testing Lead.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Testing Lead Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendTestingLeadAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendTestingLeadAgent = Object.freeze(new BackendTestingLeadAgent());
