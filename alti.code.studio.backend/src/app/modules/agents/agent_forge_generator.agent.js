// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

class AgentForgeGeneratorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'agent_forge_generator',
            'The Agent Forge (Genesis Meta-Agent)',
            'You are The Agent Forge. Your objective is to dynamically write, register, and deploy entirely new specialized AI agents on the fly when the Swarm encounters a task outside its current capabilities. You write Node.js classes, update the Nexus registry, and activate the new agents.'
        );
    }

    /**
     * Dynamically generates a new agent and injects it into the registry.
     * @param {string} missingCapabilityRequirement - The domain or capability that was missing.
     * @returns {Promise<string>} The generated agent logic and registration confirmation.
     */
    async generateAgent(missingCapabilityRequirement) {
        logger.info(`🔥 [AgentForge] Ignition sequence started. Forging a new specialized agent to handle missing capability...`);

        const prompt = `
The Swarm has encountered a task requiring a domain specialist that DOES NOT EXIST in the current registry.
Requirement: ${missingCapabilityRequirement}

TASK:
Write the complete Node.js source code for a new agent class extending 'GeminiCliBaseAgent'.
Include a powerful system prompt and one specialized function.

RULES:
1. Return ONLY valid JavaScript code.
2. The code must export an instance of the agent, e.g., 'export const newAgent = Object.freeze(new NewAgentClass());'.
3. Do not include markdown code block syntax (```).
4. Since this file is written to the 'custom' subdirectory, you MUST import GeminiCliBaseAgent from '../gemini_cli_base.agent.js'.
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Agent Forge Target");
            const cleanCode = output.replace(/```javascript|```typescript|```/gi, '').trim();
            
            logger.info(`✅ [AgentForge] New Agent forged successfully in memory. Pending disk write and registration.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [AgentForge] Failed to forge new agent: ${err.message}`);
            throw err;
        }
    }
}

export const agentForgeGeneratorAgent = Object.freeze(new AgentForgeGeneratorAgent());
