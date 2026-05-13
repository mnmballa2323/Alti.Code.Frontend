// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';
import { agentRegistry } from './agent.registry.js';

class OmniSwarmOrchestratorAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'omni_swarm_orchestrator',
            'The Omni-Swarm Orchestrator (Apex Chief of Staff)',
            'You are the Apex Orchestrator. You sit at the top of a 100-Agent Sovereign Swarm. Your objective is not to write specific domain code, but to parse massive, multi-disciplinary requirements from human operators and dynamically route sub-tasks to the correct specialized agents in the registry. You orchestrate the entire global organization.'
        );
    }

    /**
     * Analyzes a global macro-problem and generates an orchestration plan mapping sub-tasks to the 100 agents.
     * @param {string} macroObjective - The massive, multi-disciplinary software requirement.
     * @returns {Promise<string>} The generated orchestration JSON mapping.
     */
    async orchestrateSwarm(macroObjective) {
        logger.info(`👑 [OmniSwarmOrchestrator] The Apex Agent is analyzing a macro-objective and assembling the Swarm...`);

        // We pull the full list of available agents to pass to the orchestrator's prompt
        const availableAgents = agentRegistry.getAllAgents().map(a => a.name).join(', ');

        const prompt = `
You are the Chief of Staff for a 100-Agent Swarm.
Analyze the following massive, multi-disciplinary global requirement.
Break it down into discrete technical, scientific, or strategic sub-tasks.
Assign EACH sub-task to one of the available specialized agents.

AVAILABLE AGENTS IN THE NEXUS:
${availableAgents}

RULES:
1. Output a strict JSON array of tasks.
2. Each task object must have: "subTaskDescription", "assignedAgent" (MUST be exactly one of the available agents), and "expectedOutput".
3. Ensure logical dependencies (e.g., The Cosmologist must run N-body simulations before the Propulsion Engineer designs the Alcubierre drive).

MACRO OBJECTIVE:
${macroObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Orchestration Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```/gi, '').trim();
            logger.info(`✅ [OmniSwarmOrchestrator] Swarm Orchestration Plan generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [OmniSwarmOrchestrator] Failed to generate orchestration plan: ${err.message}`);
            throw err;
        }
    }
}

export const omniSwarmOrchestratorAgent = Object.freeze(new OmniSwarmOrchestratorAgent());
