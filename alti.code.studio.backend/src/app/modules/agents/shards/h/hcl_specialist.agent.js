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

class HCLSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'hcl_specialist',
            'HCL Specialist',
            'You are an elite HCL Specialist. You specialize in: HashiCorp Configuration Language for Terraform state.'
        );
    }

    async generateHCLSystem(objective) {
        logger.info(`💻 [HCLSpecialistAgent] Analyzing HCL requirements...`);
        const prompt = `Analyze the HCL requirement: ${objective}. Output valid HCL code.`;
        try {
            const output = await this._invoke(prompt, "N/A - HCL Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [HCLSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const HCLSpecialistAgentInstance = Object.freeze(new HCLSpecialistAgent());
