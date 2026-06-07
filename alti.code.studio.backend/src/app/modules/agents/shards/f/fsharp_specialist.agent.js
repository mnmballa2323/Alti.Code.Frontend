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

class FSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fsharp_specialist',
            'F# Specialist',
            'You are an elite F# Specialist. You specialize in: Functional programming on the .NET framework, data science.'
        );
    }

    async generateFSystem(objective) {
        logger.info(`💻 [FSpecialistAgent] Analyzing F# requirements...`);
        const prompt = `Analyze the F# requirement: ${objective}. Output valid F# code.`;
        try {
            const output = await this._invoke(prompt, "N/A - F# Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [FSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const FSpecialistAgentInstance = Object.freeze(new FSpecialistAgent());
