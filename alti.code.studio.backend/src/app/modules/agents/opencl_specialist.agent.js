/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class OpenCLSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'opencl_specialist',
            'OpenCL Specialist',
            'You are an elite OpenCL Specialist. You specialize in: Cross-platform heterogeneous computing on CPUs and GPUs.'
        );
    }

    async generateOpenCLSystem(objective) {
        logger.info(`💻 [OpenCLSpecialistAgent] Analyzing OpenCL requirements...`);
        const prompt = `Analyze the OpenCL requirement: ${objective}. Output valid OpenCL code.`;
        try {
            const output = await this._invoke(prompt, "N/A - OpenCL Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [OpenCLSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const OpenCLSpecialistAgentInstance = new OpenCLSpecialistAgent();
