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

class BackendTestingManagerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_testing_manager_agent',
            'Backend Testing Manager',
            'You are an elite Backend Testing Manager. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Testing.'
        );
    }

    async generateBackendTestingSystem(objective) {
        logger.info(`💻 [BackendTestingManagerAgent] Analyzing Backend Testing Manager specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Testing Manager.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Testing Manager Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendTestingManagerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendTestingManagerAgent = Object.freeze(new BackendTestingManagerAgent());
