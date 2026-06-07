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

class UIServerlessTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ui_serverless_tester_agent',
            'UI Serverless Tester',
            'You are an elite UI Serverless Tester. You specialize in bleeding-edge software development, cloud infrastructure, and UI Serverless.'
        );
    }

    async generateUIServerlessSystem(objective) {
        logger.info(`💻 [UIServerlessTesterAgent] Analyzing UI Serverless Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UI Serverless Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - UI Serverless Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [UIServerlessTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const uIServerlessTesterAgent = Object.freeze(new UIServerlessTesterAgent());
