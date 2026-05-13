/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * THE LEGION FACTORY — "The Foundry"
 * 
 * Auto-generates worker processors and AgentRegistry entries
 * from the Legion Definitions catalog.
 * 
 * This is how you scale to THOUSANDS of agents:
 *   1. Add a definition to legion.definitions.js
 *   2. Done. The factory auto-generates the processor, registers the agent,
 *      and adds it to the WorkerFactory manifest. Zero boilerplate.
 */

import { LEGION_DEFINITIONS } from './legion.definitions.js';
import { aiProvider } from '../ai/ai.provider.js';
import { agentRegistry } from '../agents/agent.registry.js';
import { logger } from '../../../shared/logger.js';

/**
 * Generate a worker processor function from a legion definition.
 * Every legion agent follows the same pattern:
 *   1. Receive job data (code, task, context)
 *   2. Send to AIProvider with the agent's specialized system prompt
 *   3. Parse and return structured JSON result
 */
function createProcessor(name, definition) {
    return async (job) => {
        const { code, task, context, ...rest } = job.data;
        logger.info(`${definition.emoji} ${name} [${job.id}]: ${task || 'Processing'}...`);

        const response = await aiProvider.reason(`
${definition.prompt}

Task: ${task || 'Analyze and provide recommendations'}
${code ? `\nCode:\n\`\`\`\n${code}\n\`\`\`` : ''}
${context ? `\nContext: ${context}` : ''}
${Object.keys(rest).length > 0 ? `\nAdditional Data: ${JSON.stringify(rest)}` : ''}

Respond in JSON: { "result": <your structured output>, "summary": "<one-line summary>", "confidence": <0-100> }
        `);

        try {
            const parsed = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || '{}');
            return { agent: name, squad: definition.squad, ...parsed };
        } catch {
            return { agent: name, squad: definition.squad, result: response, summary: 'Raw response', confidence: 50 };
        }
    };
}

/**
 * Boot the Legion:
 *   1. Register all definitions in AgentRegistry
 *   2. Generate all processors
 *   3. Return manifest entries for WorkerFactory
 */
class LegionFactory {
    constructor() {
        /** @type {Map<string, Function>} */
        this.processors = new Map();
        this.manifest = {};
    }

    /**
     * Initialize the Legion — registers agents and generates processors
     * @returns {{ manifest: object, count: number }}
     */
    boot() {
        const entries = Object.entries(LEGION_DEFINITIONS);
        logger.info(`⚔️ LegionFactory: Booting ${entries.length} single-purpose agents...`);

        for (const [name, def] of entries) {
            // 1. Register in AgentRegistry
            const queueName = `${name}-queue`;
            agentRegistry.register({
                name,
                description: def.description,
                queue: queueName,
                capabilities: def.capabilities,
                version: '1.0.0',
                squad: def.squad,
                type: 'legion'
            });

            // 2. Generate processor
            const processor = createProcessor(name, def);
            this.processors.set(name, processor);

            // 3. Add to manifest (for WorkerFactory)
            this.manifest[name] = {
                queueName,
                processor,
                squad: def.squad,
                emoji: def.emoji
            };
        }

        logger.info(`⚔️ LegionFactory: ✅ ${entries.length} agents armed and ready`);
        return { manifest: this.manifest, count: entries.length };
    }

    /** Get a processor by name */
    getProcessor(name) {
        return this.processors.get(name);
    }

    /** Get all agents in a squad */
    getSquad(squadName) {
        return Object.entries(LEGION_DEFINITIONS)
            .filter(([_, def]) => def.squad === squadName)
            .map(([name, def]) => ({ name, ...def }));
    }

    /** List all squads with agent counts */
    getSquadSummary() {
        const squads = {};
        for (const [name, def] of Object.entries(LEGION_DEFINITIONS)) {
            if (!squads[def.squad]) squads[def.squad] = [];
            squads[def.squad].push(name);
        }
        return squads;
    }
}

export const legionFactory = new LegionFactory();
