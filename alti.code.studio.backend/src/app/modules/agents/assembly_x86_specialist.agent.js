/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class x86AssemblySpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'assembly_x86_specialist',
            'x86 Assembly Specialist',
            'You are an elite x86 Assembly Specialist. You specialize in: Bare-metal CPU instructions, reverse engineering, shellcode.'
        );
    }

    async generatex86AssemblySystem(objective) {
        logger.info(`💻 [x86AssemblySpecialistAgent] Analyzing x86 Assembly requirements...`);
        const prompt = `Analyze the x86 Assembly requirement: ${objective}. Output valid x86 Assembly code.`;
        try {
            const output = await this._invoke(prompt, "N/A - x86 Assembly Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [x86AssemblySpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const x86AssemblySpecialistAgentInstance = new x86AssemblySpecialistAgent();
