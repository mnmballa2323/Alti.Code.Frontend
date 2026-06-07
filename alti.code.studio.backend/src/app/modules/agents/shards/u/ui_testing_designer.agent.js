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

class UITestingDesignerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ui_testing_designer_agent',
            'UI Testing Designer',
            'You are an elite UI Testing Designer. You specialize in bleeding-edge software development, cloud infrastructure, and UI Testing.'
        );
    }

    async generateUITestingSystem(objective) {
        logger.info(`💻 [UITestingDesignerAgent] Analyzing UI Testing Designer specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UI Testing Designer.`;
        try {
            const output = await this._invoke(prompt, "N/A - UI Testing Designer Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [UITestingDesignerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const uITestingDesignerAgent = Object.freeze(new UITestingDesignerAgent());
