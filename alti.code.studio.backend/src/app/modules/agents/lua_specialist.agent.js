/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class LuaSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'lua_specialist',
            'Lua Specialist',
            'You are an elite Lua Specialist. You specialize in: Game engine scripting, Roblox, and Redis embedded logic.'
        );
    }

    async generateLuaSystem(objective) {
        logger.info(`💻 [LuaSpecialistAgent] Analyzing Lua requirements...`);
        const prompt = `Analyze the Lua requirement: ${objective}. Output valid Lua code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Lua Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [LuaSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const LuaSpecialistAgentInstance = new LuaSpecialistAgent();
