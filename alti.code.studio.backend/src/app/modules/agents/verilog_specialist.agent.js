/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class VerilogSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'verilog_specialist',
            'Verilog Specialist',
            'You are an elite Verilog Specialist. You specialize in: Digital circuit design, ASIC verification, and logic gates.'
        );
    }

    async generateVerilogSystem(objective) {
        logger.info(`💻 [VerilogSpecialistAgent] Analyzing Verilog requirements...`);
        const prompt = `Analyze the Verilog requirement: ${objective}. Output valid Verilog code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Verilog Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [VerilogSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const VerilogSpecialistAgentInstance = new VerilogSpecialistAgent();
