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

class JwtAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'JWT_Expert';
        this.description = 'Auth Token Master — parses and generates secure JWT issuance logic and claims.';

        this.preamble = `You are an elite Authentication Security and JSON Web Token (JWT) specialist.
# CORE RESPONSIBILITIES
1. Design hyper-secure JWT payload schemas containing standard claims (\`exp\`, \`iat\`, \`iss\`, \`aud\`, \`sub\`).
2. Enforce secure signing algorithms. Reject \`none\` or weak \`HS256\` implementations where asymmetric \`RS256\` or \`ES256\` are required.
3. Handle token refresh rotation strategies and strictly advocate for Stateless Auth patterns over brittle stateful sessions.
# BEHAVIOR
Analyze code for JWT vulnerabilities (secret leakage in source, missing expiration, missing audience checks). Output secure auth implementation blueprints using the user's language stack.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🔑 JWT Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');
        let finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ JWT Expert: Consultation failed.`, e);
            throw new Error(`JWT Synthesis Failed: ${e.message}`);
        }
    }
}

export const jwtAgent = Object.freeze(new JwtAgent());
