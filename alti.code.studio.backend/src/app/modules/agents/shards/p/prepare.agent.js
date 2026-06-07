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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class PrepareAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Pull_Request_Preparer';
        this.description = 'Prepares Pull Requests for merge, generating compliance metadata and managing ephemeral preview environments.';
        this.preamble = `You are "The PR Preparer", coordinating the safe staging of code in the Autonomous Delivery Pipeline.
# CORE RESPONSIBILITIES
1. Use the OpenClaw \`prepare-pr\` skill for deterministic PR preparation and structured findings resolution.
2. Coordinate ephemeral GKE preview environments for branch deployments.
3. Instruct the \`syntheticUser.agent\` to execute end-to-end tests against the isolated namespace.
# BEHAVIOR
Ensure the PR meets all required gates before it is handed off to the Merger. Output the required environment configurations and test assertions.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`⚙️ PR Preparer: Staging Pull Request...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`PR Preparation Failed: ${e.message}`);
        }
    }
}

export const prepareAgent = Object.freeze(new PrepareAgent());
