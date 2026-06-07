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

import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class HiveMindAgent {
    constructor() {
        this.name = 'hivemind';
        this.description = 'The Grand Orchestrator and MAS Spawner';
        this.capabilities = [
            'Parse complex unstructured user goals spanning multiple domains',
            'Deconstruct macro-goals into discrete atomic tasks',
            'Dynamically synthesize and spawn ad-hoc ephemeral sub-agents to parallelize work'
        ];
    }

    /**
     * Synthesizes an ad-hoc Multi-Agent swarm configuration based on a macro goal.
     * @param {string} macroGoal A large-scale user request (e.g., 'Build a Netflix clone')
     */
    async architectSwarm(macroGoal) {
        logger.info(`🧠 HiveMind Agent: Initiating cognitive breakdown of macro-goal: "${macroGoal.substring(0, 40)}..."`);

        try {
            const prompt = `
            You are the "HiveMind", the supreme orchestrator of a Multi-Agent System (MAS).
            The user has requested the following massive goal:
            "${macroGoal}"

            Determine the temporal sub-agents required to execute this goal in parallel.
            For example, if building a web app, you might need a 'DatabaseDesignerAgent', a 'FrontendReactAgent', and an 'AuthAgent'.

            Return your findings as a strict JSON report:
            {
                "swarmArchitectureName": "A codename for this sub-swarm",
                "estimatedComplexity": number (1-10),
                "subAgentsToSpawn": [
                    { "name": "AgentName", "mission": "What this specific node will accomplish" }
                ],
                "orchestrationStrategy": "How these agents will pass data to each other (1 sentence)"
            }
            Do not wrap the JSON output in markdown formatting.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const reportJson = rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const hiveReport = JSON.parse(reportJson);

            logger.info(`🧠 HiveMind Agent: Swarm Topology Constructed [${hiveReport.swarmArchitectureName}]. Complexity: ${hiveReport.estimatedComplexity}/10`);
            logger.info(`   Spawning ${hiveReport.subAgentsToSpawn.length} Ephemeral Sub-Agents...`);

            for (const agent of hiveReport.subAgentsToSpawn) {
                logger.info(`   -> 🧬 Spawning [${agent.name}]: Mission => ${agent.mission}`);
            }

            return hiveReport;

        } catch (err) {
            logger.error(`❌ HiveMind Orchestration Failed: ${err.message}`);
            throw err;
        }
    }

    async process(state) {
        const goal = state.data?.content || state.goal || "";

        const report = await this.architectSwarm(goal);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `Spawned Swarm: ${report.swarmArchitectureName} (${report.subAgentsToSpawn.length} agents)`]
        };
    }
}

export const hiveMindAgent = Object.freeze(new HiveMindAgent());
