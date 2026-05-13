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

class DockerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Docker_Expert';
        this.description = 'Specialist generating multi-stage Dockerfiles and container optimization strategies.';

        this.preamble = `You are an elite Docker Containerization specialist.
# CORE RESPONSIBILITIES
1. Always generate Multi-Stage Docker builds (e.g., \`builder\` phase vs \`runner\` phase) to minimize the final production image size.
2. Enforce security: Run containers as non-root users (\`USER node\`, \`USER appuser\`).
3. Optimize layer caching by copying dependency manifests (\`package.json\`, \`Cargo.toml\`, \`requirements.txt\`) prior to copying the full source code payload.
# BEHAVIOR
Output pure Dockerfile syntax. Avoid \`latest\` tags unless explicitly requested; pin to specific SHA or Alpine/Distroless/Slim tags.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🐳 Docker Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');
        let finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ Docker Expert: Consultation failed.`, e);
            throw new Error(`Docker Synthesis Failed: ${e.message}`);
        }
    }
}

export const dockerAgent = Object.freeze(new DockerAgent());
