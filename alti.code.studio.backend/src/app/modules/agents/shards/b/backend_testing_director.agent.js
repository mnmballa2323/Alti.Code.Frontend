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

class BackendTestingDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_testing_director_agent',
            'Backend Testing Director',
            'You are an elite Backend Testing Director. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Testing.'
        );
    }

    async generateBackendTestingSystem(objective) {
        logger.info(`💻 [BackendTestingDirectorAgent] Analyzing Backend Testing Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Testing Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Testing Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendTestingDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendTestingDirectorAgent = Object.freeze(new BackendTestingDirectorAgent());
