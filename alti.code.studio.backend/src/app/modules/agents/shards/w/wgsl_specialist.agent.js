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

class WGSLSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'wgsl_specialist',
            'WGSL Specialist',
            'You are an elite WGSL Specialist. You specialize in: WebGPU Shading Language for next-gen browser graphics.'
        );
    }

    async generateWGSLSystem(objective) {
        logger.info(`💻 [WGSLSpecialistAgent] Analyzing WGSL requirements...`);
        const prompt = `Analyze the WGSL requirement: ${objective}. Output valid WGSL code.`;
        try {
            const output = await this._invoke(prompt, "N/A - WGSL Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [WGSLSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const WGSLSpecialistAgentInstance = Object.freeze(new WGSLSpecialistAgent());
