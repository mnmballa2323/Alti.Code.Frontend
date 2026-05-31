/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class ObjectiveCSpecialistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'objective_c_specialist',
            'Objective-C Specialist',
            'You are an elite Objective-C Specialist. You specialize in: Legacy iOS/macOS frameworks and Apple runtime bridges.'
        );
    }

    async generateObjectiveCSystem(objective) {
        logger.info(`💻 [ObjectiveCSpecialistAgent] Analyzing Objective-C requirements...`);
        const prompt = `Analyze the Objective-C requirement: ${objective}. Output valid Objective-C code.`;
        try {
            const output = await this._invoke(prompt, "N/A - Objective-C Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [ObjectiveCSpecialistAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const ObjectiveCSpecialistAgentInstance = new ObjectiveCSpecialistAgent();
