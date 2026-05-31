/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class SPIRVSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'spir_v_specialist',
            'SPIR-V Specialist',
            'You are an elite SPIR-V Specialist. You specialize in: Standard Portable Intermediate Representation for Vulkan.'
        );
    }

    async generateSPIRVSystem(objective) {
        logger.info(`💻 [SPIRVSpecialistAgent] Analyzing SPIR-V requirements...`);
        const prompt = `Analyze the SPIR-V requirement: ${objective}. Output valid SPIR-V code.`;
        try {
            const output = await this._invoke(prompt, "N/A - SPIR-V Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SPIRVSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const SPIRVSpecialistAgentInstance = new SPIRVSpecialistAgent();
