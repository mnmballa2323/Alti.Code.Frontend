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

class PuppetSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'puppet_specialist',
            'Puppet Specialist',
            'You are an elite Puppet Specialist. You specialize in: Declarative IT infrastructure automation.'
        );
    }

    async generatePuppetSystem(objective) {
        logger.info(`💻 [PuppetSpecialistAgent] Analyzing Puppet requirements...`);
        const prompt = `Analyze the Puppet requirement: ${objective}. Output valid Puppet code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Puppet Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [PuppetSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const PuppetSpecialistAgentInstance = Object.freeze(new PuppetSpecialistAgent());
