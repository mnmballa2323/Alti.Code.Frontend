/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class MUMPSSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'mumps_specialist',
            'MUMPS Specialist',
            'You are an elite MUMPS Specialist. You specialize in: Legacy healthcare database systems (Epic).'
        );
    }

    async generateMUMPSSystem(objective) {
        logger.info(`💻 [MUMPSSpecialistAgent] Analyzing MUMPS requirements...`);
        const prompt = `Analyze the MUMPS requirement: ${objective}. Output valid MUMPS code.`;
        try {
            const output = await this._invoke(prompt, "N/A - MUMPS Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [MUMPSSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const MUMPSSpecialistAgentInstance = new MUMPSSpecialistAgent();
