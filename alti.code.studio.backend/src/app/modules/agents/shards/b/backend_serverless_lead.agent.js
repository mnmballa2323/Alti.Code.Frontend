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

class BackendServerlessLeadAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_serverless_lead_agent',
            'Backend Serverless Lead',
            'You are an elite Backend Serverless Lead. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Serverless.'
        );
    }

    async generateBackendServerlessSystem(objective) {
        logger.info(`💻 [BackendServerlessLeadAgent] Analyzing Backend Serverless Lead specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Serverless Lead.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Serverless Lead Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendServerlessLeadAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendServerlessLeadAgent = Object.freeze(new BackendServerlessLeadAgent());
