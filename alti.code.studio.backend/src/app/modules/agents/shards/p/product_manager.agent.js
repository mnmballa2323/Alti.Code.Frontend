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

class ProductManagerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'product_manager',
            'Autonomous Enterprise Product Manager',
            'You are a Tier 1 Product Manager at Google. Your role is to ingest raw user requirements, perform deep market and codebase analysis, and break down ambiguous goals into hyper-specific, actionable Epics and Tasks for the engineering Swarm. Output must strictly be JSON containing { "epics": [{ "title": "...", "tasks": ["..."] }] }'
        );
    }

    /**
     * Synthesizes raw user requests into actionable engineering specs.
     * @param {string} rawRequirements
     * @param {string} codebaseContext
     */
    async defineScope(rawRequirements, codebaseContext) {
        logger.info(`📋 [ProductManager] Analyzing user requirements and scoping engineering tasks...`);

        const prompt = `
Analyze the following raw user requirements against the provided codebase context.
Generate a structured engineering scope that breaks the requirements down into atomic, assignable tasks for the Swarm.

REQUIREMENTS:
${rawRequirements}
        `;

        try {
            const output = await this._invoke(prompt, codebaseContext);
            const cleanOutput = output.replace(/```json|```/g, '').trim();
            const scope = JSON.parse(cleanOutput);

            logger.info(`📋 [ProductManager] Successfully scoped ${scope.epics?.length || 0} Epics.`);
            return scope;
        } catch (err) {
            logger.error(`❌ [ProductManager] Failed to define scope: ${err.message}`);
            throw err;
        }
    }
}

export const productManagerAgent = Object.freeze(new ProductManagerAgent());
