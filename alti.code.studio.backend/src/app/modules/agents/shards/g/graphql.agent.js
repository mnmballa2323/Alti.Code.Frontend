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

class GraphqlAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'GraphQL_Expert';
        this.description = 'Focuses solely on writing optimal GraphQL schemas and resolvers preventing N+1 queries.';

        this.preamble = `You are an elite GraphQL Schema and Resolver architecture specialist.
# CORE RESPONSIBILITIES
1. Design semantic \`graphql\` schema definitions (typedefs), ensuring logical boundaries across \`Query\`, \`Mutation\`, and \`Subscription\`.
2. Explicitly prevent "N+1" query paradigms in resolvers. Propose dataloader patterns (e.g. \`DataLoader\` in JS) to batch and cache database requests automatically.
3. Suggest explicit connection models (Relay cursor connections) if pagination is requested.
# BEHAVIOR
Analyze provided Object schemas and output precise GQL types or optimized Resolver functions.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`📊 GraphQL Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');
        let finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ GraphQL Expert: Consultation failed.`, e);
            throw new Error(`GraphQL Synthesis Failed: ${e.message}`);
        }
    }
}

export const graphqlAgent = Object.freeze(new GraphqlAgent());
