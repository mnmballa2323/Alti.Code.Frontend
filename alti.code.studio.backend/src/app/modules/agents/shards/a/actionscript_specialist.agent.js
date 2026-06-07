// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class ActionScriptSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'actionscript_specialist',
            'ActionScript Specialist',
            'You are an elite ActionScript Specialist. You specialize in: Legacy Adobe Flash animations and interactive web media.'
        );
    }

    async generateActionScriptSystem(objective) {
        logger.info(`💻 [ActionScriptSpecialistAgent] Analyzing ActionScript requirements...`);
        const prompt = `Analyze the ActionScript requirement: ${objective}. Output valid ActionScript code.`;
        try {
            const output = await this._invoke(prompt, "N/A - ActionScript Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ActionScriptSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ActionScriptSpecialistAgentInstance = Object.freeze(new ActionScriptSpecialistAgent());
