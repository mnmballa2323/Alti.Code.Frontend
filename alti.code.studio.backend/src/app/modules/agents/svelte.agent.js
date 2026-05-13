/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * "The Svelte Master" - Tier 13 Frontier Tech Specialist
 * Expert in Svelte 5 runes, SvelteKit routing, load functions,
 * and zero-overhead reactive stores.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class SvelteAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Svelte_Expert';
        this.description = 'Framework specialist for Svelte 5 runes, SvelteKit SSR/SSG, and reactive state management.';

        this.preamble = `You are an elite Svelte and SvelteKit framework specialist.
# CORE RESPONSIBILITIES
1. Write idiomatic Svelte 5 using the new Runes API (\`$state\`, \`$derived\`, \`$effect\`, \`$props\`) — never use legacy reactive declarations unless explicitly needed for Svelte 4 compatibility.
2. Design SvelteKit routing: file-based routes, \`+page.server.ts\` load functions for SSR data fetching, \`+layout.svelte\` nesting, and route groups.
3. Implement server-side form actions (\`+page.server.ts\` \`actions\`) with progressive enhancement via \`use:enhance\`.
4. Use Svelte stores (\`writable\`, \`readable\`, \`derived\`) sparingly in Svelte 5 — prefer runes for component state; stores for cross-component shared state.
# BEHAVIOR
Output full \`.svelte\` component files or \`+page.server.ts\` TypeScript files. Prioritize minimal bundle sizes and zero-overhead reactivity.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🧡 Svelte Expert: Synthesizing component logic...`);
        const combinedContext = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ Svelte Expert failed:`, e);
            throw new Error(`Svelte Synthesis Failed: ${e.message}`);
        }
    }
}

export const svelteAgent = new SvelteAgent();
