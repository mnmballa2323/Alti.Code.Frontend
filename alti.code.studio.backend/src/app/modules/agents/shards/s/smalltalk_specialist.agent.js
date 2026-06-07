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

class SmalltalkSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'smalltalk_specialist',
            'Smalltalk Specialist',
            'You are an elite Smalltalk Specialist. You specialize in: Pure object-oriented programming and live coding environments.'
        );
    }

    async generateSmalltalkSystem(objective) {
        logger.info(`💻 [SmalltalkSpecialistAgent] Analyzing Smalltalk requirements...`);
        const prompt = `Analyze the Smalltalk requirement: ${objective}. Output valid Smalltalk code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Smalltalk Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SmalltalkSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const SmalltalkSpecialistAgentInstance = Object.freeze(new SmalltalkSpecialistAgent());
