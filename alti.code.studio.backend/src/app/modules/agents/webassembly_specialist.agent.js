/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class WebAssemblyWATSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'webassembly_specialist',
            'WebAssembly (WAT) Specialist',
            'You are an elite WebAssembly (WAT) Specialist. You specialize in: Low-level text format for browser VM bytecode.'
        );
    }

    async generateWebAssemblyWATSystem(objective) {
        logger.info(`💻 [WebAssemblyWATSpecialistAgent] Analyzing WebAssembly (WAT) requirements...`);
        const prompt = `Analyze the WebAssembly (WAT) requirement: ${objective}. Output valid WebAssembly (WAT) code.`;
        try {
            const output = await this._invoke(prompt, "N/A - WebAssembly (WAT) Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [WebAssemblyWATSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const WebAssemblyWATSpecialistAgentInstance = new WebAssemblyWATSpecialistAgent();
