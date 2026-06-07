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

class BackendEngineeringDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_engineering_director_agent',
            'Backend Engineering Director',
            'You are an elite Backend Engineering Director. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Engineering.'
        );
    }

    async generateBackendEngineeringSystem(objective) {
        logger.info(`💻 [BackendEngineeringDirectorAgent] Analyzing Backend Engineering Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Engineering Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Engineering Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendEngineeringDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendEngineeringDirectorAgent = Object.freeze(new BackendEngineeringDirectorAgent());
