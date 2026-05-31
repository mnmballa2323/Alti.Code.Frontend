/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class StarlarkSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'starlark_specialist',
            'Starlark Specialist',
            'You are an elite Starlark Specialist. You specialize in: Bazel build system configuration language.'
        );
    }

    async generateStarlarkSystem(objective) {
        logger.info(`💻 [StarlarkSpecialistAgent] Analyzing Starlark requirements...`);
        const prompt = `Analyze the Starlark requirement: ${objective}. Output valid Starlark code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Starlark Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [StarlarkSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const StarlarkSpecialistAgentInstance = new StarlarkSpecialistAgent();
