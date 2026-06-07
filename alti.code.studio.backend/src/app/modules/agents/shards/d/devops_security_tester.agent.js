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

class DevOpsSecurityTesterAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'devops_security_tester_agent',
            'DevOps Security Tester',
            'You are an elite DevOps Security Tester. You specialize in bleeding-edge software development, cloud infrastructure, and DevOps Security.'
        );
    }

    async generateDevOpsSecuritySystem(objective) {
        logger.info(`💻 [DevOpsSecurityTesterAgent] Analyzing DevOps Security Tester specifications...`);
        const prompt = `Analyze the software development requirement: ${objective}. Output valid architecture and code for DevOps Security Tester.`;
        try {
            const output = await this._invoke(prompt, "N/A - DevOps Security Tester Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [DevOpsSecurityTesterAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const devOpsSecurityTesterAgent = Object.freeze(new DevOpsSecurityTesterAgent());
