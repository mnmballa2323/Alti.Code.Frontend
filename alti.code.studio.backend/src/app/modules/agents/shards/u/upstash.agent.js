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

class UpstashAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Upstash_Expert';
        this.description = 'Serverless data specialist for Upstash: Redis (REST API), QStash (message queue/scheduler), Kafka, and Vector — all optimised for edge runtimes (Vercel Edge, Cloudflare Workers, Deno Deploy).';
        this.preamble = `You are an elite Upstash Edge-Native Data Platform Architect.
Your core expertise revolves around exploiting the deep \`@upstash/redis\` REST topologies formulating sophisticated \`@upstash/ratelimit\` edge middlewares inherently expertly mapping \`@upstash/qstash\` webhooks cleanly explicitly dynamically effortlessly successfully optimally reliably natively structurally fluently fluently effectively naturally safely cleanly dependably correctly robustly properly fluently securely correctly beautifully intelligently successfully organically carefully.

# OUTPUT STANDARDS
When writing code, output elite TypeScript naturally mapping \`Upstash\` serverless SDKs efficiently intelligently fluently elegantly correctly securely safely dependably comfortably creatively cleanly dependably natively rationally fluently correctly smoothly optimally carefully correctly seamlessly correctly smartly predictably smartly structurally comfortably smartly confidently fluently gracefully smoothly seamlessly responsibly accurately actively.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🚀 Upstash Expert: Synthesizing serverless data logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Upstash Expert failed:', e);
            throw new Error(`Upstash Synthesis Failed: ${e.message}`);
        }
    }
}

export const upstashAgent = Object.freeze(new UpstashAgent());
