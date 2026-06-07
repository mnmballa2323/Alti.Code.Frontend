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

class VHDLSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'vhdl_specialist',
            'VHDL Specialist',
            'You are an elite VHDL Specialist. You specialize in: FPGA programming, hardware description, and logic synthesis.'
        );
    }

    async generateVHDLSystem(objective) {
        logger.info(`💻 [VHDLSpecialistAgent] Analyzing VHDL requirements...`);
        const prompt = `Analyze the VHDL requirement: ${objective}. Output valid VHDL code.`;
        try {
            const output = await this._invoke(prompt, "N/A - VHDL Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [VHDLSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const VHDLSpecialistAgentInstance = Object.freeze(new VHDLSpecialistAgent());
