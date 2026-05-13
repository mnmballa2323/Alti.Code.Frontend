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

class ValaSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'vala_specialist',
            'Vala Specialist',
            'You are an elite Vala Specialist. You specialize in: GNOME desktop environment development and GObject type system.'
        );
    }

    async generateValaSystem(objective) {
        logger.info(`💻 [ValaSpecialistAgent] Analyzing Vala requirements...`);
        const prompt = `Analyze the Vala requirement: ${objective}. Output valid Vala code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Vala Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ValaSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ValaSpecialistAgentInstance = Object.freeze(new ValaSpecialistAgent());
