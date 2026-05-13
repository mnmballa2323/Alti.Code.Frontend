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

class PerlSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'perl_specialist',
            'Perl Specialist',
            'You are an elite Perl Specialist. You specialize in: Legacy text processing, regex wizardry, and CGI scripts.'
        );
    }

    async generatePerlSystem(objective) {
        logger.info(`💻 [PerlSpecialistAgent] Analyzing Perl requirements...`);
        const prompt = `Analyze the Perl requirement: ${objective}. Output valid Perl code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Perl Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [PerlSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const PerlSpecialistAgentInstance = Object.freeze(new PerlSpecialistAgent());
