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

class UITestingStrategistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ui_testing_strategist_agent',
            'UI Testing Strategist',
            'You are an elite UI Testing Strategist. You specialize in bleeding-edge software development, cloud infrastructure, and UI Testing.'
        );
    }

    async generateUITestingSystem(objective) {
        logger.info(`💻 [UITestingStrategistAgent] Analyzing UI Testing Strategist specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UI Testing Strategist.`;
        try {
            const output = await this._invoke(prompt, "N/A - UI Testing Strategist Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [UITestingStrategistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const uITestingStrategistAgent = Object.freeze(new UITestingStrategistAgent());
