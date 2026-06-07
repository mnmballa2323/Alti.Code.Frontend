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

class SecurityTestingArchitectAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'security_testing_architect_agent',
            'Security Testing Architect',
            'You are an elite Security Testing Architect. You specialize in bleeding-edge software development, cloud infrastructure, and Security Testing.'
        );
    }

    async generateSecurityTestingSystem(objective) {
        logger.info(`💻 [SecurityTestingArchitectAgent] Analyzing Security Testing Architect specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for Security Testing Architect.`;
        try {
            const output = await this._invoke(prompt, "N/A - Security Testing Architect Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [SecurityTestingArchitectAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const securityTestingArchitectAgent = Object.freeze(new SecurityTestingArchitectAgent());
