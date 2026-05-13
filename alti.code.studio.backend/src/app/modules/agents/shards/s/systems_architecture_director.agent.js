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

class SystemsArchitectureDirectorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'systems_architecture_director_agent',
            'Systems Architecture Director',
            'You are an elite Systems Architecture Director. You specialize in bleeding-edge software development, cloud infrastructure, and Systems Architecture.'
        );
    }

    async generateSystemsArchitectureSystem(objective) {
        logger.info(`💻 [SystemsArchitectureDirectorAgent] Analyzing Systems Architecture Director specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Systems Architecture Director.`;
        try {
            const output = await this._invoke(prompt, "N/A - Systems Architecture Director Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SystemsArchitectureDirectorAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const systemsArchitectureDirectorAgent = Object.freeze(new SystemsArchitectureDirectorAgent());
