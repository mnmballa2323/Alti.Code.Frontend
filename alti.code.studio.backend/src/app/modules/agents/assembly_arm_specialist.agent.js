/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class ARMAssemblySpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'assembly_arm_specialist',
            'ARM Assembly Specialist',
            'You are an elite ARM Assembly Specialist. You specialize in: Embedded systems, Raspberry Pi, and mobile CPU instructions.'
        );
    }

    async generateARMAssemblySystem(objective) {
        logger.info(`💻 [ARMAssemblySpecialistAgent] Analyzing ARM Assembly requirements...`);
        const prompt = `Analyze the ARM Assembly requirement: ${objective}. Output valid ARM Assembly code.`;
        try {
            const output = await this._invoke(prompt, "N/A - ARM Assembly Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ARMAssemblySpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ARMAssemblySpecialistAgentInstance = new ARMAssemblySpecialistAgent();
