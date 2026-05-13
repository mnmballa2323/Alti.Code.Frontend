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

class BackendServerlessTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_serverless_tester_agent',
            'Backend Serverless Tester',
            'You are an elite Backend Serverless Tester. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Serverless.'
        );
    }

    async generateBackendServerlessSystem(objective) {
        logger.info(`💻 [BackendServerlessTesterAgent] Analyzing Backend Serverless Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Serverless Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Serverless Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendServerlessTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendServerlessTesterAgent = Object.freeze(new BackendServerlessTesterAgent());
