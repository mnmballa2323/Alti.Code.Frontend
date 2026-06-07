/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class HLSLSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'hlsl_specialist',
            'HLSL Specialist',
            'You are an elite HLSL Specialist. You specialize in: DirectX High-Level Shading Language for Windows gaming.'
        );
    }

    async generateHLSLSystem(objective) {
        logger.info(`💻 [HLSLSpecialistAgent] Analyzing HLSL requirements...`);
        const prompt = `Analyze the HLSL requirement: ${objective}. Output valid HLSL code.`;
        try {
            const output = await this._invoke(prompt, "N/A - HLSL Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [HLSLSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const HLSLSpecialistAgentInstance = new HLSLSpecialistAgent();
