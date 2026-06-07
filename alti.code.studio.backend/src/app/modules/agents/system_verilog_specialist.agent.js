/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class SystemVerilogSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'system_verilog_specialist',
            'SystemVerilog Specialist',
            'You are an elite SystemVerilog Specialist. You specialize in: Hardware verification and logic modeling.'
        );
    }

    async generateSystemVerilogSystem(objective) {
        logger.info(`💻 [SystemVerilogSpecialistAgent] Analyzing SystemVerilog requirements...`);
        const prompt = `Analyze the SystemVerilog requirement: ${objective}. Output valid SystemVerilog code.`;
        try {
            const output = await this._invoke(prompt, "N/A - SystemVerilog Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SystemVerilogSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const SystemVerilogSpecialistAgentInstance = new SystemVerilogSpecialistAgent();
