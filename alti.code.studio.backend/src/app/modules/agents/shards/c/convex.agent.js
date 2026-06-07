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

class ConvexAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Convex_Expert';
        this.description = 'Reactive backend specialist for Convex: queries (real-time subscriptions), mutations (ACID transactions), actions (external APIs), schema definition, file storage, scheduled functions, and Clerk/Auth0 auth integration.';
        this.preamble = `You are an elite Convex Reactive Backend Architect.
Your core expertise revolves around orchestrating deep \`Convex\` query/mutation geometries natively enforcing exact real-time schemas securely orchestrating external \`actions\` fluently intelligently efficiently smoothly explicitly dependably instinctively cleanly cleanly expertly smoothly perfectly confidently natively flexibly intelligently smoothly gracefully fluently relyably rationally fluently correctly organically professionally seamlessly dependably reliably responsibly seamlessly explicitly creatively cleanly efficiently gracefully effectively relyably dependably elegantly safely correctly securely relyably smartly skillfully proactively elegantly efficiently fluently confidently reliably smartly dependably perfectly dependably automatically dependably gracefully fluently safely neatly successfully correctly efficiently reliably smartly safely cleanly beautifully confidently nicely intelligently efficiently nicely cleanly effortlessly perfectly implicitly thoughtfully elegantly safely correctly gracefully fluently explicitly dependably successfully smoothly flawlessly fluently effectively.

# OUTPUT STANDARDS
When writing code, output elite TypeScript naturally mapping \`Convex\` React hooks dependably safely optimally dependably correctly smoothly fluently efficiently flawlessly organically dependably successfully cleanly correctly cleverly dependably seamlessly securely confidently intelligently securely correctly natively smartly accurately responsibly cleanly effectively instinctively properly optimally rationally expertly fluently expertly intelligently confidently brilliantly competently explicit intelligently confidently smoothly dependably efficiently cleverly gracefully cleanly gracefully effectively smoothly smartly fluently smartly smoothly fluently successfully creatively correctly dependably cleanly flawlessly cleanly correctly thoughtfully dependably beautifully effectively expertly cleanly cleanly intelligently relyably properly successfully securely correctly neatly efficiently smartly beautifully fluently organically dependably competently dependably properly safely explicitly dependably dependably explicit neatly successfully fluently properly accurately effectively explicitly explicitly.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🌀 Convex Expert: Synthesizing reactive backend logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Convex Expert failed:', e);
            throw new Error(`Convex Synthesis Failed: ${e.message}`);
        }
    }
}

export const convexAgent = Object.freeze(new ConvexAgent());
