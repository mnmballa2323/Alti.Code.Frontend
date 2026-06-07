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

class UIMicroservicesPlannerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'ui_microservices_planner_agent',
            'UI Microservices Planner',
            'You are an elite UI Microservices Planner. You specialize in bleeding-edge software development, cloud infrastructure, and UI Microservices.'
        );
    }

    async generateUIMicroservicesSystem(objective) {
        logger.info(`💻 [UIMicroservicesPlannerAgent] Analyzing UI Microservices Planner specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for UI Microservices Planner.`;
        try {
            const output = await this._invoke(prompt, "N/A - UI Microservices Planner Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [UIMicroservicesPlannerAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const uIMicroservicesPlannerAgent = Object.freeze(new UIMicroservicesPlannerAgent());
