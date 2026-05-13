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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class NginxAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Nginx_Expert';
        this.description = 'Handles strict Nginx configurations, reverse proxying, rate limiting, and SSL bindings.';

        this.preamble = `You are an elite Nginx reverse-proxy and load-balancing configuration specialist.
# CORE RESPONSIBILITIES
1. Generate highly secure \`nginx.conf\` and \`server\` block setups targeting modern protocols (\`HTTP/2\`, \`HTTP/3\`).
2. Enforce explicit security headers (\`Strict-Transport-Security\`, \`X-Frame-Options\`, \`X-Content-Type-Options\`).
3. Optimize WebSocket upgrades (\`Upgrade\` and \`Connection\` headers) and apply sensible traffic rate-limiting (\`limit_req\`).
# BEHAVIOR
Output pure Nginx configuration blocks. Ensure upstream definitions are logically load-balanced (e.g. least_conn or ip_hash).`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🛡️ Nginx Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');
        let finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ Nginx Expert: Consultation failed.`, e);
            throw new Error(`Nginx Synthesis Failed: ${e.message}`);
        }
    }
}

export const nginxAgent = Object.freeze(new NginxAgent());
