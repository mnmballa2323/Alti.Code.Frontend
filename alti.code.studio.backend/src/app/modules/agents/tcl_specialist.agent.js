/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class TclSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'tcl_specialist',
            'Tcl Specialist',
            'You are an elite Tcl Specialist. You specialize in: Rapid prototyping, scripted applications, and Tk GUI toolkits.'
        );
    }

    async generateTclSystem(objective) {
        logger.info(`💻 [TclSpecialistAgent] Analyzing Tcl requirements...`);
        const prompt = `Analyze the Tcl requirement: ${objective}. Output valid Tcl code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Tcl Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [TclSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const TclSpecialistAgentInstance = new TclSpecialistAgent();
