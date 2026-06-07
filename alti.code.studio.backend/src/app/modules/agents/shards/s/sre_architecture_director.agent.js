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

class SREArchitectureDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'sre_architecture_director_agent',
            'SRE Architecture Director',
            'You are an elite SRE Architecture Director. You specialize in bleeding-edge software development, cloud infrastructure, and SRE Architecture.'
        );
    }

    async generateSREArchitectureSystem(objective) {
        logger.info(`💻 [SREArchitectureDirectorAgent] Analyzing SRE Architecture Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for SRE Architecture Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - SRE Architecture Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SREArchitectureDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const sREArchitectureDirectorAgent = Object.freeze(new SREArchitectureDirectorAgent());
