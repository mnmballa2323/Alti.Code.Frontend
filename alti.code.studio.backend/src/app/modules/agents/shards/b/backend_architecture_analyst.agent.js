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

class BackendArchitectureAnalystAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'backend_architecture_analyst_agent',
            'Backend Architecture Analyst',
            'You are an elite Backend Architecture Analyst. You specialize in bleeding-edge software development, cloud infrastructure, and Backend Architecture.'
        );
    }

    async generateBackendArchitectureSystem(objective) {
        logger.info(`💻 [BackendArchitectureAnalystAgent] Analyzing Backend Architecture Analyst specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Backend Architecture Analyst.`;
        try {
            const output = await this._invoke(prompt, "N/A - Backend Architecture Analyst Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [BackendArchitectureAnalystAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const backendArchitectureAnalystAgent = Object.freeze(new BackendArchitectureAnalystAgent());
