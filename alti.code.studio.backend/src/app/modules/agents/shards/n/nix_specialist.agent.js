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

class NixSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'nix_specialist',
            'Nix Specialist',
            'You are an elite Nix Specialist. You specialize in: Purely functional package management and reproducible builds.'
        );
    }

    async generateNixSystem(objective) {
        logger.info(`💻 [NixSpecialistAgent] Analyzing Nix requirements...`);
        const prompt = `Analyze the Nix requirement: ${objective}. Output valid Nix code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Nix Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [NixSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const NixSpecialistAgentInstance = Object.freeze(new NixSpecialistAgent());
